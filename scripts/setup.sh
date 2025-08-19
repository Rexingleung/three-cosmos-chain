#!/bin/bash

# Three Cosmos Chain 快速安装脚本
# 适用于 Linux 和 macOS 系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_success() {
    print_message $GREEN "✅ $1"
}

print_error() {
    print_message $RED "❌ $1"
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

# 检查 Node.js 版本
check_node_version() {
    if command_exists node; then
        local node_version=$(node -v | cut -d'v' -f2)
        local major_version=$(echo $node_version | cut -d'.' -f1)
        
        if [ "$major_version" -ge 16 ]; then
            print_success "Node.js 版本检查通过: v$node_version"
            return 0
        else
            print_error "Node.js 版本过低: v$node_version (需要 >= 16.0.0)"
            return 1
        fi
    else
        print_error "未找到 Node.js"
        return 1
    fi
}

# 检查 npm 或 yarn
check_package_manager() {
    if command_exists yarn; then
        PACKAGE_MANAGER="yarn"
        print_success "发现 Yarn 包管理器"
    elif command_exists npm; then
        PACKAGE_MANAGER="npm"
        print_success "发现 npm 包管理器"
    else
        print_error "未找到 npm 或 yarn 包管理器"
        return 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "正在安装项目依赖..."
    
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_success "依赖安装完成"
    else
        print_error "依赖安装失败"
        exit 1
    fi
}

# 设置环境变量
setup_environment() {
    print_info "设置环境变量..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "已创建 .env.local 文件"
        else
            print_warning "未找到 .env.example 文件"
        fi
    else
        print_info ".env.local 文件已存在"
    fi
}

# 检查 Cosmos 链连接
check_cosmos_chain() {
    print_info "检查 Cosmos 链连接..."
    
    local rpc_endpoint="http://localhost:26657"
    local rest_endpoint="http://localhost:1317"
    
    # 检查 RPC 端点
    if command_exists curl; then
        if curl -s "$rpc_endpoint/status" > /dev/null; then
            print_success "RPC 端点连接正常: $rpc_endpoint"
        else
            print_warning "无法连接到 RPC 端点: $rpc_endpoint"
            print_info "请确保本地 Cosmos 链正在运行 (ignite chain serve)"
        fi
        
        # 检查 REST 端点
        if curl -s "$rest_endpoint/cosmos/base/tendermint/v1beta1/node_info" > /dev/null; then
            print_success "REST API 端点连接正常: $rest_endpoint"
        else
            print_warning "无法连接到 REST API 端点: $rest_endpoint"
        fi
    else
        print_warning "未找到 curl 命令，跳过网络连接检查"
    fi
}

# 显示使用指南
show_usage_guide() {
    print_info "\n🚀 安装完成！\n"
    
    echo "下一步操作:"
    echo "1. 启动本地 Cosmos 链 (如果还未启动):"
    echo "   ignite chain serve"
    echo ""
    echo "2. 启动开发服务器:"
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        echo "   yarn dev"
    else
        echo "   npm run dev"
    fi
    echo ""
    echo "3. 打开浏览器访问: http://localhost:5173"
    echo ""
    echo "其他可用命令:"
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        echo "   yarn build    # 构建生产版本"
        echo "   yarn preview  # 预览生产构建"
        echo "   yarn lint     # 代码检查"
    else
        echo "   npm run build    # 构建生产版本"
        echo "   npm run preview  # 预览生产构建"
        echo "   npm run lint     # 代码检查"
    fi
    echo ""
    print_warning "注意: 请妥善保管您的助记词，这是恢复钱包的唯一凭证！"
    echo ""
}

# 主函数
main() {
    echo "======================================"
    echo "  Three Cosmos Chain 快速安装脚本"
    echo "======================================"
    echo ""
    
    # 检查系统要求
    print_info "检查系统要求..."
    
    if ! check_node_version; then
        print_error "请先安装 Node.js >= 16.0.0"
        print_info "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    if ! check_package_manager; then
        print_error "请先安装 npm 或 yarn"
        exit 1
    fi
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        print_error "请在项目根目录下运行此脚本"
        exit 1
    fi
    
    # 安装和配置
    install_dependencies
    setup_environment
    check_cosmos_chain
    
    # 显示使用指南
    show_usage_guide
}

# 捕获错误并退出
trap 'print_error "安装过程中出现错误，请检查上述错误信息"; exit 1' ERR

# 运行主函数
main "$@"