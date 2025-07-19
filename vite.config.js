import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import legacy from '@vitejs/plugin-legacy';
import fs from 'fs';

export default defineConfig({
  // 基础配置
  root: 'src',
  base: '/',
  publicDir: '../public',
  
  // 构建配置
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        product1: resolve(__dirname, 'src/pages/product1/index.html'),
        product2: resolve(__dirname, 'src/pages/product2/index.html')
      },
      output: {
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (/\.(css)$/.test(assetInfo.name)) {
            return 'assets/css/[name].[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/images/[name].[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  },
  
  // 插件
  plugins: [
    // 复制静态资源
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/images',
          dest: '../dist/assets',
          noErrorOnMissing: true
        }
      ]
    }),
    
    // 兼容旧浏览器
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@common': resolve(__dirname, 'src/assets/css')
    }
  },
  
  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        outputStyle: 'expanded'
      }
    },
    devSourcemap: true
  },
  
  // 开发服务器配置
  server: {
    port: 3001,
    open: true,
    host: true,
    fs: {
      strict: false
    }
  }
}); 