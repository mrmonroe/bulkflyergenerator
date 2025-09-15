#!/bin/bash

# Bulk Flyer Generator Backend Setup Script
echo "🚀 Setting up Bulk Flyer Generator Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL v12 or higher."
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Check if database exists
echo "🔍 Checking database connection..."
DB_NAME=$(grep DB_NAME .env | cut -d'=' -f2)
DB_USER=$(grep DB_USER .env | cut -d'=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d'=' -f2)
DB_HOST=$(grep DB_HOST .env | cut -d'=' -f2)
DB_PORT=$(grep DB_PORT .env | cut -d'=' -f2)

if [ "$DB_NAME" = "your_username" ] || [ "$DB_PASSWORD" = "your_password" ]; then
    echo "⚠️  Please update your database credentials in the .env file before running the server."
    echo "   Edit backend/.env and set:"
    echo "   - DB_USER=your_actual_username"
    echo "   - DB_PASSWORD=your_actual_password"
    echo "   - DB_NAME=bulkflyergenerator"
    echo "   - JWT_SECRET=your_super_secret_jwt_key_here"
fi

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Create the database: createdb bulkflyergenerator"
echo "3. Start the backend: cd backend && npm run dev"
echo "4. Start the frontend: npm start"
echo ""
echo "The backend will be available at http://localhost:5000"
echo "The frontend will be available at http://localhost:3000"
