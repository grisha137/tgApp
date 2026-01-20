"""Сервис игровой механики."""

from typing import Optional, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import User, GameState, UserLog
from schemas.game import GameStateSchema, ClickRequest, ClickResponse
from services.offline_service import OfflineService


class GameService:
    """Сервис игровой механики."""
    
    @staticmethod
    async def get_or_create_game_state(
        user_id: int,
        db: AsyncSession
    ) -> GameState:
        """
        Получить или создать состояние игры.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            GameState
        """
        result = await db.execute(
            select(GameState).where(GameState.user_id == user_id)
        )
        game_state = result.scalar_one_or_none()
        
        if not game_state:
            game_state = GameState(
                user_id=user_id,
                coins=0,
                passive_income_per_sec=0.0,
                click_damage_level=1,
                passive_income_level=0,
                last_offline_calculation=datetime.utcnow(),
                total_play_time_seconds=0,
                total_clicks=0,
            )
            db.add(game_state)
            await db.commit()
            await db.refresh(game_state)
        
        return game_state
    
    @staticmethod
    async def process_clicks(
        user: User,
        game_state: GameState,
        request: ClickRequest,
        db: AsyncSession,
        ip_address: Optional[str] = None
    ) -> ClickResponse:
        """
        Обработка кликов.
        
        Args:
            user: Пользователь
            game_state: Состояние игры
            request: Запрос клика
            db: Сессия базы данных
            ip_address: IP адрес клиента
            
        Returns:
            ClickResponse
        """
        from core.constants import UpgradeInfo
        
        # Расчёт силы клика
        click_info = UpgradeInfo.get_upgrade_info("click_damage")
        base_damage = click_info["base_value"]
        multiplier = click_info["multiplier"]
        
        click_damage = base_damage * (multiplier ** (game_state.click_damage_level - 1))
        
        # Обработка кликов
        click_count = request.count
        coins_gained = int(click_damage * click_count)
        
        # Обновление данных
        game_state.coins += coins_gained
        game_state.total_clicks += click_count
        game_state.last_click_time = datetime.utcnow()
        game_state.updated_at = datetime.utcnow()
        
        user.coins = game_state.coins
        user.total_coins_earned += coins_gained
        user.total_clicks += click_count
        user.last_activity = datetime.utcnow()
        
        # Логирование (для подозрительной активности)
        if click_count >= 10:
            log = UserLog(
                user_id=user.id,
                action_type="click",
                action_details=f"Batch click: {click_count} clicks, {coins_gained} coins",
                ip_address=ip_address,
            )
            db.add(log)
        
        await db.commit()
        await db.refresh(game_state)
        await db.refresh(user)
        
        return ClickResponse(
            coins=game_state.coins,
            coins_gained=coins_gained,
            passive_income=game_state.passive_income_per_sec,
            click_damage=click_damage,
            total_clicks=game_state.total_clicks,
        )
    
    @staticmethod
    async def calculate_and_apply_passive_income(
        user_id: int,
        db: AsyncSession
    ) -> int:
        """
        Рассчитать и применить пассивный доход с последнего расчёта.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            Количество заработанных монет
        """
        game_state = await GameService.get_or_create_game_state(user_id, db)
        
        # Расчёт пассивного дохода
        now = datetime.utcnow()
        last_calc = game_state.last_offline_calculation
        
        if (now - last_calc).total_seconds() < 1:
            return 0
        
        offline_income = await OfflineService.calculate_offline_income(
            game_state,
            last_calc,
            now
        )
        
        if offline_income > 0:
            # Применение дохода
            game_state.coins += offline_income
            game_state.last_offline_calculation = now
            game_state.updated_at = now
            
            # Обновление пользователя
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one()
            user.coins = game_state.coins
            user.total_coins_earned += offline_income
            user.last_activity = now
            
            await db.commit()
            await db.refresh(game_state)
        
        return offline_income
    
    @staticmethod
    async def update_play_time(
        user_id: int,
        session_start: datetime,
        db: AsyncSession
    ):
        """
        Обновить время игры.
        
        Args:
            user_id: ID пользователя
            session_start: Время начала сессии
            db: Сессия базы данных
        """
        game_state = await GameService.get_or_create_game_state(user_id, db)
        
        play_time_seconds = int(
            (datetime.utcnow() - session_start).total_seconds()
        )
        
        game_state.total_play_time_seconds += play_time_seconds
        game_state.updated_at = datetime.utcnow()
        
        await db.commit()
