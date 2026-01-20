# Telegram Mini App - Idle Clicker Game 🎮💰

Production-ready Telegram Mini App в жанре Idle/Clicker Game с полноценной игровой механикой, системой апгрейдов и наград.

## 🚀 Технологии

### Frontend
- **React 18** + **TypeScript** + **Vite** - современный стек для быстрой разработки
- **TailwindCSS** - utility-first CSS для быстрого стайлинга
- **React Router** - навигация в приложении
- **Axios** - HTTP клиент для API запросов

### Backend
- **Python 3.11** + **FastAPI** - быстрый и современный веб-фреймворк
- **SQLAlchemy 2.0** - ORM для работы с базой данных
- **PostgreSQL 15** - надёжная реляционная база данных
- **Pydantic** - валидация данных
- **python-jose** - работа с JWT токенами

### DevOps
- **Docker** + **Docker Compose** - контейнеризация и оркестрация
- **Nginx** - reverse proxy для production

## ✨ Возможности

### Игровая механика
- 🖱️ **Кликер** - нажимай и зарабатывай монеты
- ⚡ **Система апгрейдов** - улучшай силу клика и пассивный доход
- 💤 **Оффлайн-доход** - зарабатывай даже когда не в игре (до 8 часов)
- 🎁 **Ежедневные награды** - получай бонусы каждый день с системой streak
- 📊 **Статистика** - отслеживай свой прогресс и ранг в таблице лидеров

### Безопасность
- 🔐 **Telegram initData верификация** - защита через HMAC-SHA256
- 🛡️ **JWT авторизация** - безопасный доступ к API
- ⚡ **Rate limiting** - защита от злоупотреблений
- ✅ **Серверная валидация** - все операции проверяются на сервере

### UI/UX
- 📱 **Mobile-first** дизайн, оптимизированный для Telegram
- 🎨 **Тёмная тема** с поддержкой цветов Telegram
- ✨ **Плавные анимации** - частицы при клике, hover эффекты
- 🌐 **Адаптивный интерфейс** - корректно отображается на любых экранах

## 📁 Структура проекта

```
tgApp/
├── backend/                 # Backend (FastAPI)
│   ├── core/               # Ядро приложения
│   │   ├── config.py       # Конфигурация
│   │   ├── security.py     # Безопасность и JWT
│   │   └── constants.py    # Константы игры
│   ├── models/             # SQLAlchemy модели
│   │   ├── user.py         # Пользователь
│   │   ├── game.py         # Состояние игры
│   │   └── upgrade.py      # Апгрейды и награды
│   ├── schemas/            # Pydantic схемы
│   │   └── game.py         # API модели
│   ├── routers/            # API эндпоинты
│   │   ├── auth.py         # Авторизация
│   │   ├── game.py         # Игровая механика
│   │   ├── upgrades.py     # Апгрейды
│   │   ├── rewards.py      # Награды
│   │   └── users.py        # Статистика
│   ├── services/           # Бизнес-логика
│   │   ├── auth_service.py
│   │   ├── game_service.py
│   │   ├── upgrade_service.py
│   │   ├── reward_service.py
│   │   └── offline_service.py
│   ├── database.py         # Конфигурация БД
│   ├── main.py             # Точка входа
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # Frontend (React)
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   │   ├── ClickButton.tsx
│   │   │   ├── UpgradeCard.tsx
│   │   │   ├── DailyRewardBanner.tsx
│   │   │   └── Navigation.tsx
│   │   ├── pages/          # Страницы приложения
│   │   │   ├── GamePage.tsx
│   │   │   ├── UpgradesPage.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── services/       # API и Telegram интеграция
│   │   │   ├── api.ts
│   │   │   └── telegram.ts
│   │   ├── hooks/          # React хуки
│   │   │   ├── useGameState.ts
│   │   │   └── useTelegram.ts
│   │   ├── types/          # TypeScript типы
│   │   │   └── index.ts
│   │   ├── utils/          # Утилиты
│   │   │   ├── formatting.ts
│   │   │   └── animations.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml      # Docker Compose конфиг
├── README.md               # Этот файл
├── SETUP.md               # Инструкция по установке
├── API.md                 # Документация API
├── ARCHITECTURE.md        # Описание архитектуры
└── EXTENSION_GUIDE.md     # Гайд по расширению

```

## 🎮 Игровая экономика

### Система апгрейдов

**Сила клика** (⚡)
- Базовая цена: 100 монет
- Базовое значение: 1 монета за клик
- Множитель: 1.5x за уровень
- Максимальный уровень: 50

**Пассивный доход** (💰)
- Базовая цена: 1,000 монет
- Базовое значение: 0.1 монет/сек
- Множитель: 1.2x за уровень
- Максимальный уровень: 50

### Формулы

**Цена апгрейда:**
```
price = base_price × (1.15^current_level)
```

**Значение апгрейда:**
```
value = base_value × (multiplier^(level - 1))
```

**Оффлайн-доход:**
```
income = passive_income_per_sec × offline_seconds
```
(максимум 8 часов)

**Ежедневная награда:**
```
reward = 500 + (100 × min(streak, 30))
```

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Telegram Bot Token ([@BotFather](https://t.me/botfather))

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd tgApp
```

2. **Создайте файл .env**
```bash
cp backend/.env.example .env
```

3. **Заполните переменные окружения**
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
SECRET_KEY=your-secret-key-min-32-chars
```

4. **Запустите с помощью Docker Compose**
```bash
docker-compose up -d
```

5. **Доступ к приложению**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📖 Документация

- [SETUP.md](SETUP.md) - Подробная инструкция по установке и настройке
- [API.md](API.md) - Полная документация API
- [ARCHITECTURE.md](ARCHITECTURE.md) - Описание архитектуры и паттернов
- [EXTENSION_GUIDE.md](EXTENSION_GUIDE.md) - Гайд по добавлению нового функционала

## 🔧 Разработка

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Linting и форматирование
```bash
# Frontend
npm run lint

# Backend (опционально)
pip install black flake8
black backend/
flake8 backend/
```

## 🐳 Docker

### Сборка образов
```bash
docker-compose build
```

### Запуск контейнеров
```bash
docker-compose up -d
```

### Просмотр логов
```bash
docker-compose logs -f
```

### Остановка контейнеров
```bash
docker-compose down
```

## 🔐 Безопасность

- Вся аутентификация происходит через Telegram initData
- JWT токены с коротким сроком действия
- Rate limiting для защиты от DDoS
- Серверная валидация всех игровых операций
- HTTPS обязателен для production

## 📝 Лицензия

MIT License - см. файл LICENSE для деталей

## 🤝 Вклад

Вклады приветствуются! Пожалуйста, создайте Pull Request или откройте Issue.

## 📞 Поддержка

Если у вас есть вопросы или проблемы, откройте Issue на GitHub.

---

Создано с ❤️ для Telegram Mini Apps
