#!/bin/bash
# ====================================================================
# ENTERPRISE START SCRIPT FOR FACTORY APS BRAIN WITH POSTGRESQL SERVER
# ====================================================================
set -e

PORT=${PORT:-8080}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Kiểm tra virtual environment
if [ -f "$SCRIPT_DIR/.venv/bin/python" ]; then
    PYTHON_BIN="$SCRIPT_DIR/.venv/bin/python"
else
    PYTHON_BIN="python3"
fi

echo "====================================================================="
echo "🏭 KHỞI ĐỘNG HỆ THỐNG ĐIỀU HÀNH & BỘ NÃO LẬP LỊCH SẢN XUẤT (APS BRAIN)"
echo "🐘 Database Server: PostgreSQL 18 Server (localhost:5432)"
echo "📍 Cổng máy chủ: http://localhost:$PORT"
echo "🐍 Python Runtime: $PYTHON_BIN"
echo "====================================================================="

exec "$PYTHON_BIN" backend/server.py
