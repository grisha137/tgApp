"""Сервис аутентификации."""

from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import User, UserLog
from schemas.game import UserSchema
from core.security import (
    verify_telegram_init_data,
    create_access_token,
)
from core.constants import LogLevel


class AuthService:
    """Сервис аутентификации."""
    
    @staticmethod
    async def authenticate_user(
        init_data: str,
        db: AsyncSession,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> tuple[str, UserSchema]:
        """
        Аутентификация пользователя через Telegram initData.
        
        Args:
            init_data: Telegram initData
            db: Сессия базы данных
            ip_address: IP адрес клиента
            user_agent: User Agent клиента
            
        Returns:
            Кортеж (access_token, user_schema)
            
        Raises:
            TelegramAuthError: Если initData невалидна
        """
        # Верификация initData
        user_data = verify_telegram_init_data(init_data)
        
        telegram_id = user_data["telegram_id"]
        
        # Поиск или создание пользователя
        result = await db.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Создание нового пользователя
            user = User(
                telegram_id=telegram_id,
                username=user_data.get("username"),
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                language_code=user_data.get("language_code"),
                coins=0,
                total_clicks=0,
                total_coins_earned=0,
                created_at=datetime.utcnow(),
                last_login=datetime.utcnow(),
                last_activity=datetime.utcnow(),
            )
            db.add(user)
            await db.flush()
            
            # Логирование
            log = UserLog(
                user_id=user.id,
                action_type="auth",
                action_details="New user registered",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(log)
        else:
            # Обновление существующего пользователя
            if user_data.get("username"):
                user.username = user_data["username"]
            if user_data.get("first_name"):
                user.first_name = user_data["first_name"]
            if user_data.get("last_name"):
                user.last_name = user_data["last_name"]
            
            user.last_login = datetime.utcnow()
            user.last_activity = datetime.utcnow()
            
            # Логирование
            log = UserLog(
                user_id=user.id,
                action_type="auth",
                action_details="User login",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            db.add(log)
        
        await db.commit()
        await db.refresh(user)
        
        # Создание JWT токена
        access_token = create_access_token({"sub": str(user.telegram_id)})
        
        return access_token, UserSchema.model_validate(user)
    
    @staticmethod
    async def get_user_by_telegram_id(
        telegram_id: int,
        db: AsyncSession
    ) -> Optional[User]:
        """
        Получить пользователя по telegram_id.
        
        Args:
            telegram_id: Telegram ID пользователя
            db: Сессия базы данных
            
        Returns:
            Пользователь или None
        """
        result = await db.execute(
            select(User).where(User.telegram_id == telegram_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_id(user_id: int, db: AsyncSession) -> Optional[User]:
        """
        Получить пользователя по ID.
        
        Args:
            user_id: ID пользователя
            db: Сессия базы данных
            
        Returns:
            Пользователь или None
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
