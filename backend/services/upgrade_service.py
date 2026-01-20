"""Сервис апгрейдов."""

from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from models import User, GameState, Upgrade, UserLog
from schemas.game import UpgradeSchema, UpgradeRequest, UpgradeResponse
from core.constants import UpgradeInfo, UpgradeType


class UpgradeService:
    """Сервис апгрейдов."""
    
    @staticmethod
    async def get_user_upgrades(
        user_id: int,
        db: AsyncSession
    ) -> List[Upgrade]:
        """
        Получить все апгрейды пользователя.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            Список апгрейдов
        """
        result = await db.execute(
            select(Upgrade).where(Upgrade.user_id == user_id)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_or_create_upgrade(
        user_id: int,
        upgrade_type: str,
        db: AsyncSession
    ) -> Upgrade:
        """
        Получить или создать апгрейд.
        
        Args:
            user_id: ID пользователя
            upgrade_type: Тип апгрейда
            db: Сессия базы данных
            
        Returns:
            Upgrade
        """
        result = await db.execute(
            select(Upgrade).where(
                and_(
                    Upgrade.user_id == user_id,
                    Upgrade.upgrade_type == upgrade_type
                )
            )
        )
        upgrade = result.scalar_one_or_none()
        
        if not upgrade:
            upgrade = Upgrade(
                user_id=user_id,
                upgrade_type=upgrade_type,
                level=0,
                purchase_count=0,
                total_spent=0,
            )
            db.add(upgrade)
            await db.commit()
            await db.refresh(upgrade)
        
        return upgrade
    
    @staticmethod
    def calculate_upgrade_price(
        upgrade_type: str,
        current_level: int
    ) -> int:
        """
        Рассчитать цену апгрейда.
        
        Args:
            upgrade_type: Тип апгрейда
            current_level: Текущий уровень
            
        Returns:
            Цена апгрейда
        """
        upgrade_info = UpgradeInfo.get_upgrade_info(upgrade_type)
        base_price = upgrade_info["base_price"]
        
        # new_price = base_price * (1.15 ^ current_level)
        # Для первого апгрейда (level 0 -> 1): base_price * (1.15 ^ 0) = base_price
        price = int(base_price * (1.15 ** current_level))
        
        return price
    
    @staticmethod
    def calculate_upgrade_value(
        upgrade_type: str,
        level: int
    ) -> float:
        """
        Рассчитать значение апгрейда.
        
        Args:
            upgrade_type: Тип апгрейда
            level: Уровень апгрейда
            
        Returns:
            Значение апгрейда
        """
        upgrade_info = UpgradeInfo.get_upgrade_info(upgrade_type)
        base_value = upgrade_info["base_value"]
        multiplier = upgrade_info["multiplier"]
        
        # Для первого уровня (level=1): base_value * (multiplier ^ 0) = base_value
        value = base_value * (multiplier ** (level - 1))
        
        return value
    
    @staticmethod
    async def purchase_upgrade(
        user: User,
        game_state: GameState,
        request: UpgradeRequest,
        db: AsyncSession,
        ip_address: Optional[str] = None
    ) -> UpgradeResponse:
        """
        Покупка апгрейда.
        
        Args:
            user: Пользователь
            game_state: Состояние игры
            request: Запрос покупки
            db: Сессия базы данных
            ip_address: IP адрес клиента
            
        Returns:
            UpgradeResponse
        """
        upgrade_type = request.upgrade_type
        
        # Получение информации об апгрейде
        upgrade_info = UpgradeInfo.get_upgrade_info(upgrade_type)
        max_level = upgrade_info["max_level"]
        
        # Получение апгрейда пользователя
        upgrade = await UpgradeService.get_or_create_upgrade(
            user.id,
            upgrade_type,
            db
        )
        
        # Проверка максимального уровня
        if upgrade.level >= max_level:
            return UpgradeResponse(
                success=False,
                new_coins=game_state.coins,
                upgrade=await UpgradeService._enrich_upgrade_schema(upgrade),
                message=f"Максимальный уровень {max_level} достигнут",
            )
        
        # Расчёт цены
        price = UpgradeService.calculate_upgrade_price(
            upgrade_type,
            upgrade.level
        )
        
        # Проверка баланса
        if game_state.coins < price:
            return UpgradeResponse(
                success=False,
                new_coins=game_state.coins,
                upgrade=await UpgradeService._enrich_upgrade_schema(upgrade),
                message=f"Недостаточно монет. Требуется: {price}",
            )
        
        # Покупка апгрейда
        old_level = upgrade.level
        upgrade.level += 1
        upgrade.purchase_count += 1
        upgrade.total_spent += price
        upgrade.updated_at = datetime.utcnow()
        
        # Обновление состояния игры
        game_state.coins -= price
        
        if upgrade_type == UpgradeType.CLICK_DAMAGE:
            game_state.click_damage_level = upgrade.level
        elif upgrade_type == UpgradeType.PASSIVE_INCOME:
            game_state.passive_income_level = upgrade.level
            # Обновление пассивного дохода
            passive_income = UpgradeService.calculate_upgrade_value(
                upgrade_type,
                upgrade.level
            )
            game_state.passive_income_per_sec = passive_income
        
        game_state.updated_at = datetime.utcnow()
        
        # Обновление пользователя
        user.coins = game_state.coins
        user.last_activity = datetime.utcnow()
        
        # Логирование
        log = UserLog(
            user_id=user.id,
            action_type="upgrade",
            action_details=f"Purchased {upgrade_type} level {upgrade.level} for {price} coins",
            ip_address=ip_address,
        )
        db.add(log)
        
        await db.commit()
        await db.refresh(upgrade)
        await db.refresh(game_state)
        await db.refresh(user)
        
        return UpgradeResponse(
            success=True,
            new_coins=game_state.coins,
            upgrade=await UpgradeService._enrich_upgrade_schema(upgrade),
            message=f"Апгрейд '{upgrade_info['name']}' улучшен до уровня {upgrade.level}!",
        )
    
    @staticmethod
    async def _enrich_upgrade_schema(upgrade: Upgrade) -> UpgradeSchema:
        """
        Обогатить схему апгрейда дополнительными данными.
        
        Args:
            upgrade: Апгрейд
            
        Returns:
            UpgradeSchema с дополнительными полями
        """
        schema = UpgradeSchema.model_validate(upgrade)
        
        # Получение информации об апгрейде
        upgrade_info = UpgradeInfo.get_upgrade_info(upgrade.upgrade_type)
        
        # Текущая цена следующего уровня
        if upgrade.level < upgrade_info["max_level"]:
            schema.current_price = UpgradeService.calculate_upgrade_price(
                upgrade.upgrade_type,
                upgrade.level
            )
        else:
            schema.current_price = None
        
        # Текущее значение
        if upgrade.level > 0:
            schema.current_value = UpgradeService.calculate_upgrade_value(
                upgrade.upgrade_type,
                upgrade.level
            )
        else:
            schema.current_value = 0.0
        
        # Статическая информация
        schema.name = upgrade_info["name"]
        schema.description = upgrade_info["description"]
        schema.icon = upgrade_info["icon"]
        schema.max_level = upgrade_info["max_level"]
        
        return schema
    
    @staticmethod
    async def get_all_enriched_upgrades(
        user_id: int,
        db: AsyncSession
    ) -> List[UpgradeSchema]:
        """
        Получить все обогащённые апгрейды пользователя.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            Список UpgradeSchema
        """
        upgrades = await UpgradeService.get_user_upgrades(user_id, db)
        
        # Убедиться, что все типы апгрейдов существуют
        for upgrade_type in UpgradeType:
            exists = any(u.upgrade_type == upgrade_type.value for u in upgrades)
            if not exists:
                await UpgradeService.get_or_create_upgrade(user_id, upgrade_type.value, db)
        
        # Повторное получение после создания
        upgrades = await UpgradeService.get_user_upgrades(user_id, db)
        
        enriched = []
        for upgrade in upgrades:
            enriched.append(
                await UpgradeService._enrich_upgrade_schema(upgrade)
            )
        
        return enriched
