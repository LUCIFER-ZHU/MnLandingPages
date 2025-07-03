// 导入依赖
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import $ from 'jquery';

// 导入公共工具函数
import { smoothScroll, validateForm, showNotification } from '../../assets/js/utils.js';

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initNavigation();
    initContactForm();
    initScrollEffects();
    initAnimations();
});

// 导航功能
function initNavigation() {
    // 平滑滚动到锚点
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                smoothScroll(targetElement, 1000);
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
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单验证
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                message: formData.get('message')
            };
            
            // 验证必填字段
            if (!validateForm(data)) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showNotification('请输入有效的邮箱地址', 'error');
                return;
            }
            
            // 提交表单
            submitContactForm(data);
        });
    }
}

// 提交联系表单
async function submitContactForm(data) {
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // 显示加载状态
        submitButton.textContent = '发送中...';
        submitButton.disabled = true;
        
        // 模拟API调用（实际项目中替换为真实的API端点）
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showNotification('消息发送成功！我们会尽快与您联系。', 'success');
            document.getElementById('contactForm').reset();
        } else {
            throw new Error('发送失败');
        }
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

// 添加CSS动画类
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .navbar {
        transition: transform 0.3s ease, background-color 0.3s ease;
    }
    
    .navbar.scrolled {
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .pricing-card.selected {
        border-color: #007bff;
        box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
    }
    
    .feature-card, .pricing-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
`;
document.head.appendChild(style);

// 导出模块（如果需要在其他地方使用）
export {
    initNavigation,
    initContactForm,
    initScrollEffects,
    initAnimations
};
