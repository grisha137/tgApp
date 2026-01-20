"""API роутер игровой механики."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.game import (
    GameFullStateSchema,
    ClickRequest,
    ClickResponse,
)
from services.game_service import GameService
from services.upgrade_service import UpgradeService
from services.reward_service import RewardService
from routers.auth import get_current_user
from models import User, GameState

router = APIRouter(prefix="/api/game", tags=["game"])


@router.get("/state", response_model=GameFullStateSchema)
async def get_game_state(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить полное состояние игры.
    
    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Полное состояние игры
    """
    # Расчёт и применение оффлайн-дохода
    offline_income = await GameService.calculate_and_apply_passive_income(
        current_user.id,
        db
    )
    
    # Получение состояния игры
    game_state = await GameService.get_or_create_game_state(
        current_user.id,
        db
    )
    
    # Получение апгрейдов
    upgrades = await UpgradeService.get_all_enriched_upgrades(
        current_user.id,
        db
    )
    
    # Получение информации о ежедневной награде
    daily_reward = await RewardService.get_daily_reward_info(
        current_user.id,
        db
    )
    
    # Обновление данных пользователя
    await db.refresh(current_user)
    
    return GameFullStateSchema(
        user=await get_user_schema(current_user),
        game_state=await get_game_state_schema(game_state),
        upgrades=upgrades,
        daily_reward=daily_reward,
        last_offline_income=offline_income,
    )


@router.post("/click", response_model=ClickResponse)
async def click(
    request: ClickRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Обработать клики.
    
    Args:
        request: Запрос клика
        http_request: HTTP запрос
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Результат клика
    """
    # Rate limiting: максимум 100 кликов за 10 секунд
    # Для простоты реализуем через логирование
    
    game_state = await GameService.get_or_create_game_state(
        current_user.id,
        db
    )
    
    ip_address = http_request.client.host if http_request.client else None
    
    response = await GameService.process_clicks(
        current_user,
        game_state,
        request,
        db,
        ip_address=ip_address
    )
    
    return response


async def get_user_schema(user: User):
    """Получить схему пользователя."""
    from schemas.game import UserSchema
    return UserSchema.model_validate(user)


async def get_game_state_schema(game_state: GameState):
    """Получить схему состояния игры."""
    from schemas.game import GameStateSchema
    return GameStateSchema.model_validate(game_state)
