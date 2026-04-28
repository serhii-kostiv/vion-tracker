# Vion Tracker

Fullstack застосунок для відстеження особистих фінансів. Дозволяє керувати рахунками, категоріями та транзакціями (доходи, витрати, перекази).

## Стек технологій

| Шар            | Технологія                       |
| -------------- | -------------------------------- |
| Frontend       | Next.js 16, React 19, TypeScript |
| Backend        | NestJS 11, TypeScript            |
| База даних     | PostgreSQL 17 + Prisma ORM       |
| Кеш            | Redis 7                          |
| Монорепо       | Turborepo + pnpm workspaces      |
| Інфраструктура | Docker Compose                   |

## Структура проєкту

```
vion-tracker/
├── apps/
│   ├── api/          # NestJS REST API
│   └── web/          # Next.js фронтенд
├── packages/
│   ├── database/     # Prisma схема та клієнт
│   ├── eslint-config/       # Спільні ESLint конфіги
│   └── typescript-config/   # Спільні TypeScript конфіги
└── docker-compose.yml
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

### 2. Налаштування змінних середовища

```bash
cp .env.example .env
```

Заповни `.env` файл:

```env
# Application
APPLICATION_PORT=4000
APPLICATION_URL=http://localhost:4000
ALLOWED_ORIGIN=http://localhost:3000

# Database
DATABASE_URL="postgresql://vion:vion@localhost:5432/vion_tracker_db?schema=public"
DB_USER=vion
DB_PASSWORD=vion
DB_NAME=vion_tracker_db
```

### 3. Запуск бази даних

```bash
pnpm db:up
```

### 4. Міграції та генерація Prisma клієнта

```bash
pnpm db:migrate
pnpm db:generate
```

### 5. Запуск у режимі розробки

```bash
pnpm dev
```

- API: [http://localhost:4000](http://localhost:4000)
- Web: [http://localhost:3000](http://localhost:3000)

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
| `pnpm db:migrate`  | Створення та застосування міграцій      |
| `pnpm db:generate` | Генерація Prisma клієнта                |
| `pnpm db:push`     | Синхронізація схеми без міграцій        |
| `pnpm db:studio`   | Відкриття Prisma Studio                 |
| `pnpm db:seed`     | Заповнення БД тестовими даними          |
| `pnpm db:logs`     | Перегляд логів Docker контейнерів       |

## Модель даних

- **User** — користувач з підтримкою мультивалютності
- **Account** — рахунок (готівка, банк, інвестиції, заощадження)
- **Category** — категорія транзакцій (системні та користувацькі)
- **Transaction** — транзакція (дохід / витрата / переказ між рахунками)

## Ліцензія

UNLICENSED — всі права захищені.
