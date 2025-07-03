#!/bin/bash

# 多产品落地页部署脚本
# 使用方法：./deploy.sh [环境] [产品]
# 环境：dev, staging, production
# 产品：product1, product2, all（默认）

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
ENVIRONMENT=${1:-production}
PRODUCT=${2:-all}
PROJECT_NAME="MnLandingPages"
BUILD_DIR="dist"
BACKUP_DIR="backup"
LOG_FILE="deploy.log"

# 服务器配置（根据环境设置）
case $ENVIRONMENT in
    "dev")
        SERVER_HOST="dev.yourdomain.com"
        SERVER_USER="deploy"
        SERVER_PATH="/var/www/landing-pages-dev"
        ;;
    "staging")
        SERVER_HOST="staging.yourdomain.com"
        SERVER_USER="deploy"
        SERVER_PATH="/var/www/landing-pages-staging"
        ;;
    "production")
        SERVER_HOST="yourdomain.com"
        SERVER_USER="deploy"
        SERVER_PATH="/var/www/landing-pages"
        ;;
    *)
        echo -e "${RED}错误：未知环境 '$ENVIRONMENT'${NC}"
        echo "支持的环境：dev, staging, production"
        exit 1
        ;;
esac

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ $1${NC}" | tee -a $LOG_FILE
}

# 检查依赖
check_dependencies() {
    log "检查依赖..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 检查 rsync（用于文件同步）
    if ! command -v rsync &> /dev/null; then
        log_warning "rsync 未安装，将使用 scp 进行文件传输"
    fi
    
    log_success "依赖检查完成"
}

# 安装依赖
install_dependencies() {
    log "安装项目依赖..."
    
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        npm ci --production=false
        log_success "依赖安装完成"
    else
        log "依赖已是最新，跳过安装"
    fi
}

# 构建项目
build_project() {
    log "构建项目..."
    
    # 清理之前的构建
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log "清理旧的构建文件"
    fi
    
    # 根据产品参数构建
    if [ "$PRODUCT" = "all" ]; then
        npm run build
        log_success "所有产品构建完成"
    else
        npm run build:$PRODUCT
        log_success "产品 $PRODUCT 构建完成"
    fi
    
    # 检查构建结果
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "构建失败：$BUILD_DIR 目录不存在"
        exit 1
    fi
    
    # 显示构建统计
    log "构建统计："
    du -sh "$BUILD_DIR"/* | while read size file; do
        log "  $(basename "$file"): $size"
    done
}

# 运行测试
run_tests() {
    log "运行测试..."
    
    # 检查是否有测试脚本
    if npm run | grep -q "test"; then
        npm run test
        log_success "测试通过"
    else
        log_warning "未找到测试脚本，跳过测试"
    fi
}

# 代码质量检查
code_quality_check() {
    log "代码质量检查..."
    
    # ESLint 检查
    if npm run | grep -q "lint"; then
        npm run lint
        log_success "代码质量检查通过"
    else
        log_warning "未找到 lint 脚本，跳过代码质量检查"
    fi
}

# 创建备份
create_backup() {
    log "创建远程备份..."
    
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        if [ -d '$SERVER_PATH/$BUILD_DIR' ]; then
            mkdir -p '$SERVER_PATH/$BACKUP_DIR'
            cp -r '$SERVER_PATH/$BUILD_DIR' '$SERVER_PATH/$BACKUP_DIR/$BACKUP_NAME'
            echo '备份创建：$BACKUP_NAME'
            
            # 保留最近5个备份
            cd '$SERVER_PATH/$BACKUP_DIR'
            ls -t | tail -n +6 | xargs -r rm -rf
            echo '清理旧备份完成'
        else
            echo '没有现有部署，跳过备份'
        fi
    "
    
    log_success "备份完成"
}

# 部署到服务器
deploy_to_server() {
    log "部署到 $ENVIRONMENT 环境..."
    
    # 确保远程目录存在
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p '$SERVER_PATH'"
    
    # 同步文件
    if command -v rsync &> /dev/null; then
        rsync -avz --delete "$BUILD_DIR/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/$BUILD_DIR/"
    else
        scp -r "$BUILD_DIR" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    fi
    
    log_success "文件同步完成"
}

# 更新 Nginx 配置
update_nginx_config() {
    log "更新 Nginx 配置..."
    
    # 复制 Nginx 配置文件
    scp "nginx.conf" "$SERVER_USER@$SERVER_HOST:/tmp/nginx-landing-pages.conf"
    
    # 在服务器上更新配置
    ssh "$SERVER_USER@$SERVER_HOST" "
        sudo cp /tmp/nginx-landing-pages.conf /etc/nginx/sites-available/landing-pages
        sudo ln -sf /etc/nginx/sites-available/landing-pages /etc/nginx/sites-enabled/landing-pages
        sudo nginx -t && sudo systemctl reload nginx
    "
    
    log_success "Nginx 配置更新完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    # 定义检查的URL
    case $PRODUCT in
        "product1")
            URLS=("https://product1.yourdomain.com")
            ;;
        "product2")
            URLS=("https://product2.yourdomain.com")
            ;;
        "all")
            URLS=(
                "https://product1.yourdomain.com"
                "https://product2.yourdomain.com"
            )
            ;;
    esac
    
    # 等待服务启动
    sleep 10
    
    # 检查每个URL
    for url in "${URLS[@]}"; do
        log "检查 $url"
        
        for i in {1..5}; do
            if curl -f -s -o /dev/null "$url"; then
                log_success "$url 响应正常"
                break
            else
                if [ $i -eq 5 ]; then
                    log_error "$url 健康检查失败"
                    return 1
                else
                    log "重试 $i/5..."
                    sleep 5
                fi
            fi
        done
    done
    
    log_success "所有健康检查通过"
}

# 回滚函数
rollback() {
    log_error "部署失败，开始回滚..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        cd '$SERVER_PATH/$BACKUP_DIR'
        LATEST_BACKUP=\$(ls -t | head -n 1)
        if [ -n \"\$LATEST_BACKUP\" ]; then
            rm -rf '$SERVER_PATH/$BUILD_DIR'
            cp -r \"\$LATEST_BACKUP\" '$SERVER_PATH/$BUILD_DIR'
            sudo systemctl reload nginx
            echo '回滚到备份：'\$LATEST_BACKUP
        else
            echo '没有可用的备份'
        fi
    "
    
    log_success "回滚完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    # 这里可以集成 Slack、钉钉、邮件等通知方式
    log "通知：$message"
    
    # 示例：发送到 Slack
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #         --data "{\"text\":\"$message\"}" \
    #         "$SLACK_WEBHOOK_URL"
    # fi
}

# 清理函数
cleanup() {
    log "清理临时文件..."
    # 清理临时文件
    rm -f /tmp/nginx-landing-pages.conf
    log_success "清理完成"
}

# 主函数
main() {
    log "开始部署 $PROJECT_NAME 到 $ENVIRONMENT 环境"
    log "产品：$PRODUCT"
    log "时间：$(date)"
    
    # 设置错误处理
    trap 'log_error "部署过程中发生错误"; rollback; cleanup; exit 1' ERR
    
    # 执行部署步骤
    check_dependencies
    install_dependencies
    
    # 只在生产环境运行测试和代码检查
    if [ "$ENVIRONMENT" = "production" ]; then
        run_tests
        code_quality_check
    fi
    
    build_project
    create_backup
    deploy_to_server
    update_nginx_config
    
    # 健康检查
    if health_check; then
        log_success "部署成功完成！"
        send_notification "success" "$PROJECT_NAME 部署到 $ENVIRONMENT 环境成功"
    else
        log_error "健康检查失败"
        rollback
        send_notification "failure" "$PROJECT_NAME 部署到 $ENVIRONMENT 环境失败，已回滚"
        exit 1
    fi
    
    cleanup
    
    # 显示部署信息
    log "部署信息："
    log "  环境：$ENVIRONMENT"
    log "  产品：$PRODUCT"
    log "  服务器：$SERVER_HOST"
    log "  路径：$SERVER_PATH"
    log "  时间：$(date)"
    
    log_success "部署流程完成！"
}

# 显示帮助信息
show_help() {
    echo "多产品落地页部署脚本"
    echo ""
    echo "使用方法："
    echo "  $0 [环境] [产品]"
    echo ""
    echo "参数："
    echo "  环境：dev, staging, production（默认：production）"
    echo "  产品：product1, product2, all（默认：all）"
    echo ""
    echo "示例："
    echo "  $0 production all          # 部署所有产品到生产环境"
    echo "  $0 staging product1        # 部署产品1到测试环境"
    echo "  $0 dev product2            # 部署产品2到开发环境"
    echo ""
    echo "环境变量："
    echo "  SLACK_WEBHOOK_URL          # Slack 通知 Webhook URL"
    echo ""
}

# 检查参数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 确认部署
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}警告：即将部署到生产环境！${NC}"
    echo "环境：$ENVIRONMENT"
    echo "产品：$PRODUCT"
    echo "服务器：$SERVER_HOST"
    echo ""
    read -p "确认继续？(y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "部署已取消"
        exit 0
    fi
fi

# 执行主函数
main

# 使用说明：
# 1. 给脚本添加执行权限：chmod +x deploy.sh
# 2. 配置SSH密钥认证到服务器
# 3. 确保服务器上有部署用户权限
# 4. 运行部署：./deploy.sh production all