#!/bin/bash

# Three Cosmos Chain 问题修复脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "======================================"
echo "  Three Cosmos Chain 问题修复工具"
echo "======================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录下运行此脚本"
    exit 1
fi

print_info "开始检查和修复常见问题..."

# 1. 清除缓存
print_info "清除 node_modules 和缓存..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "已删除 node_modules"
fi

if [ -d ".next" ]; then
    rm -rf .next
fi

if [ -d "dist" ]; then
    rm -rf dist
fi

# 2. 清除 npm/yarn 缓存
if command -v yarn >/dev/null 2>&1; then
    yarn cache clean
    print_success "已清除 Yarn 缓存"
elif command -v npm >/dev/null 2>&1; then
    npm cache clean --force
    print_success "已清除 npm 缓存"
fi

# 3. 重新安装依赖
print_info "重新安装项目依赖..."
if command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
    yarn install
    print_success "使用 Yarn 重新安装依赖完成"
elif command -v npm >/dev/null 2>&1; then
    npm install
    print_success "使用 npm 重新安装依赖完成"
else
    print_error "未找到 npm 或 yarn"
    exit 1
fi

# 4. 检查必要文件是否存在
print_info "检查项目文件完整性..."

required_files=(
    "src/App.jsx"
    "src/main.jsx"
    "src/index.css"
    "src/components/ChainStatus.jsx"
    "src/components/WalletManager.jsx"
    "src/components/Balance.jsx"
    "src/components/BlockInfo.jsx"
    "src/components/TransactionInfo.jsx"
    "src/components/Transfer.jsx"
    "src/services/cosmosService.js"
    "src/config/chain.js"
    "src/utils/wallet.js"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    print_success "所有必要文件都存在"
else
    print_warning "发现缺失的文件："
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    print_info "请从 GitHub 重新克隆完整项目"
fi

# 5. 检查环境变量文件
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
    cp .env.example .env.local
    print_success "已创建 .env.local 文件"
fi

# 6. 验证包管理器配置
print_info "验证项目配置..."
if command -v node >/dev/null 2>&1; then
    node_version=$(node -v)
    print_success "Node.js 版本: $node_version"
else
    print_error "未安装 Node.js"
    exit 1
fi

# 7. 尝试构建项目（测试）
print_info "尝试构建项目进行验证..."
if command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
    if yarn build; then
        print_success "项目构建成功"
        rm -rf dist  # 清理构建文件
    else
        print_error "项目构建失败，请检查代码错误"
    fi
elif command -v npm >/dev/null 2>&1; then
    if npm run build; then
        print_success "项目构建成功"
        rm -rf dist  # 清理构建文件
    else
        print_error "项目构建失败，请检查代码错误"
    fi
fi

echo ""
print_success "问题修复完成！"
echo ""
print_info "现在可以尝试启动项目："
if command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
    echo "  yarn dev"
else
    echo "  npm run dev"
fi
echo ""
print_warning "如果仍有问题，请："
echo "1. 确保本地 Cosmos 链正在运行 (ignite chain serve)"
echo "2. 检查防火墙设置"
echo "3. 查看浏览器控制台错误信息"
echo "4. 在 GitHub 仓库提交 Issue"