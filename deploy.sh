#!/bin/bash

# Docker 备份管理系统部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Docker 备份管理系统部署${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_message "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        print_warning "未找到 .env 文件，正在创建..."
        cp env.example .env
        print_warning "请编辑 .env 文件配置必要的环境变量"
        exit 1
    fi
    
    print_message "环境变量文件检查通过"
}

# 创建必要的目录
create_directories() {
    print_message "创建必要的目录..."
    
    mkdir -p data
    mkdir -p backups
    mkdir -p ssl
    mkdir -p logs
    
    print_message "目录创建完成"
}

# 生成自签名 SSL 证书（用于开发环境）
generate_ssl_cert() {
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        print_message "生成自签名 SSL 证书..."
        
        mkdir -p ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
        
        print_message "SSL 证书生成完成"
    else
        print_message "SSL 证书已存在"
    fi
}

# 拉取最新镜像
pull_latest_image() {
    print_message "拉取最新 Docker 镜像..."
    
    # 从环境变量文件读取 Docker Hub 用户名
    source .env
    docker pull ${DOCKERHUB_USERNAME:-yourusername}/docker_backup_panel:latest
    
    print_message "镜像拉取完成"
}

# 停止现有容器
stop_containers() {
    print_message "停止现有容器..."
    
    docker-compose down || true
    
    print_message "容器停止完成"
}

# 启动服务
start_services() {
    print_message "启动服务..."
    
    # 根据参数选择配置文件
    if [ "$1" = "prod" ]; then
        print_message "使用生产环境配置"
        docker-compose -f docker-compose.prod.yml up -d
    else
        print_message "使用开发环境配置"
        docker-compose up -d
    fi
    
    print_message "服务启动完成"
}

# 等待服务就绪
wait_for_service() {
    print_message "等待服务就绪..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            print_message "服务已就绪！"
            return 0
        fi
        
        print_message "等待服务启动... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "服务启动超时"
    return 1
}

# 显示服务状态
show_status() {
    print_message "服务状态："
    docker-compose ps
    
    echo ""
    print_message "访问地址："
    echo "  - 应用界面: http://localhost"
    echo "  - API 接口: http://localhost/api"
    echo "  - 健康检查: http://localhost/health"
}

# 显示日志
show_logs() {
    print_message "显示服务日志..."
    docker-compose logs -f
}

# 主函数
main() {
    print_header
    
    # 检查参数
    case "${1:-dev}" in
        "dev"|"development")
            ENV="dev"
            ;;
        "prod"|"production")
            ENV="prod"
            ;;
        "logs")
            show_logs
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        *)
            print_error "未知参数: $1"
            echo "用法: $0 [dev|prod|logs|status]"
            exit 1
            ;;
    esac
    
    # 执行部署步骤
    check_docker
    check_env
    create_directories
    
    if [ "$ENV" = "prod" ]; then
        generate_ssl_cert
    fi
    
    pull_latest_image
    stop_containers
    start_services "$ENV"
    
    if wait_for_service; then
        show_status
        print_message "部署完成！"
    else
        print_error "部署失败"
        exit 1
    fi
}

# 执行主函数
main "$@" 