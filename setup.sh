#!/bin/bash

# Bulk Flyer Generator Complete Setup Script
echo "🚀 Setting up Bulk Flyer Generator with Docker PostgreSQL"
echo "========================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Start PostgreSQL container
echo "🐳 Starting PostgreSQL container..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while ! docker exec bulkflyergenerator-postgres-dev pg_isready -U postgres -d bulkflyergenerator > /dev/null 2>&1; do
    if [ $counter -eq $timeout ]; then
        echo "❌ PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
    echo "   Waiting... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ PostgreSQL is ready!"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Initialize database
echo "🔧 Initializing database..."
node init-db.js

if [ $? -ne 0 ]; then
    echo "❌ Database initialization failed"
    exit 1
fi

# Go back to root directory
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "✅ PostgreSQL container is running with persistent volume"
echo "✅ Database 'bulkflyergenerator' is created and initialized"
echo "✅ Backend dependencies installed"
echo "✅ Frontend dependencies installed"
echo ""
echo "💡 Next steps:"
echo "   1. Create an admin user:"
echo "      cd backend && node create-admin.js"
echo ""
echo "   2. Start the backend (in a new terminal):"
echo "      cd backend && npm run dev"
echo ""
echo "   3. Start the frontend (in another terminal):"
echo "      npm start"
echo ""
echo "🔗 Database connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: bulkflyergenerator"
echo "   Username: postgres"
echo "   Password: postgres123"
echo ""
echo "🐳 Docker commands:"
echo "   Stop database: docker-compose -f docker-compose.dev.yml down"
echo "   View logs: docker logs bulkflyergenerator-postgres-dev"
echo "   Access database: docker exec -it bulkflyergenerator-postgres-dev psql -U postgres -d bulkflyergenerator"
