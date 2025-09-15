#!/bin/bash

# Bulk Flyer Generator Database Setup Script
echo "🐳 Setting up PostgreSQL with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
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

# Initialize database
echo "🔧 Initializing database..."
cd backend
node init-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database setup complete!"
    echo "=========================="
    echo "✅ PostgreSQL container is running"
    echo "✅ Database 'bulkflyergenerator' is created"
    echo "✅ All tables are initialized"
    echo ""
    echo "💡 Next steps:"
    echo "   1. Create an admin user: node create-admin.js"
    echo "   2. Start the backend: npm run dev"
    echo "   3. Start the frontend: npm start"
    echo ""
    echo "🔗 Database connection:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: bulkflyergenerator"
    echo "   Username: postgres"
    echo "   Password: postgres123"
else
    echo "❌ Database initialization failed"
    exit 1
fi
