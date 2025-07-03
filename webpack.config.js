const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

// 动态获取产品页面
function getProductPages() {
  const pagesDir = path.resolve(__dirname, 'src/pages');
  const products = {};
  const htmlPlugins = [];
  
  if (fs.existsSync(pagesDir)) {
    const folders = fs.readdirSync(pagesDir).filter(folder => {
      const folderPath = path.join(pagesDir, folder);
      return fs.statSync(folderPath).isDirectory();
    });
    
    folders.forEach(folder => {
      const scriptPath = path.join(pagesDir, folder, 'script.js');
      const stylePath = path.join(pagesDir, folder, 'style.less');
      const htmlPath = path.join(pagesDir, folder, 'index.html');
      
      if (fs.existsSync(scriptPath) && fs.existsSync(stylePath) && fs.existsSync(htmlPath)) {
        products[folder] = [
          `./src/pages/${folder}/script.js`,
          `./src/pages/${folder}/style.less`
        ];
        
        htmlPlugins.push(new HtmlWebpackPlugin({
          template: `./src/pages/${folder}/index.html`,
          filename: `${folder}.html`,
          chunks: ['vendors', 'bootstrap', 'jquery', 'common', folder],
          minify: false,
          inject: 'body'
        }));
      }
    });
  }
  
  return { products, htmlPlugins };
}

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const { products, htmlPlugins } = getProductPages();
  
  return {
    entry: {
      // 首页入口
      index: './src/index.js',
      // 动态生成的产品页面入口
      ...products,
      // 公共依赖入口
      vendor: ['bootstrap', 'jquery']
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'assets/js/[name].[contenthash].js' : 'assets/js/[name].js',
      clean: true
    },
    
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProduction
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: !isProduction
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProduction
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[contenthash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[contenthash][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      // 提供全局变量
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }),
      
      // 首页HTML插件
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['vendors', 'bootstrap', 'jquery', 'common', 'index'],
        minify: false,
        inject: 'body'
      }),
      
      // 动态生成的HTML插件
      ...htmlPlugins,
      
      // 提取CSS到单独文件
      new MiniCssExtractPlugin({
        filename: isProduction ? 'assets/css/[name].[contenthash].css' : 'assets/css/[name].css'
      }),
      
      // 复制静态资源
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets/images',
            to: 'assets/images',
            noErrorOnMissing: true
          }
        ]
      })
    ],
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      port: 3001,
      open: true,
      hot: true,
      liveReload: true,
      compress: true,
      watchFiles: {
        paths: ['src/**/*.html'],
        options: {
          usePolling: false,
        },
      },
      historyApiFallback: {
        rewrites: Object.keys(products).map(product => ({
          from: new RegExp(`^\/${product}`), 
          to: `/${product}.html`
        }))
      },
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      }
    },
    
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          bootstrap: {
            test: /[\/]node_modules[\/]bootstrap[\/]/,
            name: 'bootstrap',
            chunks: 'all',
            priority: 20
          },
          jquery: {
            test: /[\/]node_modules[\/]jquery[\/]/,
            name: 'jquery',
            chunks: 'all',
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5
          }
        }
      }
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@common': path.resolve(__dirname, 'src/assets/css')
      }
    }
  };
};