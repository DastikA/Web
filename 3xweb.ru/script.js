document.addEventListener('DOMContentLoaded', () => {
    // --- 0. СОЗДАНИЕ КУРСОРA ---
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);

    const burgerBtn = document.getElementById('burgerBtn');
    const closeBtn = document.getElementById('closeBtn');
    const fullMenu = document.getElementById('fullMenu');
    const textElement = document.getElementById('changingText');

    // --- 1. УПРАВЛЕНИЕ КУРСОРОМ ---
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    });

    // Делегирование ховера: работает даже для новых элементов
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .burger, .portfolio-card, .logo, .menu-socials a, .option-card')) {
            cursor.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .burger, .portfolio-card, .logo, .menu-socials a, .option-card')) {
            cursor.classList.remove('hover');
        }
    });

    // --- 2. МЕНЮ ---
    if (burgerBtn && fullMenu) {
        burgerBtn.addEventListener('click', () => {
            fullMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && fullMenu) {
        closeBtn.addEventListener('click', () => {
            fullMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // --- 3. СМЕНА ТЕКСТА ---
    const phrases = ["Интересует Разработка веб-сайта", "Интересует Поддержка сайта", "Интересует Продвижение сайта"];
    let currentIndex = 0;
    if (textElement) {
        setInterval(() => {
            textElement.style.opacity = '0';
            textElement.style.transform = 'translateY(20px)';
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % phrases.length;
                textElement.textContent = phrases[currentIndex];
                textElement.style.opacity = '1';
                textElement.style.transform = 'translateY(0)';
            }, 600);
        }, 4000);
    }

    // --- 4. АНИМАЦИЯ СКРОЛЛА ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.portfolio-card, .service-item, .footer-main').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
        observer.observe(el);
    });

    // --- 5. МОДАЛЬНОЕ ОКНО ---
    const modal = document.getElementById('modalForm');
    const openModalBtns = document.querySelectorAll('.btn-request, .btn-main, .btn-outline');
    const closeModal = document.getElementById('closeModal');

    if (modal) {
        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Если это кнопка "Узнать стоимость" на главной, открываем модалку вместо перехода
                if (btn.classList.contains('btn-main') && window.location.pathname.includes('index.html')) {
                    e.preventDefault();
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else if (!btn.getAttribute('href') || btn.getAttribute('href') === '#') {
                    e.preventDefault();
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // Закрытие по крестику
        closeModal?.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // --- 6. ОТПРАВКА ФОРМ (БРИФ И МОДАЛКА) ---
    const handleFormSubmit = async (formElement) => {
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formElement.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            const data = new FormData(formElement);
            btn.textContent = 'Отправка...';
            btn.disabled = true;

            try {
                const response = await fetch(formElement.action || "https://formspree.io/f/xlgzggjz", {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    alert('Спасибо! Сообщение успешно отправлено.');
                    formElement.reset();
                    if (modal) modal.classList.remove('active');
                    document.body.style.overflow = '';
                } else {
                    throw new Error();
                }
            } catch {
                alert('Ошибка отправки. Попробуйте еще раз или напишите на hello@3xweb.ru');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    };

    const modalFormElement = modal?.querySelector('form');
    const briefFormElement = document.getElementById('quizForm');

    if (modalFormElement) handleFormSubmit(modalFormElement);
    if (briefFormElement) handleFormSubmit(briefFormElement);

    // --- 7. ПЕРЕКЛЮЧЕНИЕ ШАГОВ БРИФА ---
    if (briefFormElement) {
        const steps = document.querySelectorAll('.brief-step');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const currentStepText = document.getElementById('currentStep');
        const submitBtn = document.getElementById('submitBtn');
        let currentStep = 0;

        function updateStep() {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            if (currentStepText) currentStepText.textContent = currentStep + 1;
            if (prevBtn) prevBtn.style.display = currentStep === 0 ? 'none' : 'block';
            
            if (currentStep === steps.length - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }

        nextBtn?.addEventListener('click', () => { if (currentStep < steps.length - 1) { currentStep++; updateStep(); } });
        prevBtn?.addEventListener('click', () => { if (currentStep > 0) { currentStep--; updateStep(); } });
    }
});