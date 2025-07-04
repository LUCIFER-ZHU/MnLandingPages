// 导入公共工具函数
import { smoothScroll, validateForm, showNotification } from '../../assets/js/utils.js';

// 导入样式
import './style.scss';

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initNavigation();
    initContactForm();
    initScrollEffects();
    initAnimations();
    initResponsiveMenu();
});

// 导航功能
function initNavigation() {
    // 平滑滚动到锚点
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                smoothScroll(targetElement, 1000);
                
                // 如果移动菜单处于打开状态，点击链接后关闭它
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const menuToggle = document.querySelector('.mobile-menu-toggle i');
                    if (menuToggle) {
                        menuToggle.classList.remove('fa-times');
                        menuToggle.classList.add('fa-bars');
                    }
                }
            }
        });
    });
    
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 添加/移除背景模糊效果
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // 向上滚动时显示导航栏，向下滚动时隐藏
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 联系表单功能
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单验证
            const formData = new FormData(this);
            const inputs = contactForm.querySelectorAll('input, textarea');
            let data = {};
            
            inputs.forEach(input => {
                if (input.name) {
                    data[input.name] = input.value;
                } else {
                    // 如果没有name属性，使用placeholder作为键名
                    const key = input.placeholder.toLowerCase().replace(/\s+/g, '_');
                    data[key] = input.value;
                }
            });
            
            // 验证必填字段
            const hasEmptyFields = Array.from(inputs).some(input => !input.value.trim());
            if (hasEmptyFields) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            // 验证邮箱格式
            const emailInput = contactForm.querySelector('input[type="email"]');
            if (emailInput) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    showNotification('请输入有效的邮箱地址', 'error');
                    return;
                }
            }
            
            // 提交表单
            submitContactForm(data, contactForm);
        });
    }
}

// 提交联系表单
async function submitContactForm(data, formElement) {
    const submitButton = formElement.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // 显示加载状态
        submitButton.textContent = '发送中...';
        submitButton.disabled = true;
        
        // 模拟API调用（实际项目中替换为真实的API端点）
        // 使用setTimeout模拟网络请求
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 模拟成功响应
        showNotification('消息发送成功！我们会尽快与您联系。', 'success');
        formElement.reset();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showNotification('发送失败，请稍后重试或直接联系我们。', 'error');
    } finally {
        // 恢复按钮状态
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// 滚动效果
function initScrollEffects() {
    // 创建Intersection Observer来处理元素进入视口的动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    const animateElements = document.querySelectorAll(
        '.feature-card, .benefit-item, .pricing-card, .hero-title, .hero-subtitle'
    );
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// 初始化动画
function initAnimations() {
    // 为卡片添加悬停效果
    const cards = document.querySelectorAll('.feature-card, .pricing-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 价格卡片点击效果
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const button = card.querySelector('.btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 添加选中效果
                pricingCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // 滚动到联系表单
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    smoothScroll(contactSection, 1000);
                    
                    // 在表单中预填充选择的方案
                    const planName = card.querySelector('h3').textContent;
                    const messageField = document.getElementById('message');
                    if (messageField && !messageField.value) {
                        messageField.value = `我对${planName}感兴趣，希望了解更多详情。`;
                    }
                }
            });
        }
    });
}

// 页面性能优化
function optimizePerformance() {
    // 图片懒加载
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 响应式菜单功能
function initResponsiveMenu() {
    // 检查是否已经存在移动菜单按钮
    if (document.querySelector('.mobile-menu-toggle')) {
        return;
    }
    
    const navbar = document.querySelector('.navbar .container');
    const navLinks = document.querySelector('.nav-links');
    
    if (!navbar || !navLinks) return;
    
    // 创建移动菜单按钮
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    // 插入按钮到导航栏
    navbar.insertBefore(mobileMenuToggle, navLinks);
    
    // 添加点击事件
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // 切换图标
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-toggle {
                display: block;
                background: none;
                border: none;
                font-size: 24px;
                color: #333;
                cursor: pointer;
                z-index: 1001;
            }
            
            .nav-links {
                position: fixed;
                top: 0;
                right: -100%;
                width: 70%;
                height: 100vh;
                background: white;
                flex-direction: column;
                padding: 80px 30px 30px;
                transition: right 0.3s ease;
                box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            
            .nav-links.active {
                right: 0;
                display: flex;
            }
            
            .nav-links a {
                margin: 10px 0;
                font-size: 18px;
            }
        }
    `;
    document.head.appendChild(style);
}

// 导出模块（如果需要在其他地方使用）
export {
    initNavigation,
    initContactForm,
    initScrollEffects,
    initAnimations,
    initResponsiveMenu
};
