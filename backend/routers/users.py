"""API роутер статистики пользователей."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from schemas.game import UserStatsSchema
from services.game_service import GameService
from services.upgrade_service import UpgradeService
from routers.auth import get_current_user
from models import User, GameState, DailyReward

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/stats", response_model=UserStatsSchema)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить статистику пользователя.
    
    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Статистика пользователя
    """
    # Получение состояния игры
    game_state = await GameService.get_or_create_game_state(
        current_user.id,
        db
    )
    
    # Получение ежедневной награды
    result = await db.execute(
        select(DailyReward).where(DailyReward.user_id == current_user.id)
    )
    daily_reward = result.scalar_one_or_none()
    
    # Расчёт ранга
    rank_result = await db.execute(
        select(func.count(User.id)).where(User.total_coins_earned > current_user.total_coins_earned)
    )
    rank = rank_result.scalar() + 1
    
    # Получение общего количества апгрейдов
    upgrades = await UpgradeService.get_user_upgrades(current_user.id, db)
    total_upgrades = sum(u.purchase_count for u in upgrades)
    
    return UserStatsSchema(
        rank=rank,
        total_coins=current_user.total_coins_earned,
        total_clicks=game_state.total_clicks,
        play_time_hours=round(game_state.total_play_time_seconds / 3600, 2),
        achievements_count=0,  # TODO: Добавить систему достижений
        click_damage_level=game_state.click_damage_level,
        passive_income_level=game_state.passive_income_level,
        passive_income_per_sec=game_state.passive_income_per_sec,
        current_streak=daily_reward.current_streak if daily_reward else 0,
        max_streak=daily_reward.max_streak if daily_reward else 0,
        total_upgrades_purchased=total_upgrades,
    )
