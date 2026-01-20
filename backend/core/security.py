"""Безопасность и верификация Telegram initData."""

from typing import Optional
from datetime import datetime, timedelta
import hashlib
import hmac
from urllib.parse import parse_qs
from core.config import get_settings


settings = get_settings()


class TelegramAuthError(Exception):
    """Ошибка аутентификации Telegram."""
    pass


def verify_telegram_init_data(init_data: str) -> dict:
    """
    Верификация Telegram initData.
    
    Args:
        init_data: Строка initData от Telegram WebApp
        
    Returns:
        Словарь с данными пользователя
        
    Raises:
        TelegramAuthError: Если initData невалидна
    """
    if not init_data:
        raise TelegramAuthError("Пустые initData")
    
    if not settings.TELEGRAM_BOT_TOKEN:
        raise TelegramAuthError("Не настроен TELEGRAM_BOT_TOKEN")
    
    # Парсинг initData
    data = parse_qs(init_data)
    
    # Получаем hash из данных
    data_hash = data.pop("hash", [None])[0]
    if not data_hash:
        raise TelegramAuthError("Отсутствует hash в initData")
    
    # Проверка auth_date (не старше 300 секунд)
    auth_date = int(data.get("auth_date", [0])[0])
    current_time = int(datetime.now().timestamp())
    
    if current_time - auth_date > 300:
        raise TelegramAuthError("initData устарела")
    
    # Формирование data_check_string
    # Сортируем ключи по алфавиту и соединяем пары key=value
    data_check_string = "\n".join(
        f"{k}={v[0]}" 
        for k, v in sorted(data.items())
    )
    
    # Генерация secret key
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=settings.TELEGRAM_BOT_TOKEN.encode(),
        digestmod=hashlib.sha256
    ).digest()
    
    # Вычисление hash
    computed_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    # Сравнение hash
    if not hmac.compare_digest(computed_hash, data_hash):
        raise TelegramAuthError("Неверная подпись initData")
    
    # Извлечение данных пользователя
    user_data = {}
    
    if "user" in data:
        from urllib.parse import unquote
        import json
        
        try:
            user_dict = json.loads(unquote(data["user"][0]))
            user_data["telegram_id"] = user_dict.get("id")
            user_data["username"] = user_dict.get("username")
            user_data["first_name"] = user_dict.get("first_name")
            user_data["last_name"] = user_dict.get("last_name")
            user_data["language_code"] = user_dict.get("language_code")
        except (json.JSONDecodeError, KeyError):
            raise TelegramAuthError("Неверный формат данных пользователя")
    
    if not user_data.get("telegram_id"):
        raise TelegramAuthError("Отсутствует telegram_id")
    
    return user_data


def create_access_token(data: dict) -> str:
    """
    Создание JWT токена.
    
    Args:
        data: Данные для токена
        
    Returns:
        JWT токен
    """
    from jose import jwt
    
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Декодирование JWT токена.
    
    Args:
        token: JWT токен
        
    Returns:
        Данные из токена или None если токен невалиден
    """
    from jose import JWTError, jwt
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Верификация пароля (заглушка для будущего расширения)."""
    return True


def get_password_hash(password: str) -> str:
    """Хеширование пароля (заглушка для будущего расширения)."""
    return password
