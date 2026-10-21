document.addEventListener('DOMContentLoaded', () => {
    // 1. DARK MODE
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // 2. HEADER GLASSMORPHISM
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 3. MENU MOBILE
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('active'));
    });

    // 4. CAPTURA DE UTM E INJEÇÃO NO WHATSAPP (Inclui o botão flutuante)
    const urlParams = new URLSearchParams(window.location.search);
    let utmData = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
        if (urlParams.has(param)) utmData[param] = urlParams.get(param);
    });

    if (Object.keys(utmData).length > 0) {
        localStorage.setItem('utm_data', JSON.stringify(utmData));
    }

    function getUtmMessage(baseMessage) {
        const savedUtm = localStorage.getItem('utm_data');
        if (savedUtm) {
            const utm = JSON.parse(savedUtm);
            const source = utm.utm_source ? ` (${utm.utm_source})` : '';
            return `${baseMessage} [Vim pelo site${source}]`;
        }
        return baseMessage;
    }

    // Atualiza TODOS os links do WhatsApp (incluindo o botão flutuante #whatsapp-float)
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        const url = new URL(link.href);
        const text = url.searchParams.get('text') || 'Olá! Vim pelo site e gostaria de fazer um pedido.';
        url.searchParams.set('text', getUtmMessage(text));
        link.href = url.toString();
    });

    // 5. FAQ ACCORDION
    document.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // 6. FORMULÁRIO INTELIGENTE
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');

    const savedDraft = localStorage.getItem('form_draft');
    if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        nameInput.value = draft.name || '';
        phoneInput.value = draft.phone || '';
        messageInput.value = draft.message || '';
    }

    form.addEventListener('input', () => {
        localStorage.setItem('form_draft', JSON.stringify({
            name: nameInput.value, phone: phoneInput.value, message: messageInput.value
        }));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const message = messageInput.value.trim();
        const utmText = getUtmMessage('');

        if (!name || !phone || !message) return;

        const waMessage = `*Nova Mensagem do Site*\n\n*Nome:* ${name}\n*Telefone:* ${phone}\n*Mensagem:* ${message}\n${utmText}`;
        const waLink = `https://wa.me/5511920490445?text=${encodeURIComponent(waMessage)}`;
        const emailSubject = `Contato do Site: ${name}`;
        const emailBody = `Nome: ${name}\nTelefone: ${phone}\nMensagem: ${message}`;
        const emailLink = `mailto:sfjacksonsoares@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

        document.getElementById('modal-wa-link').href = waLink;
        document.getElementById('modal-email-link').href = emailLink;
        document.getElementById('success-modal').classList.remove('hidden');
        
        form.reset();
        localStorage.removeItem('form_draft');
        trackEvent('form_submission', { method: 'contact_form' });
    });

    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
    });

    // 7. LGPD & RASTREAMENTO
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookies_accepted')) {
        cookieBanner.classList.remove('hidden');
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookies_accepted', 'true');
        cookieBanner.classList.add('hidden');
        trackEvent('cookie_consent', { status: 'accepted' });
    });

    window.trackEvent = function(eventName, parameters = {}) {
        if (localStorage.getItem('cookies_accepted') === 'true') {
            console.log(`[Marketing] Evento: ${eventName}`, parameters);
            // Descomente para ativar GA4 / Meta Pixel:
            // if (typeof gtag !== 'undefined') gtag('event', eventName, parameters);
            // if (typeof fbq !== 'undefined') fbq('trackCustom', eventName, parameters);
        }
    };
});