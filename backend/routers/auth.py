"""API роутер аутентификации."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.game import TelegramAuthRequest, AuthResponse, UserSchema
from services.auth_service import AuthService
from models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Получить текущего пользователя по JWT токену.
    
    Args:
        credentials: JWT токен
        db: Сессия базы данных
        
    Returns:
        Пользователь
        
    Raises:
        HTTPException: Если токен невалиден или пользователь не найден
    """
    from core.security import decode_access_token
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    
    telegram_id_str = payload.get("sub")
    if telegram_id_str is None:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    
    try:
        telegram_id = int(telegram_id_str)
    except ValueError:
        raise HTTPException(status_code=401, detail="Невалидный токен")
    
    user = await AuthService.get_user_by_telegram_id(telegram_id, db)
    
    if user is None:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    
    return user


@router.post("/telegram", response_model=AuthResponse)
async def telegram_auth(
    request: TelegramAuthRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Аутентификация через Telegram initData.
    
    Args:
        request: Данные авторизации
        http_request: HTTP запрос
        db: Сессия базы данных
        
    Returns:
        JWT токен и данные пользователя
    """
    try:
        # Получение IP адреса и User Agent
        ip_address = http_request.client.host if http_request.client else None
        user_agent = http_request.headers.get("user-agent")
        
        access_token, user_schema = await AuthService.authenticate_user(
            request.initData,
            db,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return AuthResponse(
            access_token=access_token,
            user=user_schema
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserSchema)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить текущего пользователя.
    
    Args:
        current_user: Текущий пользователь
        db: Сессия базы данных
        
    Returns:
        Данные пользователя
    """
    await db.refresh(current_user)
    return UserSchema.model_validate(current_user)
