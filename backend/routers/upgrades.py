"""API роутер апгрейдов."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.game import (
    UpgradeRequest,
    UpgradeResponse,
)
from services.upgrade_service import UpgradeService
from services.game_service import GameService
from routers.auth import get_current_user
from models import User

router = APIRouter(prefix="/api/upgrades", tags=["upgrades"])


@router.post("/purchase", response_model=UpgradeResponse)
async def purchase_upgrade(
    request: UpgradeRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Купить апгрейд.
    
    Args:
        request: Запрос покупки
        http_request: HTTP запрос
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Результат покупки
    """
    # Rate limiting: максимум 1 апгрейд в 2 секунды
    # Для простоты реализуем через логирование
    
    game_state = await GameService.get_or_create_game_state(
        current_user.id,
        db
    )
    
    ip_address = http_request.client.host if http_request.client else None
    
    response = await UpgradeService.purchase_upgrade(
        current_user,
        game_state,
        request,
        db,
        ip_address=ip_address
    )
    
    return response
