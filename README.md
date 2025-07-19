# 多产品详细介绍页面项目

## 项目结构

```
MnLandingPages/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── common.less          # 公共样式
│   │   │   ├── variables.less       # 变量定义
│   │   │   └── mixins.less          # 混合函数
│   │   ├── images/
│   │   │   ├── common/              # 公共图片
│   │   │   ├── product1/            # 产品1专用图片
│   │   │   └── product2/            # 产品2专用图片
│   │   └── js/
│   │       ├── common.js            # 公共JS
│   │       └── utils.js             # 工具函数
│   ├── pages/
│   │   ├── product1/
│   │   │   ├── index.html
│   │   │   ├── style.less
│   │   │   └── script.js
│   │   ├── product2/
│   │   │   ├── index.html
│   │   │   ├── style.less
│   │   │   └── script.js
│   │   └── common/
│   │       ├── header.html          # 公共头部
│   │       └── footer.html          # 公共底部
│   └── templates/
│       └── base.html                # 基础模板
├── dist/                            # 构建输出目录
│   ├── product1/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── assets/
│   ├── product2/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── assets/
│   └── assets/
│       ├── css/
│       ├── js/
│       └── images/
├── build/                           # 构建脚本
│   ├── webpack.config.js
│   └── build.js
├── nginx/                           # Nginx配置
│   └── sites-available/
│       ├── product1.conf
│       └── product2.conf
├── package.json
├── webpack.config.js
└── .gitignore
```

## 技术方案解答

### 1. 项目结构说明
- **src/**: 源代码目录，包含所有开发文件
- **dist/**: 构建后的生产文件，直接部署到服务器
- **pages/**: 每个产品一个独立目录，便于管理
- **assets/**: 公共资源文件
- **nginx/**: Nginx配置文件

### 2. Vue脚手架与SEO
**不推荐使用Vue SPA**，原因：
- Vue SPA对SEO不友好，搜索引擎爬虫无法获取动态渲染的内容
- 需要额外的SSR配置增加复杂度

**推荐方案**：
- 使用静态HTML + 少量JavaScript增强
- 使用构建工具（Webpack/Vite）处理资源
- 保证SEO友好的同时维持开发效率

### 3. Less处理CSS
**完全可以使用Less**，推荐配置：
- 使用Webpack的less-loader
- 配置变量文件统一管理颜色、字体等
- 使用mixins提高代码复用性

### 4. Nginx配置
每个产品域名对应一个独立的HTML文件，通过server_name区分。

## 快速开始

1. 安装依赖：`npm install`
2. 开发模式：`npm run dev`
3. 构建生产：`npm run build`
4. 预览构建结果：`npm run preview`
5. 部署到服务器的dist目录
6. 配置Nginx虚拟主机

## 构建工具

本项目使用Vite作为构建工具，相比Webpack具有以下优势：

- 更快的冷启动速度
- 即时的热模块替换(HMR)
- 按需编译
- 优化的构建过程
- 更简洁的配置

## SEO优化建议

- 每个页面独立的title、meta描述
- 语义化HTML结构
- 图片添加alt属性
- 合理的H1-H6标签层级
- 结构化数据标记
- 页面加载速度优化