# 🚀 Руководство по установке и настройке

Подробная инструкция по установке и настройке Telegram Mini App - Idle Clicker Game.

## 📋 Предварительные требования

### Обязательно
- **Docker** 20.10+ и **Docker Compose** 2.0+
- **Git** для клонирования репозитория

### Опционально (для локальной разработки)
- **Node.js** 18+ и **npm** 9+
- **Python** 3.11+ и **pip**
- **PostgreSQL** 15+ (если не используете Docker)

## 📦 Установка через Docker (Рекомендуется)

### Шаг 1: Клонирование репозитория

```bash
git clone <repository-url>
cd tgApp
```

### Шаг 2: Создание Telegram бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный **Bot Token**

### Шаг 3: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cp backend/.env.example .env
```

Отредактируйте `.env`:

```env
# Database (для Docker)
DATABASE_URL=postgresql+asyncpg://tg_game:tg_game_password@postgres:5432/tg_game

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# JWT - обязательно измените в production!
SECRET_KEY=ваш-секретный-ключ-минимум-32-символа
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Rate Limiting
MAX_REQUESTS_PER_HOUR=1000
MAX_CLICKS_PER_10_SECONDS=100
MAX_UPGRADES_PER_2_SECONDS=1

# Game Balance
CLICK_DAMAGE_BASE_PRICE=100
PASSIVE_INCOME_BASE_PRICE=1000
MAX_UPGRADE_LEVEL=50
OFFLINE_INCOME_MAX_HOURS=8

# Daily Reward
DAILY_REWARD_BASE=500
DAILY_REWARD_STREAK_BONUS=100
MAX_STREAK_DAYS=30

# CORS - добавьте ваш домен для production
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### Шаг 4: Запуск через Docker Compose

```bash
# Сборка и запуск всех контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Проверка статуса
docker-compose ps
```

### Шаг 5: Проверка установки

Откройте в браузере:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 💻 Локальная установка (для разработки)

### Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск development сервера
npm run dev

# Сборка для production
npm run build

# Linting
npm run lint
```

### Backend

```bash
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация (Linux/Mac)
source venv/bin/activate

# Активация (Windows)
venv\Scripts\activate

# Установка зависимостей
pip install -r requirements.txt

# Создание .env файла
cp .env.example .env
# Отредактируйте .env с вашими настройками

# Инициализация базы данных
python -c "from database import init_db; import asyncio; asyncio.run(init_db())"

# Запуск сервера
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database (PostgreSQL)

Если вы не используете Docker для PostgreSQL:

```bash
# Установка PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Создание пользователя и базы данных
sudo -u postgres psql

CREATE USER tg_game WITH PASSWORD 'tg_game_password';
CREATE DATABASE tg_game OWNER tg_game;
\q
```

Обновите `DATABASE_URL` в `.env`:
```env
DATABASE_URL=postgresql+asyncpg://tg_game:tg_game_password@localhost:5432/tg_game
```

## 🔧 Настройка Telegram Mini App

### 1. Создание Web App

1. Откройте [@BotFather](https://t.me/botfather)
2. Отправьте `/newapp`
3. Выберите вашего бота
4. Введите название приложения
5. Введите URL вашего приложения

**Для локальной разработки** используйте ngrok:
```bash
# Установка ngrok
# https://ngrok.com/download

# Запуск туннеля
ngrok http 5173

# Скопируйте HTTPS URL (например: https://abc123.ngrok.io)
```

**Для production** используйте ваш домен с HTTPS.

### 2. Настройка Webhook (опционально)

Для production рекомендуется настроить webhook вместо polling:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/webhook"}'
```

## 🗄️ Миграции базы данных

Приложение использует автоматическое создание таблиц при первом запуске. Для продакшена рекомендуется использовать Alembic.

### Установка Alembic

```bash
pip install alembic
```

### Инициализация Alembic

```bash
cd backend
alembic init alembic
```

### Настройка alembic.ini

```ini
# alembic.ini
sqlalchemy.url = postgresql+asyncpg://tg_game:tg_game_password@localhost:5432/tg_game
```

### Создание первой миграции

```bash
alembic revision --autogenerate -m "Initial migration"
```

### Применение миграции

```bash
alembic upgrade head
```

## 🐛 Troubleshooting

### Проблема: База данных не подключается

**Решение:**
```bash
# Проверьте статус контейнера PostgreSQL
docker-compose ps postgres

# Перезапустите базу данных
docker-compose restart postgres

# Проверьте логи
docker-compose logs postgres
```

### Проблема: Frontend не может подключиться к backend

**Решение:**
```bash
# Убедитесь, что backend запущен
docker-compose ps backend

# Проверьте CORS настройки в .env
CORS_ORIGINS=["http://localhost:5173"]
```

### Проблема: Ошибка аутентификации Telegram

**Решение:**
1. Убедитесь, что `TELEGRAM_BOT_TOKEN` правильный
2. Проверьте, что вы используете приложение через Telegram WebApp
3. Для локальной разработки используется тестовый initData

### Проблема: Docker контейнеры не стартуют

**Решение:**
```bash
# Очистите все контейнеры и volumes
docker-compose down -v

# Пересоберите образы
docker-compose build --no-cache

# Запустите заново
docker-compose up -d
```

## 🔒 Production настройка

### 1. Безопасность

```env
# Обязательно измените SECRET_KEY
SECRET_KEY=$(openssl rand -hex 32)

# Используйте production базу данных
DATABASE_URL=postgresql+asyncpg://user:password@production-db:5432/tg_game

# Настройте CORS только для вашего домена
CORS_ORIGINS=["https://yourdomain.com"]
```

### 2. SSL/HTTPS

Для production **обязательно** используйте HTTPS. Можно использовать:
- Let's Encrypt (бесплатно)
- Cloudflare SSL
- Certbot

### 3. Мониторинг

Рекомендуемые инструменты:
- **Sentry** - логирование ошибок
- **Prometheus + Grafana** - метрики
- **Uptime Robot** - мониторинг доступности

### 4. Backup

Настройте регулярный backup базы данных:

```bash
# Backup
docker-compose exec postgres pg_dump -U tg_game tg_game > backup.sql

# Restore
docker-compose exec -T postgres psql -U tg_game tg_game < backup.sql
```

### 5. Масштабирование

Для большого количества пользователей:
- Используйте PostgreSQL на отдельном сервере
- Добавьте Redis для кэширования
- Настройте load balancer (nginx)
- Используйте несколько инстансов backend

## 📞 Поддержка

Если у вас возникли проблемы:
1. Проверьте раздел Troubleshooting
2. Посмотрите логи: `docker-compose logs -f`
3. Откройте Issue на GitHub с подробным описанием

---

Удачи с установкой! 🎉
