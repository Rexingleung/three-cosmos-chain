#!/bin/bash

# Three Cosmos Chain 开发环境启动脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_success() {
    print_message $GREEN "✅ $1"
}

print_warning() {
    print_message $YELLOW "⚠️  $1"
}

print_info() {
    print_message $BLUE "ℹ️  $1"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查 Cosmos 链状态
check_cosmos_status() {
    local rpc_endpoint="http://localhost:26657"
    
    if command_exists curl; then
        if curl -s "$rpc_endpoint/status" > /dev/null 2>&1; then
            local chain_id=$(curl -s "$rpc_endpoint/status" | grep -o '"chain_id":"[^"]*"' | cut -d'"' -f4)
            print_success "Cosmos 链运行正常，链ID: $chain_id"
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# 主函数
main() {
    echo "======================================"
    echo "  Three Cosmos Chain 开发环境启动"
    echo "======================================"
    echo ""
    
    # 检查 Cosmos 链状态
    print_info "检查 Cosmos 链状态..."
    if ! check_cosmos_status; then
        print_warning "无法连接到本地 Cosmos 链"
        print_info "请确保在另一个终端中运行: ignite chain serve"
        echo ""
        read -p "是否继续启动开发服务器？(y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "已取消启动"
            exit 0
        fi
    fi
    
    # 检查包管理器
    if command_exists yarn && [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    elif command_exists npm; then
        PACKAGE_MANAGER="npm"
    else
        print_error "未找到包管理器"
        exit 1
    fi
    
    print_info "使用 $PACKAGE_MANAGER 启动开发服务器..."
    echo ""
    
    # 启动开发服务器
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn dev
    else
        npm run dev
    fi
}

# 运行主函数
main "$@"