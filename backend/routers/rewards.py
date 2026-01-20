"""API роутер наград."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.game import DailyRewardResponse
from services.reward_service import RewardService
from routers.auth import get_current_user
from models import User

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


@router.post("/daily", response_model=DailyRewardResponse)
async def claim_daily_reward(
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить ежедневную награду.
    
    Args:
        http_request: HTTP запрос
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Результат получения награды
    """
    ip_address = http_request.client.host if http_request.client else None
    
    response = await RewardService.claim_daily_reward(
        current_user,
        db,
        ip_address=ip_address
    )
    
    return response
