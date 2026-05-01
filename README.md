# Vion Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-orange)](https://pnpm.io)

Fullstack застосунок для відстеження особистих фінансів. Дозволяє керувати рахунками, категоріями та транзакціями (доходи, витрати, перекази).

## Стек технологій

| Шар            | Технологія                             |
| -------------- | -------------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript       |
| Backend        | NestJS 11, TypeScript                  |
| База даних     | PostgreSQL + Prisma ORM 7              |
| Кеш / Сесії    | Redis 7 + ioredis + connect-redis      |
| Аутентифікація | express-session (cookie-based), argon2 |
| Email          | Nodemailer + React Email + Gmail SMTP  |
| Монорепо       | Turborepo + pnpm workspaces            |
| Інфраструктура | Docker Compose                         |

## Структура проєкту

```
vion-tracker/
├── apps/
│   ├── api/                    # NestJS REST API (port 4000)
│   │   └── src/
│   │       ├── common/         # Guards, decorators, filters, interceptors
│   │       ├── core/           # Config, Prisma, Redis
│   │       ├── libs/           # Mail (templates + service)
│   │       ├── modules/
│   │       │   ├── auth/       # Auth модуль (account, session, verification, ...)
│   │       │   └── health/     # Health check
│   │       └── shared/         # Utils, types
│   └── web/                    # Next.js фронтенд (port 3000)
├── packages/
│   ├── database/               # Prisma схема, клієнт, міграції
│   ├── eslint-config/          # Спільні ESLint конфіги
│   └── typescript-config/      # Спільні TypeScript конфіги
├── docker-compose.yml
└── .env.example
```

## Вимоги

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://www.docker.com/) та Docker Compose

## Швидкий старт

### 1. Клонування та встановлення залежностей

```bash
git clone <repo-url>
cd vion-tracker
pnpm install
```

> `pnpm install` автоматично генерує Prisma клієнт через `postinstall` скрипт.

### 2. Налаштування змінних середовища

```bash
cp .env.example .env
```

Заповни `.env` (всі змінні описані в `.env.example`):

```env
# Application
NODE_ENV=development
APPLICATION_PORT=4000
APPLICATION_URL=http://localhost:4000
ALLOWED_ORIGIN=http://localhost:3000

# Database
DB_USER=vion
DB_PASSWORD=vion
DB_NAME=vion_tracker_db
DATABASE_URL="postgresql://vion:vion@localhost:5432/vion_tracker_db?schema=public"

# Redis
REDIS_USER=default
REDIS_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URI=redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}

# Mail — потрібен Gmail App Password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_LOGIN=your@gmail.com
MAIL_PASSWORD=your_app_password

# Session
SESSION_SECRET=your-secret-min-16-chars
SESSION_NAME=vion.sid
SESSION_DOMAIN=localhost
SESSION_MAX_AGE=7d
SESSION_HTTP_ONLY=true
SESSION_SECURE=false
SESSION_FOLDER=vion:session:
```

> **Gmail App Password**: [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App passwords

### 3. Запуск інфраструктури (PostgreSQL + Redis)

```bash
pnpm db:up
```

### 4. Міграції бази даних

```bash
pnpm db:migrate
```

### 5. Запуск у режимі розробки

```bash
pnpm dev
```

- API: [http://localhost:4000](http://localhost:4000)
- Swagger: [http://localhost:4000/docs](http://localhost:4000/docs)
- Web: [http://localhost:3000](http://localhost:3000)

---

## Доступні команди

### Розробка

| Команда            | Опис                                 |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Запуск всіх застосунків у dev режимі |
| `pnpm build`       | Збірка всіх застосунків              |
| `pnpm lint`        | Перевірка коду лінтером              |
| `pnpm check-types` | Перевірка TypeScript типів           |
| `pnpm format`      | Форматування коду через Prettier     |

### База даних

| Команда            | Опис                                    |
| ------------------ | --------------------------------------- |
| `pnpm db:up`       | Запуск PostgreSQL та Redis через Docker |
| `pnpm db:down`     | Зупинка та видалення контейнерів        |
| `pnpm db:stop`     | Зупинка контейнерів (без видалення)     |
| `pnpm db:restart`  | Перезапуск контейнерів                  |
| `pnpm db:logs`     | Перегляд логів Docker контейнерів       |
| `pnpm db:migrate`  | Створення та застосування міграцій      |
| `pnpm db:generate` | Генерація Prisma клієнта                |
| `pnpm db:push`     | Синхронізація схеми без міграцій        |
| `pnpm db:studio`   | Відкриття Prisma Studio                 |
| `pnpm db:seed`     | Заповнення БД тестовими даними          |

---

## Auth модуль

Аутентифікація побудована на сесіях (cookie + Redis). Детальна документація: [`apps/api/src/modules/auth/README.md`](apps/api/src/modules/auth/README.md)

### Основні endpoints

| Метод | Маршрут                                | Публічний | Опис                     |
| ----- | -------------------------------------- | --------- | ------------------------ |
| POST  | `/auth/register`                       | ✅        | Реєстрація               |
| POST  | `/auth/session/login`                  | ✅        | Вхід                     |
| POST  | `/auth/session/logout`                 | ❌        | Вихід                    |
| GET   | `/auth/profile`                        | ❌        | Профіль користувача      |
| POST  | `/auth/verify`                         | ✅        | Верифікація email        |
| POST  | `/auth/password-recovery/reset`        | ✅        | Запит на скидання пароля |
| POST  | `/auth/password-recovery/new-password` | ✅        | Встановити новий пароль  |
| POST  | `/auth/deactivate`                     | ❌        | Деактивація акаунту      |
| POST  | `/auth/deactivate/reactivate`          | ✅        | Реактивація акаунту      |

---

## Модель даних

```
User ──< Account ──< Transaction
User ──< Category ──< Transaction
User ──< Token
```

- **User** — користувач з підтримкою мультивалютності, верифікацією email та деактивацією
- **Account** — рахунок (CASH, BANK, INVESTMENT, SAVINGS)
- **Category** — категорія транзакцій (системні та користувацькі)
- **Transaction** — транзакція (INCOME / EXPENSE / TRANSFER)
- **Token** — одноразові токени (EMAIL_VERIFY, PASSWORD_RESET, DEACTIVATE_ACCOUNT)

---

## Contributing

Внески вітаються! Відкрийте Issue або Pull Request.

## Ліцензія

[MIT](LICENSE) © [Serhii Kostiv](https://github.com/serhiikostiv)
