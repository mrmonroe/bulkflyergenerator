# Docker PostgreSQL Setup for Bulk Flyer Generator

This project uses Docker to run PostgreSQL with a persistent volume mount for reliable database storage.

## Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Node.js** (v16 or higher)

## Quick Setup

### 1. Start Docker Desktop
Make sure Docker Desktop is running before proceeding.

### 2. Run the Setup Script
```bash
./setup.sh
```

This will:
- Start PostgreSQL container with persistent volume
- Initialize the database with all required tables
- Install all dependencies
- Set up the complete development environment

### 3. Create an Admin User
```bash
cd backend
node create-admin.js
```

### 4. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm start
```

## Docker Commands

### Start PostgreSQL
```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Stop PostgreSQL
```bash
docker-compose -f docker-compose.dev.yml down
```

### View PostgreSQL Logs
```bash
docker logs bulkflyergenerator-postgres-dev
```

### Access PostgreSQL Database
```bash
docker exec -it bulkflyergenerator-postgres-dev psql -U postgres -d bulkflyergenerator
```

### Remove Everything (including data)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Database Information

- **Host:** localhost
- **Port:** 5432
- **Database:** bulkflyergenerator
- **Username:** postgres
- **Password:** postgres123

## Persistent Storage

The PostgreSQL data is stored in a Docker volume named `postgres_data_dev`. This means:
- ✅ Data persists between container restarts
- ✅ Data persists between Docker Desktop restarts
- ✅ Data persists between system reboots
- ✅ Data is isolated from other projects

## Troubleshooting

### Docker Not Running
```
❌ Docker is not running. Please start Docker Desktop first.
```
**Solution:** Start Docker Desktop and wait for it to fully load.

### Port Already in Use
```
❌ Port 5432 is already in use
```
**Solution:** Stop any existing PostgreSQL services or change the port in `docker-compose.dev.yml`.

### Container Won't Start
```bash
# Check container status
docker ps -a

# View logs
docker logs bulkflyergenerator-postgres-dev

# Restart container
docker-compose -f docker-compose.dev.yml restart postgres
```

### Reset Everything
```bash
# Stop and remove everything including data
docker-compose -f docker-compose.dev.yml down -v

# Remove the volume
docker volume rm bulkflyergenerator_postgres_data_dev

# Start fresh
./setup.sh
```

## Production Deployment

For production, use the full `docker-compose.yml` which includes both PostgreSQL and the backend service:

```bash
docker-compose up -d
```

This will run both services in production mode with proper networking and health checks.
