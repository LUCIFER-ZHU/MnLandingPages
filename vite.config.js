import { defineConfig } from 'vite';
import { resolve, join } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import legacy from '@vitejs/plugin-legacy';
import fs from 'fs';

// 动态获取产品页面
function getProductPages() {
  const pagesDir = resolve(__dirname, 'src/pages');
  const products = {};
  
  if (fs.existsSync(pagesDir)) {
    const folders = fs.readdirSync(pagesDir).filter(folder => {
      const folderPath = join(pagesDir, folder);
      return fs.statSync(folderPath).isDirectory();
    });
    
    folders.forEach(folder => {
      const scriptPath = join(pagesDir, folder, 'script.js');
      const stylePath = join(pagesDir, folder, 'style.scss');
      const htmlPath = join(pagesDir, folder, 'index.html');
      
      if (fs.existsSync(scriptPath) && fs.existsSync(htmlPath)) {
        products[folder] = {
          script: `./src/pages/${folder}/script.js`,
          style: `./src/pages/${folder}/style.scss`,
          html: `./src/pages/${folder}/index.html`,
        };
      }
    });
  }
  
  return { products };
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const { products } = getProductPages();
  
  // 准备HTML注入配置
  const htmlPluginOptions = [];
  
  // 首页
  htmlPluginOptions.push({
    filename: 'index.html',
    template: 'src/index.html',
    inject: true,
    entry: '/src/index.js',
    minify: isProduction,
  });
  
  // 产品页面
  Object.keys(products).forEach(product => {
    htmlPluginOptions.push({
      filename: `${product}.html`,  // 输出为根目录下的product1.html, product2.html等
      template: products[product].html,
      inject: true,
      entry: products[product].script,
      minify: isProduction,
    });
  });
  
  return {
    root: process.cwd(),
    base: '/',
    publicDir: 'public',
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@common': resolve(__dirname, 'src/assets/css')
      }
    },
    
    css: {
      preprocessorOptions: {
        scss: {
          outputStyle: isProduction ? 'compressed' : 'expanded',
        }
      },
      devSourcemap: !isProduction,
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        input: {
          // 指定入口HTML文件
          index: resolve(__dirname, 'src/index.html'),
          // 添加产品页面作为入口
          product1: resolve(__dirname, 'src/pages/product1/index.html'),
          product2: resolve(__dirname, 'src/pages/product2/index.html')
        },
        output: {
          // 配置输出文件名格式
          entryFileNames: isProduction ? 'assets/js/[name].[hash].js' : 'assets/js/[name].js',
          chunkFileNames: isProduction ? 'assets/js/[name].[hash].js' : 'assets/js/[name].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return `assets/images/[name].[hash][extname]`;
            }
            else if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name].[hash][extname]`;
            }
            else if (/\.css$/.test(assetInfo.name)) {
              return `assets/css/[name].[hash][extname]`;
            }
            return `assets/[name].[hash][extname]`;
          },
          // 确保HTML文件输出到正确的位置
          // index.html -> dist/index.html
          // product1/index.html -> dist/product1.html
          // product2/index.html -> dist/product2.html
        },
      },
    },
    
    plugins: [
      // HTML处理插件
      createHtmlPlugin({
        minify: isProduction,
        pages: [
          {
            entry: '/src/index.js',
            filename: 'index.html',
            template: 'src/index.html',
            injectOptions: {
              data: {
                title: '产品导航',
                injectScript: `
                  <script type="module" src="/src/index.js"></script>
                `
              }
            }
          },
          {
            entry: '/src/pages/product1/script.js',
            filename: 'product1.html',
            template: 'src/pages/product1/index.html',
            injectOptions: {
              data: {
                title: '产品1 - vw/vh响应式布局演示',
                injectScript: `
                  <script type="module" src="/src/pages/product1/script.js"></script>
                `
              }
            }
          },
          {
            entry: '/src/pages/product2/script.js',
            filename: 'product2.html',
            template: 'src/pages/product2/index.html',
            injectOptions: {
              data: {
                title: '产品2 - 创新技术解决方案',
                injectScript: `
                  <script type="module" src="/src/pages/product2/script.js"></script>
                `
              }
            }
          }
        ],
      }),
      
      // 复制静态资源
      viteStaticCopy({
        targets: [
          {
            src: 'src/assets/images',
            dest: 'assets',
            // 如果源目录不存在，不会报错
            noErrorOnMissing: true
          },
        ],
      }),
      
      // 兼容旧浏览器
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],
    
    server: {
      port: 3001,
      open: true,
      host: true,
      cors: true,
      watch: {
        usePolling: false,
      },
      fs: {
        // 允许访问项目根目录以外的文件
        strict: false,
        // 允许以项目根目录外的路径提供服务
        allow: ['..']
      },
      // 配置开发服务器的历史记录回退
      // 这样在开发环境中访问/product1.html时会被正确处理
      historyApiFallback: {
        rewrites: [
          { from: /^\/product1\.html$/, to: '/src/pages/product1/index.html' },
          { from: /^\/product2\.html$/, to: '/src/pages/product2/index.html' }
        ]
      }
    },
  };
}); 