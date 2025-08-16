import { annotate } from "https://unpkg.com/rough-notation@0.5.1/lib/rough-notation.esm.js";

document.addEventListener('DOMContentLoaded', function() {
    // --- FLUID WAVE PRELOADER LOGIC ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const numberElement = document.getElementById('counter-number');
    const numberFluidLightElement = document.getElementById('counter-number-fluid-light');
    const numberFluidDarkElement = document.getElementById('counter-number-fluid-dark');
    const wavePathLight = document.getElementById('wave-path-light');
    const wavePathDark = document.getElementById('wave-path-dark');

    if (loaderWrapper && numberElement) {
        let animationFrameId;
        let startTime = null;
        const duration = 2500; // 2.5 seconds for the animation

        function updateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsedTime = timestamp - startTime;
            
            // Linear progress for both the number and the wave (0 to 1)
            const progress = Math.min(elapsedTime / duration, 1);

            // Update the displayed number using the steady, linear progress
            const currentValue = Math.floor(progress * 100);
            numberElement.textContent = currentValue;
            numberFluidLightElement.textContent = currentValue;
            numberFluidDarkElement.textContent = currentValue;
            
            // Animate the waves using the same linear progress to keep them perfectly in sync
            updateWaves(progress);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(updateCounter);
            } else {
                // Ensure final state is perfect
                numberElement.textContent = 100;
                numberFluidLightElement.textContent = 100;
                numberFluidDarkElement.textContent = 100;
                updateWaves(1);
                
                // Cancel animation frame and fade out the preloader
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                setTimeout(() => {
                    gsap.to(loaderWrapper, { 
                        opacity: 0, 
                        scale: 1.1,
                        duration: 0.75, 
                        ease: 'power2.inOut',
                        onComplete: () => {
                            loaderWrapper.style.display = 'none';
                            document.body.classList.remove('preloader-active');
                        }
                    });
                }, 800);
            }
        }
        
        function updateWaves(progress) {
            const time = Date.now() / 1200; 

            // --- Unified Tsunami Wave Parameters ---
            const maxAmplitude = 0.20; // The biggest the wave can be at the start
            const minAmplitude = 0.01; // The smallest the wave can be at the end
            // The wave's height now decreases as progress increases, making it realistic
            const amplitude = minAmplitude + (maxAmplitude - minAmplitude) * (1 - progress);
            
            // The average height of the top of the fluid (the light foam)
            const foamBaseHeight = (1 - progress) + amplitude;

            const frequency = 1.6;  
            const slosh = 0.4;      

            // Calculate the control points for the main wave shape
            const x1 = 0.5 - slosh * Math.sin(time * frequency);
            const y1 = foamBaseHeight + amplitude * Math.cos(time * frequency * 1.1);
            const x2 = 0.5 + slosh * Math.cos(time * frequency);
            const y2 = foamBaseHeight - amplitude * Math.sin(time * frequency * 1.2);

            // --- Light Wave Path (The Foam) ---
            const lightPath = `M -0.2,${foamBaseHeight} C ${x1},${y1} ${x2},${y2} 1.2,${foamBaseHeight} L 1.2,1 L -0.2,1 Z`;
            wavePathLight.setAttribute('d', lightPath);

            // --- Dark Wave Path (The Main Body) ---
            const bandThickness = 0.12; 
            
            const darkBaseHeight = foamBaseHeight - bandThickness;
            const dark_y1 = y1 - bandThickness;
            const dark_y2 = y2 - bandThickness;

            const darkPath = `M -0.2,${darkBaseHeight} C ${x1},${dark_y1} ${x2},${dark_y2} 1.2,${darkBaseHeight} L 1.2,1 L -0.2,1 Z`;
            wavePathDark.setAttribute('d', darkPath);
        }
        
        // Start the animation
        animationFrameId = requestAnimationFrame(updateCounter);
    }

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.from('.hero-content h1', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.5 });
    gsap.from('.hero-content p', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.8 });
    gsap.fromTo('.hero-content .btn-primary, .hero-content .btn-secondary', { y: 50, opacity: 0 }, { duration: 1, y: 0, opacity: 1, ease: 'power3.out', delay: 1.1, stagger: 0.2 });
    
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.to(title, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: title, start: 'top 85%' }
        });
    });
    
    gsap.utils.toArray('.fade-in').forEach(elem => {
        gsap.to(elem, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: elem, start: 'top 85%' }
        });
    });
    
    // Enhanced Cursor with Trail
    const cursorOuter = document.querySelector('.cursor-outer');
    const cursorInner = document.querySelector('.cursor-inner');
    const cursorTrails = document.querySelectorAll('.cursor-trail');
    
    if (cursorOuter) {
        let mouseX = 0, mouseY = 0;
        let outerX = 0, outerY = 0;
        
        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        gsap.ticker.add(() => {
            outerX += (mouseX - outerX) * 0.1;
            outerY += (mouseY - outerY) * 0.1;
            
            gsap.set(cursorOuter, { x: outerX, y: outerY });
            gsap.set(cursorInner, { x: mouseX, y: mouseY });
            gsap.set(cursorTrails, { x: mouseX, y: mouseY });
        });
    }
    
    // Sticky Header Scroll Effect
    const header = document.querySelector('.glass-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Enhanced Contact Form Logic with Validation
    const contactForm = document.getElementById('contact-form');

    // Helper: normalize Pakistani mobile numbers and validate
    function normalizePakistanMobile(raw) {
        if (!raw) return null;
        let digits = raw.replace(/[^0-9]/g, '');
        if (digits.startsWith('00')) digits = digits.slice(2);
        if (digits.startsWith('92')) {
            // ok
        } else if (digits.startsWith('0') && digits.length === 11 && digits[1] === '3') {
            digits = '92' + digits.slice(1);
        } else if (digits.length === 10 && digits[0] === '3') {
            digits = '92' + digits;
        }
        return /^92(3\d{9})$/.test(digits) ? digits : null;
    }

    // Set today's date as min for the date input
    const preferredDateInput = document.getElementById('preferred-date');
    if (preferredDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        preferredDateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        let isValid = true;
        const name = document.getElementById('name');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');
        const nameError = document.getElementById('name-error');
        const phoneError = document.getElementById('phone-error');
        const emailError = document.getElementById('email-error');
        
        if (!name.value.trim()) {
            name.classList.add('invalid');
            if (nameError) nameError.classList.add('show-error');
            isValid = false;
        } else {
            name.classList.remove('invalid');
            name.classList.add('valid');
            if (nameError) nameError.classList.remove('show-error');
        }
        
        const normalizedPhone = normalizePakistanMobile(phone.value);
        if (!normalizedPhone) {
            phone.classList.add('invalid');
            if (phoneError) phoneError.classList.add('show-error');
            isValid = false;
        } else {
            phone.classList.remove('invalid');
            phone.classList.add('valid');
            if (phoneError) phoneError.classList.remove('show-error');
        }
        
        if (email.value.trim() && !/\S+@\S+\.\S+/.test(email.value)) {
            email.classList.add('invalid');
            if (emailError) emailError.classList.add('show-error');
            isValid = false;
        } else {
            email.classList.remove('invalid');
            if (email.value.trim()) email.classList.add('valid');
            if (emailError) emailError.classList.remove('show-error');
        }
        
        if (!isValid) return;
        
        // Generate message
        const selectedServices = Array.from(document.querySelectorAll('.form-checkbox:checked')).map(cb => cb.value);
        let servicesText = selectedServices.length > 0 ? `I am interested in the following services: ${selectedServices.join(', ')}.` : "I'm interested in learning more about Hijama.";
        const preferredDate = preferredDateInput && preferredDateInput.value ? `\nPreferred date: ${preferredDateInput.value}` : '';
        const additionalMessage = document.getElementById('message').value.trim() ? `\nAdditional message: ${document.getElementById('message').value.trim()}` : '';
        const emailText = email.value.trim() ? `\nMy email is ${email.value}.` : '';
        
        const message = `Assalam-o-Alaikum Sobia,\n\nMy name is ${name.value}.\nMy phone number is ${phone.value}.${emailText}\n\n${servicesText}${preferredDate}${additionalMessage}\n\nPlease let me know about your availability for a session.\n\nJazakAllah Khair.`;
        
        document.getElementById('whatsappMessage').value = message;
        const messageOutput = document.getElementById('messageOutput');
        messageOutput.classList.remove('hidden');
        messageOutput.scrollIntoView({ behavior: 'smooth' });
        const whatsappNumber = '923170122099'; // wa.me expects international format without + or leading zeros
        document.getElementById('whatsappLink').href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    });
    
    // Real-time validation with cached error elements
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    // Cache error elements to avoid repeated DOM queries
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
            nameInput.classList.add('valid');
            nameInput.classList.remove('invalid');
            if (nameError) nameError.classList.remove('show-error');
        } else {
            nameInput.classList.remove('valid');
        }
    });
    
    phoneInput.addEventListener('input', () => {
        const normalized = normalizePakistanMobile(phoneInput.value);
        if (normalized) {
            phoneInput.classList.add('valid');
            phoneInput.classList.remove('invalid');
            if (phoneError) phoneError.classList.remove('show-error');
        } else {
            phoneInput.classList.remove('valid');
        }
    });
    
    emailInput.addEventListener('input', () => {
        if (!emailInput.value.trim() || /\S+@\S+\.\S+/.test(emailInput.value)) {
            emailInput.classList.remove('invalid');
            if (emailInput.value.trim()) emailInput.classList.add('valid');
            if (emailError) emailError.classList.remove('show-error');
        } else {
            emailInput.classList.remove('valid');
        }
    });
    
    // Copy Button Logic
    const copyButton = document.getElementById('copyButton');
    copyButton.addEventListener('click', async function() {
        const whatsappMessage = document.getElementById('whatsappMessage');
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(whatsappMessage.value);
                copyButton.textContent = 'Copied!';
            } else {
                // Safer fallback: select text and let user copy manually
                whatsappMessage.select();
                whatsappMessage.setSelectionRange(0, 99999); // For mobile devices
                copyButton.textContent = 'Text selected - Press Ctrl+C to copy';
                
                // Try modern approach one more time
                try {
                    await navigator.clipboard.writeText(whatsappMessage.value);
                    copyButton.textContent = 'Copied!';
                } catch (clipboardError) {
                    // If clipboard API fails, inform user to copy manually
                    console.log('Clipboard API failed, text is selected for manual copy');
                }
            }
        } catch (e) {
            copyButton.textContent = 'Please copy manually';
            console.error('Copy operation failed:', e);
        }
        setTimeout(() => { copyButton.textContent = 'Copy Message'; }, 2000);
    });
    
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Three.js Background
    let scene, camera, renderer, particles;
    function initThree() {
        const container = document.getElementById('three-bg');
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        
        const particleCount = 2000;
        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particleMaterial = new THREE.PointsMaterial({ size: 0.009, color: 0xffffff, transparent: true, opacity: 0.5 });
        particles = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particles);
        camera.position.z = 5;
    }
    
    // Encapsulate mouse tracking in object to avoid global pollution
    const mouseTracker = {
        x: 0,
        y: 0,
        update: function(event) {
            this.x = event.clientX;
            this.y = event.clientY;
        }
    };
    
    document.addEventListener('mousemove', (event) => {
        mouseTracker.update(event);
    });
    
    function animate() {
        requestAnimationFrame(animate);
        if (renderer) {
            if (particles) {
                particles.rotation.y += 0.00005;
                if(mouseTracker.x > 0) {
                    particles.rotation.y += (mouseTracker.x - window.innerWidth / 2) * 0.0000005;
                    particles.rotation.x += -(mouseTracker.y - window.innerHeight / 2) * 0.0000005;
                }
            }
            renderer.render(scene, camera);
        }
    }
    
    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    window.addEventListener('resize', onWindowResize, false);
    initThree();
    animate();

    // --- CHATBOT LOGIC (REFACTORED) ---
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbot = document.querySelector(".chatbot");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatOptionsContainer = document.querySelector(".chat-options");

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = '';
        if (className === "outgoing") {
            chatContent = `<p>${message}</p>`;
        } else {
            // For incoming messages, always include the icon
            chatContent = `<span class="icon"><i class="fas fa-robot"></i></span>`;
            if (message === "thinking") {
                chatContent += `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
            } else {
                chatContent += `<p>${message}</p>`;
            }
        }
        // Use textContent for security, then add HTML elements safely
        if (className === "outgoing") {
            const p = document.createElement('p');
            p.textContent = message;
            chatLi.appendChild(p);
        } else {
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.innerHTML = '<i class="fas fa-robot"></i>';
            chatLi.appendChild(icon);
            
            if (message === "thinking") {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'typing-indicator';
                typingDiv.innerHTML = '<span></span><span></span><span></span>';
                chatLi.appendChild(typingDiv);
            } else {
                const p = document.createElement('p');
                p.textContent = message;
                chatLi.appendChild(p);
            }
        }
        gsap.from(chatLi, { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' });
        return chatLi;
    }

    // Shortened initial options
    const initialOptions = [
        { text: "Services?", query: "services" },
        { text: "Pricing?", query: "pricing" },
        { text: "How to Book?", query: "book" },
        { text: "Timings?", query: "hours" }
    ];

    const displayInitialOptions = () => {
        // Clear container safely
        while (chatOptionsContainer.firstChild) {
            chatOptionsContainer.removeChild(chatOptionsContainer.firstChild);
        }
        initialOptions.forEach(option => {
            const button = document.createElement("button");
            button.textContent = option.text;
            button.addEventListener("click", () => handleChat(option.query, option.text));
            chatOptionsContainer.appendChild(button);
        });
    }

    const generateResponse = (thinkingLi, userMessage) => {
        let response = "I'm sorry, I didn't quite understand that. You can ask me about services, pricing, or how to book an appointment. Or, you can call us directly at +92 317 0122099 for more specific questions.";
        
        const lowerCaseMessage = userMessage.toLowerCase();

        if (lowerCaseMessage.includes("salam") || lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
            response = "Wa'alaikum assalam! How can I assist you today? You can ask about my services, prices, or how to book an appointment.";
        } else if (lowerCaseMessage.includes("service")) {
            response = "I offer a range of Hijama therapies including General Body, Sunnah Points, Pain Relief, Cosmetic, Head/Migraine, and Fertility/Hormonal balance. You can see more details in the <a href='#services' target='_blank' rel='noopener noreferrer' style='color: var(--secondary); text-decoration: underline;'>Services Section</a>.";
        } else if (lowerCaseMessage.includes("price") || lowerCaseMessage.includes("cost") || lowerCaseMessage.includes("rate")) {
            response = "Our sessions start from PKR 3,000. The final price depends on the type of therapy and the number of cups used. For a detailed quote, please fill out the contact form or call us.";
        } else if (lowerCaseMessage.includes("book") || lowerCaseMessage.includes("appointment")) {
            response = "You can book an appointment by filling out the <a href='#contact' target='_blank' rel='noopener noreferrer' style='color: var(--secondary); text-decoration: underline;'>contact form</a> on our website or by calling me directly at +92 317 0122099.";
        } else if (lowerCaseMessage.includes("hour") || lowerCaseMessage.includes("timing")) {
            response = "Our clinic is open from 11 AM to 7 PM, Monday to Saturday. We recommend booking an appointment in advance to ensure availability.";
        } else if (lowerCaseMessage.includes("what is hijama")) {
            response = "Hijama (cupping therapy) is an ancient healing practice that involves placing cups on the skin to create suction. It's known to help with pain, inflammation, blood flow, relaxation, and overall well-being.";
        }

        // Replace the thinking indicator with the actual response safely
        while (thinkingLi.firstChild) {
            thinkingLi.removeChild(thinkingLi.firstChild);
        }
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.innerHTML = '<i class="fas fa-robot"></i>';
        thinkingLi.appendChild(icon);
        
        const p = document.createElement('p');
        // Use innerHTML only for trusted content with links
        if (response.includes('<a href=')) {
            p.innerHTML = response;
        } else {
            p.textContent = response;
        }
        thinkingLi.appendChild(p);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    const handleChat = (query, displayText) => {
        const userMessage = query.trim();
        if(!userMessage) return;

        const messageToDisplay = displayText || userMessage;
        chatbox.appendChild(createChatLi(messageToDisplay, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        chatInput.value = "";
        chatInput.dispatchEvent(new Event('input')); // To update send button visibility
        // Clear container safely
        while (chatOptionsContainer.firstChild) {
            chatOptionsContainer.removeChild(chatOptionsContainer.firstChild);
        }

        setTimeout(() => {
            const thinkingLi = createChatLi("thinking", "incoming");
            chatbox.appendChild(thinkingLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(thinkingLi, userMessage);
            displayInitialOptions();
        }, 800);
    }
    
    chatInput.addEventListener("input", () => {
        sendChatBtn.style.visibility = chatInput.value.trim() ? "visible" : "hidden";
    });

    sendChatBtn.addEventListener("click", () => handleChat(chatInput.value));
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat(chatInput.value);
        }
    });

    chatbotToggler.addEventListener("click", (e) => {
        e.stopPropagation();
        document.body.classList.toggle("show-chatbot");
        document.body.classList.toggle("chatbot-open");
    });
    
    chatbot.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", (e) => {
        if(document.body.classList.contains("show-chatbot") && !chatbot.contains(e.target)) {
            document.body.classList.remove("show-chatbot");
            document.body.classList.remove("chatbot-open");
        }
    });

    displayInitialOptions();

    // Theme Toggler
    const themeToggler = document.getElementById('theme-toggler');
    themeToggler.addEventListener('click', () => {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                document.documentElement.classList.toggle('dark');
            });
        } else {
            document.documentElement.classList.toggle('dark');
        }
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const currentlyActive = document.querySelector('.faq-item.active');
            if (currentlyActive && currentlyActive !== item) {
                currentlyActive.classList.remove('active');
            }
            item.classList.toggle('active');
        });
    });

    // Scroll Progress
    const scrollProgress = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
    });

    // Rough Notation Highlighters
    const highlighters = document.querySelectorAll('.highlighter');
    highlighters.forEach(el => {
        const annotation = annotate(el, { type: 'highlight', color: 'rgba(193, 154, 107, 0.3)' });
        ScrollTrigger.create({
            trigger: el,
            start: 'top 80%',
            onEnter: () => annotation.show()
        });
    });

    // Service Selection Animation with subtle bounce
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                option.classList.add('selected');
                gsap.fromTo(option, { scale: 0.98 }, { scale: 1.03, duration: 0.18, ease: 'power2.out' });
            } else {
                option.classList.remove('selected');
                gsap.to(option, { scale: 1, duration: 0.18, ease: 'power2.out' });
            }
        });
    });

    // Contact form staggered reveal
    gsap.from('#contact-form > *', {
        opacity: 0,
        y: 15,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '#contact-form', start: 'top 85%' }
    });
});

// Magic UI Headline Animation
const headlineElement = document.getElementById('magic-ui-headline');
if (headlineElement) {
    const texts = ["Revitalize Your Health", "Naturally", "Experience Healing", "With Sobia's Hijama Therapy"];
    let textIndex = 0;

    function animateHeadlineText() {
        gsap.to(headlineElement, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => {
                headlineElement.textContent = texts[textIndex];
                textIndex = (textIndex + 1) % texts.length;
                gsap.to(headlineElement, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
            }
        });
    }
    // Initial display
    headlineElement.textContent = texts[textIndex];
    textIndex = (textIndex + 1) % texts.length;
    gsap.from(headlineElement, { opacity: 0, y: 50, duration: 1, ease: 'power3.out', delay: 0.5 });

    setInterval(animateHeadlineText, 4000); // Change text every 4 seconds
}

// Service Card 3D Tilt Animation with proper cleanup
const serviceCards = document.querySelectorAll('.service-card');
const serviceCardEventListeners = new Map();

serviceCards.forEach(card => {
    const mouseEnterHandler = () => {
        gsap.to(card, {
            rotationX: -5, 
            rotationY: 5,  
            scale: 1.03,   
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    const mouseLeaveHandler = () => {
        gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)',
            duration: 0.3,
            ease: 'power2.out'
        });
    };

    card.addEventListener('mouseenter', mouseEnterHandler);
    card.addEventListener('mouseleave', mouseLeaveHandler);
    
    // Store handlers for potential cleanup
    serviceCardEventListeners.set(card, { mouseEnterHandler, mouseLeaveHandler });
});

// Cleanup function for when page unloads
window.addEventListener('beforeunload', () => {
    serviceCardEventListeners.forEach((handlers, card) => {
        card.removeEventListener('mouseenter', handlers.mouseEnterHandler);
        card.removeEventListener('mouseleave', handlers.mouseLeaveHandler);
    });
    serviceCardEventListeners.clear();
});

// --- START: IMPROVED TESTIMONIAL CAROUSEL LOGIC ---
const carousel = document.getElementById('testimonial-carousel');
const prevBtn = document.getElementById('prev-testimonial');
const nextBtn = document.getElementById('next-testimonial');
const testimonialItems = Array.from(carousel.children);

let currentIndex = 0;
let visibleCards = 1;
let maxIndex = testimonialItems.length - 1;

function setupCarousel() {
    if (window.innerWidth >= 1024) { // Tailwind 'lg' breakpoint
        visibleCards = 3;
    } else if (window.innerWidth >= 768) { // Tailwind 'md' breakpoint
        visibleCards = 2;
    } else {
        visibleCards = 1;
    }
    maxIndex = Math.max(0, testimonialItems.length - visibleCards);
    
    if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
    }
    updateCarouselPosition();
}

function updateCarouselPosition() {
    let scrollAmount = 0;
    if (testimonialItems.length > 0 && currentIndex >= 0 && currentIndex < testimonialItems.length) {
        // Ensure the element exists and is rendered before accessing offsetLeft
        const currentItem = testimonialItems[currentIndex];
        if (currentItem && currentItem.offsetParent !== null) {
            scrollAmount = currentItem.offsetLeft;
        }
    }
    
    gsap.to(carousel, {
        x: -scrollAmount,
        duration: 0.6,
        ease: 'power3.inOut'
    });

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
}

// Add keyboard navigation support
const handleNext = () => {
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarouselPosition();
    }
};

const handlePrev = () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarouselPosition();
    }
};

nextBtn.addEventListener('click', handleNext);
nextBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
    }
});

prevBtn.addEventListener('click', handlePrev);
prevBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePrev();
    }
});

// Add arrow key navigation when carousel is focused
if (carousel) {
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleNext();
        }
    });
    
    // Make carousel focusable
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Testimonials carousel');
}

window.addEventListener('resize', setupCarousel);
setupCarousel();
// --- END: IMPROVED TESTIMONIAL CAROUSEL LOGIC ---
