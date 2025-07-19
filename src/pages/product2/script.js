// 导入样式
import './style.scss';

// 导入Bootstrap和jQuery（如果需要的话）
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import $ from 'jquery';

// 导入公共工具函数
import { smoothScroll, validateForm, showNotification, debounce, throttle } from '../../assets/js/utils.js';

// 导出环境变量（可以在模板中使用）
export const env = {
    APP_TITLE: import.meta.env.VITE_APP_TITLE || '产品2',
    APP_PRODUCT: import.meta.env.VITE_APP_PRODUCT || 'product2',
    BASE_URL: import.meta.env.VITE_APP_BASE_URL || '/',
    APP_ENV: import.meta.env.VITE_APP_ENV || 'production'
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTabSwitching();
    initContactForm();
    initScrollEffects();
    initAnimations();
    initScrollIndicator();
    initLazyLoading();
});

// 导航功能
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 滚动时导航栏样式变化
    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // 平滑滚动到锚点
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // 考虑固定导航栏高度
                smoothScroll(targetElement, 800);
            }
        });
    });
    
    // 高亮当前导航项
    const sections = document.querySelectorAll('section[id]');
    const highlightNavigation = throttle(() => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100);
    
    window.addEventListener('scroll', highlightNavigation);
}

// 选项卡切换功能
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
                
                // 添加淡入动画
                targetPane.style.opacity = '0';
                setTimeout(() => {
                    targetPane.style.opacity = '1';
                    targetPane.style.transition = 'opacity 0.3s ease';
                }, 50);
            }
        });
    });
}

// 联系表单功能
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // 表单验证
            const validationRules = {
                name: { required: true, minLength: 2 },
                email: { required: true, email: true },
                company: { required: true, minLength: 2 },
                message: { required: true, minLength: 10 }
            };
            
            const validation = validateForm(data, validationRules);
            
            if (!validation.isValid) {
                showNotification(validation.errors.join('\n'), 'error');
                return;
            }
            
            // 显示加载状态
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;
            
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // 成功处理
                showNotification('感谢您的咨询！我们将在24小时内与您联系。', 'success');
                form.reset();
                
                // 可以在这里添加实际的API调用
                // const response = await fetch('/api/contact', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(data)
                // });
                
            } catch (error) {
                showNotification('提交失败，请稍后重试。', 'error');
                console.error('Form submission error:', error);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // 实时表单验证
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', debounce(function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            }, 300));
        });
    }
}

// 单个字段验证
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // 移除之前的错误状态
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 验证规则
    switch (fieldName) {
        case 'name':
            if (!value) {
                isValid = false;
                errorMessage = '请输入姓名';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = '姓名至少需要2个字符';
            }
            break;
            
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                isValid = false;
                errorMessage = '请输入邮箱地址';
            } else if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '请输入有效的邮箱地址';
            }
            break;
            
        case 'company':
            if (!value) {
                isValid = false;
                errorMessage = '请输入公司名称';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = '公司名称至少需要2个字符';
            }
            break;
            
        case 'message':
            if (!value) {
                isValid = false;
                errorMessage = '请输入需求描述';
            } else if (value.length < 10) {
                isValid = false;
                errorMessage = '需求描述至少需要10个字符';
            }
            break;
    }
    
    if (!isValid) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorElement);
    }
    
    return isValid;
}

// 滚动效果
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                
                // 为统计数字添加计数动画
                if (entry.target.classList.contains('stat-number') || 
                    entry.target.classList.contains('benefit-number') ||
                    entry.target.classList.contains('result-number')) {
                    animateNumber(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll(
        '.hero-title, .hero-subtitle, .section-title, .section-subtitle, ' +
        '.feature-item, .case-card, .stat-number, .benefit-number, .result-number'
    );
    
    animateElements.forEach(el => observer.observe(el));
}

// 数字计数动画
function animateNumber(element) {
    const finalNumber = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const suffix = element.textContent.replace(/[0-9]/g, '');
    const duration = 2000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentNumber = Math.floor(finalNumber * easeOutQuart);
        
        element.textContent = currentNumber + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = finalNumber + suffix;
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 动画效果
function initAnimations() {
    // 案例卡片悬停效果
    const caseCards = document.querySelectorAll('.case-card');
    caseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 特性项目悬停效果
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 15px 35px rgba(37, 99, 235, 0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // 按钮点击波纹效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 添加波纹动画CSS
    if (!document.querySelector('#ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 滚动进度指示器
function initScrollIndicator() {
    // 创建滚动指示器
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = '<div class="progress-bar"></div>';
    document.body.appendChild(indicator);
    
    const progressBar = indicator.querySelector('.progress-bar');
    
    const updateProgress = throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }, 10);
    
    window.addEventListener('scroll', updateProgress);
}

// 图片懒加载
function initLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // 添加加载动画
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = () => {
                    img.style.opacity = '1';
                };
                
                // 如果图片已经加载完成
                if (img.complete) {
                    img.style.opacity = '1';
                }
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 页面性能优化
function optimizePerformance() {
    // 预加载关键资源
    const criticalImages = [
        '/assets/images/product2/hero-dashboard.svg',
        '/assets/images/logo.svg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // 延迟加载非关键脚本
    window.addEventListener('load', () => {
        // 可以在这里加载分析脚本等
        console.log('Page fully loaded - ready for analytics');
    });
}

// 错误处理
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // 可以在这里添加错误报告逻辑
});

// 导出函数供其他模块使用
export {
    initNavigation,
    initTabSwitching,
    initContactForm,
    initScrollEffects,
    initAnimations
};

// 初始化性能优化
optimizePerformance();