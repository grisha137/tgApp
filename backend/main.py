"""Главный файл FastAPI приложения."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import get_settings
from database import init_db
from routers import (
    auth_router,
    game_router,
    upgrades_router,
    rewards_router,
    users_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan менеджер приложения."""
    # Запуск
    print("Инициализация базы данных...")
    await init_db()
    print("База данных инициализирована")
    
    yield
    
    # Завершение
    print("Завершение работы приложения")


# Создание приложения
app = FastAPI(
    title="Telegram Mini App - Idle Clicker Game API",
    description="Backend API для Telegram Mini App в жанре Idle/Clicker Game",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(auth_router)
app.include_router(game_router)
app.include_router(upgrades_router)
app.include_router(rewards_router)
app.include_router(users_router)


@app.get("/")
async def root():
    """Корневой endpoint."""
    return {
        "message": "Telegram Mini App - Idle Clicker Game API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья приложения."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
