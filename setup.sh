#!/bin/bash

echo "🚀 Drive 2.0 - Setup Wizard"
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
    echo "⚠️  Make sure your Android Emulator is running before starting the app!"
    
elif [ "$DEVICE_CHOICE" = "1" ]; then
    echo ""
    echo "Configuring for real phone..."
    
    HOST_IP=""
    
    # Detect if running in WSL
    if grep -qi microsoft /proc/version 2>/dev/null; then
        # Running in WSL - get Windows host IP
        if command -v powershell.exe &> /dev/null; then
            # Get all Windows IPs
            ALL_IPS=$(powershell.exe "Get-NetIPAddress -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress" 2>/dev/null | tr -d '\r')
            
            # Filter out unwanted IPs (loopback, link-local, WSL, VirtualBox)
            FILTERED_IPS=$(echo "$ALL_IPS" | grep -v "^127\." | grep -v "^169\.254\." | grep -v "^172\.27\." | grep -v "^192\.168\.56\.")
            
            # Prefer home router IPs (192.168.0.x or 192.168.1.x)
            HOME_IP=$(echo "$FILTERED_IPS" | grep -E "^192\.168\.[01]\." | head -n 1)
            
            # Use home IP if found, otherwise use first filtered IP
            if [ -n "$HOME_IP" ]; then
                HOST_IP="$HOME_IP"
            else
                HOST_IP=$(echo "$FILTERED_IPS" | head -n 1)
            fi
        fi
    else
        # Native Linux or macOS
        if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "linux" ]]; then
            if command -v ip &> /dev/null; then
                # Get interface with default route
                DEFAULT_IFACE=$(ip route | grep "^default" | awk '{print $5}' | head -n 1)
                
                if [ -n "$DEFAULT_IFACE" ]; then
                    HOST_IP=$(ip -4 addr show "$DEFAULT_IFACE" | \
                              grep inet | \
                              awk '{print $2}' | \
                              cut -d'/' -f1 | \
                              grep -v "127.0.0.1")
                fi
                
                # Fallback: get from any UP interface (excluding virtual)
                if [ -z "$HOST_IP" ]; then
                    HOST_IP=$(ip -4 -o addr show up | \
                              awk '{print $2, $4}' | \
                              grep -v " lo" | \
                              grep -v "docker" | \
                              grep -v "veth" | \
                              grep -v "virbr" | \
                              grep -v "vbox" | \
                              grep -v "br-" | \
                              awk '{print $2}' | \
                              cut -d'/' -f1 | \
                              head -n 1)
                fi
            fi
            
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS: Get IP from interface with default route
            DEFAULT_IFACE=$(netstat -rn | grep "^default" | awk '{print $6}' | head -n 1)
            
            if [ -n "$DEFAULT_IFACE" ]; then
                HOST_IP=$(ifconfig "$DEFAULT_IFACE" | \
                          grep "inet " | \
                          grep -v "127.0.0.1" | \
                          awk '{print $2}')
            fi
        fi
    fi
    
    # Ask user to confirm or provide IP
    if [ -z "$HOST_IP" ]; then
        echo "⚠️  Could not detect IP automatically"
        echo ""
        echo "Find your WiFi IP:"
        echo "  Windows: ipconfig (look for 'Wireless LAN adapter Wi-Fi')"
        echo "  Linux:   ip addr show"
        echo "  macOS:   ifconfig"
        echo ""
        read -p "Enter your WiFi IP address: " HOST_IP
        
        while [ -z "$HOST_IP" ]; do
            echo "❌ IP address cannot be empty"
            read -p "Enter your WiFi IP address: " HOST_IP
        done
    else
        echo "Detected IP: $HOST_IP"
        read -p "Press Enter to use this IP, or type a different one: " USER_IP
        
        if [ -n "$USER_IP" ]; then
            HOST_IP="$USER_IP"
        fi
    fi
    
    API_URL="http://${HOST_IP}:5000/api"
    CORS_MOBILE="http://${HOST_IP}:8081"
    
    echo "Mobile app will connect to: $API_URL"
    echo "⚠️  Ensure your phone is on the same WiFi network!"
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
        echo "📱 Press 'a' to open in Android emulator"
    else
        echo "📱 Scan QR code with Expo Go on your phone"
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
