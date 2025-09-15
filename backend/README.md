# Bulk Flyer Generator Backend

A secure Express.js backend with PostgreSQL database and JWT authentication for the Bulk Flyer Generator application.

## Features

- **User Authentication**: Email/password registration and login
- **JWT Security**: Secure token-based authentication with refresh tokens
- **PostgreSQL Database**: Robust data storage with proper relationships
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Support**: Secure cross-origin resource sharing
- **TypeScript**: Full type safety and better development experience

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE bulkflyergenerator;
```

2. Create a test database (optional):
```sql
CREATE DATABASE bulkflyergenerator_test;
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update `.env` with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bulkflyergenerator
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout-all` - Logout from all devices

### Shows Management

- `GET /api/shows` - Get all user's shows
- `GET /api/shows/:id` - Get specific show
- `POST /api/shows` - Create new show
- `PUT /api/shows/:id` - Update show
- `DELETE /api/shows/:id` - Delete show
- `POST /api/shows/bulk` - Bulk create shows

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE NOT NULL)
- `password_hash` (VARCHAR NOT NULL)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Refresh Tokens Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `token` (VARCHAR UNIQUE NOT NULL)
- `expires_at` (TIMESTAMP NOT NULL)
- `created_at` (TIMESTAMP)

### Shows Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `date` (VARCHAR NOT NULL)
- `venue_name` (VARCHAR NOT NULL)
- `venue_address` (VARCHAR)
- `city_state` (VARCHAR)
- `show_time` (VARCHAR)
- `event_type` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure access and refresh token system
- **Rate Limiting**: 100 requests per 15 minutes (5 for auth routes)
- **CORS Protection**: Configured for specific frontend URL
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Helmet.js security headers

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Development

The backend uses TypeScript with the following structure:
- `src/config/` - Database and configuration
- `src/middleware/` - Authentication and validation middleware
- `src/routes/` - API route handlers
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions
- `src/__tests__/` - Test files

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a strong, unique `JWT_SECRET`
3. Configure proper CORS origins
4. Set up SSL/TLS for HTTPS
5. Use a reverse proxy (nginx) for better performance
6. Set up database connection pooling
7. Configure proper logging and monitoring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | bulkflyergenerator |
| `DB_USER` | Database username | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Access token expiry | 7d |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 30d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
