#!/bin/bash

echo "🚀 Drive Me Nuts - Setup Wizard"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running or not installed."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "How will you test the mobile app?"
echo ""
echo "1. Real phone with Expo Go (Android/iOS)"
echo "2. Android Studio Emulator"
echo "3. Skip mobile setup (Web only)"
echo ""
read -p "Enter choice (1-3): " DEVICE_CHOICE

# Initialize variables
API_URL=""
CORS_MOBILE=""

if [ "$DEVICE_CHOICE" = "2" ]; then
    echo ""
    echo "Configuring for Android Emulator..."
    API_URL="http://10.0.2.2:5000/api"
    CORS_MOBILE="http://10.0.2.2:8081"
    echo ""
    echo "⚠️  Important:"
    echo "   - Make sure Android Studio is installed"
    echo "   - Start your Android Emulator BEFORE running the app"
    echo ""
    
elif [ "$DEVICE_CHOICE" = "1" ]; then
    echo ""
    echo "Configuring for real phone with Expo Go..."
    echo ""
    echo "================================"
    echo "📋 Find Your WiFi IP Address:"
    echo "================================"
    echo ""
    echo "Windows users:"
    echo "  1. Open Command Prompt or PowerShell"
    echo "  2. Run: ipconfig"
    echo "  3. Look for 'Wireless LAN adapter Wi-Fi'"
    echo "  4. Find the 'IPv4 Address' (e.g., 192.168.1.158)"
    echo ""
    echo "Linux users:"
    echo "  1. Open terminal"
    echo "  2. Run: ip addr show"
    echo "  3. Look for your WiFi interface (wlan0, wlp3s0, etc.)"
    echo "  4. Find the 'inet' address (e.g., 192.168.1.158)"
    echo ""
    echo "macOS users:"
    echo "  1. Open terminal"
    echo "  2. Run: ifconfig"
    echo "  3. Look for 'en0' (WiFi) or 'en1' (Ethernet)"
    echo "  4. Find the 'inet' address (e.g., 192.168.1.158)"
    echo ""
    echo "⚠️  Common WiFi IP formats:"
    echo "   - 192.168.1.x (most common)"
    echo "   - 192.168.0.x"
    echo "   - 192.168.10.x"
    echo "   - 10.0.0.x"
    echo ""
    echo "❌ AVOID these IPs (they won't work):"
    echo "   - 127.0.0.1 (localhost)"
    echo "   - 172.27.x.x (WSL virtual network)"
    echo "   - 192.168.56.x (VirtualBox)"
    echo "   - 192.168.144.x (Hyper-V)"
    echo "   - 169.254.x.x (link-local)"
    echo ""
    echo "================================"
    echo ""
    
    # Get IP from user
    while true; do
        read -p "Enter your WiFi IP address: " HOST_IP
        
        # Check if empty
        if [ -z "$HOST_IP" ]; then
            echo "❌ IP address cannot be empty. Please try again."
            echo ""
            continue
        fi
        
        # Basic validation - check if it looks like an IP
        if ! [[ "$HOST_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "❌ Invalid IP format. Should be like: 192.168.1.158"
            echo ""
            continue
        fi
        
        # Warn about common wrong IPs
        if [[ "$HOST_IP" =~ ^127\. ]]; then
            echo "❌ This is localhost (127.x.x.x) - it won't work for mobile!"
            echo "   Please enter your WiFi IP address."
            echo ""
            continue
        fi
        
        if [[ "$HOST_IP" =~ ^172\.27\. ]]; then
            echo "⚠️  Warning: This looks like a WSL virtual network IP (172.27.x.x)"
            echo "   This might not work. Please check your WiFi IP with 'ipconfig'"
            echo ""
            read -p "Continue anyway? (y/n): " CONTINUE
            if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
                continue
            fi
        fi
        
        if [[ "$HOST_IP" =~ ^192\.168\.56\. ]] || [[ "$HOST_IP" =~ ^192\.168\.144\. ]]; then
            echo "⚠️  Warning: This looks like a virtual adapter IP (192.168.56.x or 192.168.144.x)"
            echo "   This might not work. Please check your WiFi IP with 'ipconfig'"
            echo ""
            read -p "Continue anyway? (y/n): " CONTINUE
            if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
                continue
            fi
        fi
        
        if [[ "$HOST_IP" =~ ^169\.254\. ]]; then
            echo "❌ This is a link-local address (169.254.x.x) - it won't work!"
            echo "   Your computer is not connected to a network properly."
            echo ""
            continue
        fi
        
        # If we got here, IP looks reasonable
        break
    done
    
    API_URL="http://${HOST_IP}:5000/api"
    CORS_MOBILE="http://${HOST_IP}:8081"
    
    echo ""
    echo "✅ Configuration set:"
    echo "   Mobile app will connect to: $API_URL"
    echo ""
    echo "⚠️  IMPORTANT: Make sure your phone is on the SAME WiFi network!"
    echo ""
    
elif [ "$DEVICE_CHOICE" = "3" ]; then
    echo ""
    echo "Configuring for Web only..."
    API_URL="http://localhost:5000/api"
    CORS_MOBILE=""
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "Creating configuration files..."

# Create NodeJS-server/.env
if [ -z "$CORS_MOBILE" ]; then
    cat > NodeJS-server/.env <<EOF
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
EOF
else
    cat > NodeJS-server/.env <<EOF
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,${CORS_MOBILE}
EOF
fi

# Create React Native .env only if mobile option was chosen
if [ "$DEVICE_CHOICE" != "3" ]; then
    cat > react-native-app/.env <<EOF
EXPO_PUBLIC_API_URL=${API_URL}
EOF
fi

echo "✅ Configuration files created"
echo ""

# Stop any existing containers
docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1

echo "Building and starting Docker containers..."
echo "(This may take a few minutes on first run)"
echo ""

# Build and start services
if ! docker-compose -f docker-compose.dev.yml up --build -d; then
    echo "❌ Failed to start Docker containers"
    exit 1
fi

# Wait for services to be ready
sleep 5

# Check if services are running
FAILED=0

if ! docker ps | grep -q "nodejs-server"; then
    echo "❌ Node.js server failed to start"
    FAILED=1
fi

if ! docker ps | grep -q "cpp-server"; then
    echo "❌ C++ server failed to start"
    FAILED=1
fi

if ! docker ps | grep -q "mongo"; then
    echo "❌ MongoDB failed to start"
    FAILED=1
fi

if [ $FAILED -eq 1 ]; then
    echo ""
    echo "View logs with: docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

echo "✅ All backend services are running"
echo ""

# Display next steps based on choice
if [ "$DEVICE_CHOICE" = "1" ] || [ "$DEVICE_CHOICE" = "2" ]; then
    
    echo "Starting mobile app..."
    echo ""
        
    cd react-native-app
        
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        echo ""
    fi
        
    echo "================================"
    echo "🎉 Starting Expo Dev Server"
    echo "================================"
    echo ""
        
    if [ "$DEVICE_CHOICE" = "2" ]; then
        echo "📱 Android Emulator:"
        echo "   Press 'a' to open in Android emulator"
    else
        echo "📱 Real Phone:"
        echo "   1. Open Expo Go app on your phone"
        echo "   2. Scan the QR code below"
    fi
        
    echo ""
    echo "🌐 Web client: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    echo "================================"
    echo ""

    # Start Expo
    npx expo start
    
else
    # Web only
    echo "================================"
    echo "🎉 Setup Complete"
    echo "================================"
    echo ""
    echo "🌐 Web client: http://localhost:3000"
    echo ""
    echo "🛑 Stop services: docker-compose -f docker-compose.dev.yml down"
    echo ""
fi