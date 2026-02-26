# 💬 Real-Time Chat Application

> Современное веб-приложение для чатинга в реальном времени с использованием WebSocket, Next.js, NestJS и PostgreSQL

![Technologies](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Technologies](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![Technologies](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Technologies](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-UNLICENSED-green?style=flat-square)

## 📋 Описание проекта

Это демонстрационный проект, который показывает как построить современное веб-приложение для чатинга с использованием:

- **Real-time коммуникация** через WebSocket (Socket.io)
- **Множественные комнаты** для различных групп пользователей
- **Индикатор печатания** (typing indicator) для лучшего UX
- **Сохранение истории сообщений** в базе данных
- **Отслеживание активных пользователей** в каждой комнате
- **Отзывчивый дизайн** для всех устройств

## 🏗️ Архитектура проекта

```
┌─────────────────────────────────────────────────┐
│                    Nginx                        │
│            (Reverse Proxy на порт 80)           │
└──────┬──────────────────────────┬───────────────┘
       │                          │
   ┌───▼────────┐          ┌──────▼──────┐
   │  Next.js   │          │   NestJS    │
   │  Frontend  │          │   Backend   │
   │  (3000)    │          │   (5001)    │
   └────────────┘          └──────┬──────┘
                                  │
                           ┌──────▼──────────┐
                           │   PostgreSQL    │
                           │   (5432)        │
                           └─────────────────┘
```

## 🛠️ Технологический стек

### Backend

- **NestJS 11** - Progressive Node.js framework
- **Socket.io** - Real-time bidirectional communication
- **Prisma 7** - Modern ORM для PostgreSQL
- **PostgreSQL 15** - Надежная relational database
- **TypeScript** - Type-safe разработка

### Frontend

- **Next.js 16** - React framework с SSR/SSG
- **React 19** - Latest version
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS 4** - Utility-first CSS framework
- **Socket.io-client** - WebSocket client
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy & load balancer

## 📦 Структура проекта

```
kkep_chat/
├── api/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts              # Application entry point
│   │   ├── app.module.ts        # Main module configuration
│   │   ├── prisma.service.ts    # Prisma service
│   │   └── chat/
│   │       └── chat.gateway.ts  # WebSocket gateway
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── Dockerfile               # Backend container config
│   └── package.json
│
├── client/                       # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Main chat page
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── globals.css      # Global styles
│   │   └── components/
│   │       ├── chatHeader.tsx   # Chat header component
│   │       ├── chatInput.tsx    # Message input component
│   │       ├── chatMessage.tsx  # Message display component
│   │       ├── connectionDialog.tsx # Connection dialog
│   │       └── ui/              # shadcn/ui components
│   ├── public/                  # Static assets
│   ├── Dockerfile               # Frontend container config
│   └── package.json
│
├── nginx/                        # Nginx configuration
│   ├── nginx.conf               # Nginx server config
│   └── Dockerfile               # Nginx container config
│
├── docker-compose.yaml          # Multi-container orchestration
└── README.md                    # This file
```

## 🚀 Быстрый старт

### Предварительные требования

- **Docker** >= 24.0
- **Docker Compose** >= 2.0

### Установка и запуск

1. **Клонируйте репозиторий:**

```bash
git clone <repository-url>
cd kkep_chat
```

2. **Создайте файл .env:**

```bash
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secret_password_here
POSTGRES_DB=chat_db
EOF
```

2. **Установите зависимости:**

```bash
cd api
npm i

cd client
npm i
```

3. **Запустите приложение:**

```bash
docker-compose up -d --build
```

4. **Откройте в браузере:**

```
http://localhost
```

## 📱 Использование приложения

### Подключение к чату

1. При первом входе откроется диалог подключения
2. Введите ваше имя пользователя
3. Нажмите "Присоединиться"
4. Начните отправлять сообщения в реальном времени

### Основные функции

- **💬 Отправка сообщений** - Пишите сообщения и они появятся у всех пользователей комнаты в реальном времени
- **👥 Список активных пользователей** - Видите кто сейчас в комнате
- **⌨️ Индикатор печатания** - Видите когда другие пользователи печатают
- **📜 История сообщений** - Последние 100 сообщений загружаются при подключении
- **📱 Responsive Design** - Работает на мобильных, планшетах и десктопах
- **🌐 Множественные комнаты** - Поддержка разных чатов (текущая комната: "Каб 104")

## 🔧 Развитие и локальная разработка

### Backend (NestJS)

```bash
cd api

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run start:dev

# Запустите тесты
npm test

# Сборка для production
npm run build
```

### Frontend (Next.js)

```bash
cd client

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev

# Сборка для production
npm run build

# Run linter
npm run lint
```

## 📊 Спецификация API

### WebSocket Events

#### Client → Server

| Event        | Payload                       | Описание                    |
| ------------ | ----------------------------- | --------------------------- |
| `message`    | `{ content, username, room }` | Отправка сообщения          |
| `typing`     | `{ room, username }`          | Уведомление о печатании     |
| `joinRoom`   | `{ room, user }`              | Присоединение к комнате     |
| `getHistory` | `{ room, limit }`             | Получение истории сообщений |

#### Server → Client

| Event         | Payload                                      | Описание                      |
| ------------- | -------------------------------------------- | ----------------------------- |
| `message`     | `{ id, content, username, room, createdAt }` | Новое сообщение               |
| `onlineUsers` | `[ { id, username, room } ]`                 | Список активных пользователей |
| `typing`      | `{ username, room }`                         | Пользователь печатает         |
| `getHistory`  | `{ messages: [] }`                           | История сообщений             |

### REST API

```
GET  /api/health          - Health check
POST /api/messages        - Получить сообщения
GET  /api/users/{room}   - Получить пользователей в комнате
```

## 🗄️ База данных

### Database Schema

```prisma
model Message {
  id        String   @id @default(uuid())
  content   String               // Текст сообщения
  username  String               // Имя отправителя
  room      String   @default("Каб 104")  // Комната чата
  createdAt DateTime @default(now())      // Время создания
}
```

### Миграции

```bash
# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции к БД
npx prisma db push

# Откатить миграции
npx prisma migrate resolve --rolled-back migration_name
```

## 🔐 Безопасность

### CORS Configuration

API настроен для работы с фронтенда на:

- `http://localhost:3000`
- `http://localhost:80`

### WebSocket Security

- ✅ CORS проверка для WebSocket подключений
- ✅ Валидация данных на сервере
- ✅ Таймауты соединения (3600s для Socket.io)
- ✅ Обработка ошибок и отключений

## 📈 Мониторинг и логирование

### Server Logs

Основной сервер логирует:

```
✓ Client connected: socket_id
✓ Client disconnected: socket_id
✓ Message created and broadcasted
✓ Active users updated
✗ Error messages с деталями
```

### Docker Logs

```bash
# Backend logs
docker logs api

# Frontend logs
docker logs client

# Database logs
docker logs postgres

# Nginx logs
docker logs nginx

# All services
docker-compose logs -f
```

## 🐛 Troubleshooting

### Проблема: Сообщения не отправляются

**Решение:**

1. Проверьте что вы подключены: `setIsConnected` должно быть `true`
2. Проверьте браузерную консоль на ошибки
3. Проверьте логи контейнера API: `docker logs api`

### Проблема: Не могу подключиться к серверу

**Решение:**

1. Проверьте что все контейнеры запущены: `docker-compose ps`
2. Проверьте что NEXT_PUBLIC_API_URL правильно настроен
3. Перезагрузите контейнеры: `docker-compose restart`

### Проблема: Database connection error

**Решение:**

1. Убедитесь что PostgreSQL контейнер здоров: `docker-compose ps`
2. Проверьте переменные окружения в .env файле
3. Проверьте локи БД: `docker logs postgres`

## 🚢 Deployment

### Production Build

```bash
# Соберите все контейнеры
docker-compose build

# Запустите в production режиме
docker-compose -f docker-compose.yaml up -d

# Проверьте статус
docker-compose ps
```

### Environment Variables для Production

```env
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=very_strong_password
POSTGRES_DB=chat_prod

NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

### Health Checks

По умолчанию используется health check для PostgreSQL:

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres']
  interval: 10s
  timeout: 5s
  retries: 5
```

## 📝 Best Practices

### Backend Development

- ✅ Используйте TypeScript для type safety
- ✅ Валидируйте входные данные на сервере
- ✅ Обрабатывайте ошибки корректно
- ✅ Логируйте важные события
- ✅ Используйте transactions для сложных операций

### Frontend Development

- ✅ Оптимизируйте renders с помощью React.memo
- ✅ Используйте socket.io reconnection для надежности
- ✅ Handle offline scenarios gracefully
- ✅ Keep UI responsive с async operations
- ✅ Test компоненты перед деплоем

### Docker Best Practices

- ✅ Используйте volume mounts для development
- ✅ Установите health checks
- ✅ Используйте .dockerignore файл
- ✅ Оптимизируйте размер образов
- ✅ Используйте secrets для sensitive data

## 🤝 Contributing

Если вы хотите внести вклад в развитие проекта:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit ваши изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📚 Дополнительные ресурсы

### Документация

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Socket.io Documentation](https://socket.io/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Полезные статьи

- Real-time Chat with NestJS and Socket.io
- Next.js с WebSocket интеграцией
- PostgreSQL для production приложений
- Docker Compose для микросервисов

## 📄 License

This project is UNLICENSED. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Автор

Создано как демонстрационный проект для изучения modern full-stack веб-разработки.

---

<div align="center">

### ⭐ Если проект вам понравился, не забудьте поставить звезду!

Сделано с ❤️ для real-time chat любителей

</div>
