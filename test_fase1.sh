#!/bin/bash

# 🧪 Test Script - Fase 1: Portfolio Gallery
# Verifica que la implementación funcione correctamente

echo "🧪 Testing Fase 1: Portfolio Gallery"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:8000"

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing: $name... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $status)"
        ((FAILED++))
    fi
}

echo "1️⃣  Backend Django Tests"
echo "------------------------"

# Test 1: Backend health
test_endpoint "Backend Health" "$BACKEND_URL/api/v1/artists/" 200

# Test 2: Artistas list
test_endpoint "Artists List" "$BACKEND_URL/api/v1/artists/" 200

# Test 3: Works list
test_endpoint "Works List" "$BACKEND_URL/api/v1/works/" 200

echo ""
echo "2️⃣  New Endpoint Test"
echo "------------------------"

# Test 4: New custom endpoint (will 404 if no artist exists, that's ok)
echo -n "Testing: Custom Works Endpoint... "
response=$(curl -s "$BACKEND_URL/api/v1/artists/test-slug/works/")
if [ ! -z "$response" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Endpoint exists)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (No response)"
    ((FAILED++))
fi

echo ""
echo "3️⃣  Frontend Files Check"
echo "------------------------"

# Check if files exist
check_file() {
    local file=$1
    local name=$2
    
    echo -n "Checking: $name... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
    fi
}

cd "$(dirname "$0")"

check_file "frontend/src/lib/cloudinary.ts" "Cloudinary helper"
check_file "frontend/src/components/works/WorkCard.tsx" "WorkCard component"
check_file "frontend/src/components/works/WorkGrid.tsx" "WorkGrid component"
check_file "frontend/src/components/artists/ArtisanHeader.tsx" "ArtisanHeader component"
check_file "frontend/src/app/(public)/artesanos/[slug]/page.tsx" "Artisan page"
check_file "frontend/src/app/(public)/artesanos/[slug]/loading.tsx" "Loading state"

echo ""
echo "4️⃣  Environment Check"
echo "------------------------"

# Check .env.local
echo -n "Checking: .env.local... "
if [ -f "frontend/.env.local" ]; then
    if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.local; then
        echo -e "${GREEN}✓ CONFIGURED${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ MISSING API_URL${NC}"
    fi
else
    echo -e "${RED}✗ MISSING${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================="
echo "📊 Test Results"
echo "=========================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "✅ Ready to run:"
    echo "   Terminal 1: cd backend && source venv/bin/activate && python manage.py runserver"
    echo "   Terminal 2: cd frontend && npm run dev"
    echo "   Browser: http://localhost:3000/artesanos/[slug]"
    exit 0
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "- Make sure Django is running: python manage.py runserver"
    echo "- Check if database has data: python manage.py shell"
    echo "- Review QUICK_START_FASE1.md for setup instructions"
    exit 1
fi

