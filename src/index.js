// 首页JavaScript文件
// 导入Bootstrap和jQuery
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import $ from 'jquery';

// 导入样式（如果有的话）
import './index.css';

// 页面加载完成后执行
$(document).ready(function() {
    console.log('首页加载完成');
    
    // 添加按钮点击动画效果
    $('.nav-btn').on('mouseenter', function() {
        $(this).addClass('animate__animated animate__pulse');
    }).on('mouseleave', function() {
        $(this).removeClass('animate__animated animate__pulse');
    });
    
    // 平滑滚动效果（如果需要的话）
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });
});

// 导出环境变量（可以在模板中使用）
export const env = {
    APP_TITLE: import.meta.env.VITE_APP_TITLE || '多产品详细介绍页面项目',
    BASE_URL: import.meta.env.VITE_APP_BASE_URL || '/',
    APP_ENV: import.meta.env.VITE_APP_ENV || 'production'
};