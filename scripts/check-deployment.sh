#!/bin/bash

# Script สำหรับตรวจสอบการ deploy
# Usage: ./scripts/check-deployment.sh [backend-url] [frontend-url]

set -e

BACKEND_URL=${1:-"https://your-backend.onrender.com"}
FRONTEND_URL=${2:-"https://your-app.vercel.app"}

echo "🔍 กำลังตรวจสอบการ Deploy..."
echo ""

# สีสำหรับ output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ฟังก์ชันตรวจสอบ
check_backend() {
    echo "📡 กำลังตรวจสอบ Backend: $BACKEND_URL"
    
    if curl -s -f "$BACKEND_URL/api" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ทำงานได้ปกติ${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend ไม่สามารถเข้าถึงได้${NC}"
        return 1
    fi
}

check_frontend() {
    echo "🌐 กำลังตรวจสอบ Frontend: $FRONTEND_URL"
    
    if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend ทำงานได้ปกติ${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend ไม่สามารถเข้าถึงได้${NC}"
        return 1
    fi
}

check_cors() {
    echo "🔐 กำลังตรวจสอบ CORS..."
    
    # ตรวจสอบว่า backend รองรับ CORS จาก frontend
    CORS_CHECK=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        "$BACKEND_URL/api")
    
    if [ "$CORS_CHECK" = "200" ] || [ "$CORS_CHECK" = "204" ]; then
        echo -e "${GREEN}✅ CORS ตั้งค่าถูกต้อง${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  CORS อาจมีปัญหา (HTTP $CORS_CHECK)${NC}"
        return 1
    fi
}

# รันการตรวจสอบ
BACKEND_OK=false
FRONTEND_OK=false
CORS_OK=false

if check_backend; then
    BACKEND_OK=true
fi

echo ""

if check_frontend; then
    FRONTEND_OK=true
fi

echo ""

if [ "$BACKEND_OK" = true ]; then
    if check_cors; then
        CORS_OK=true
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 สรุปผลการตรวจสอบ:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$BACKEND_OK" = true ]; then
    echo -e "${GREEN}✅ Backend: ทำงานได้ปกติ${NC}"
else
    echo -e "${RED}❌ Backend: มีปัญหา${NC}"
fi

if [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ Frontend: ทำงานได้ปกติ${NC}"
else
    echo -e "${RED}❌ Frontend: มีปัญหา${NC}"
fi

if [ "$CORS_OK" = true ]; then
    echo -e "${GREEN}✅ CORS: ตั้งค่าถูกต้อง${NC}"
elif [ "$BACKEND_OK" = true ]; then
    echo -e "${YELLOW}⚠️  CORS: อาจมีปัญหา${NC}"
else
    echo -e "${YELLOW}⚠️  CORS: ไม่สามารถตรวจสอบได้ (Backend ไม่ทำงาน)${NC}"
fi

echo ""

if [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ] && [ "$CORS_OK" = true ]; then
    echo -e "${GREEN}🎉 การ Deploy สำเร็จ! ทุกอย่างทำงานได้ปกติ${NC}"
    exit 0
else
    echo -e "${RED}⚠️  มีปัญหาบางอย่างที่ต้องแก้ไข${NC}"
    exit 1
fi

