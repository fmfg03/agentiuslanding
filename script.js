// Agentius v2.0 JavaScript - Conversion Focused

// DOM Elements
const activeAgentsEl = document.getElementById('active-agents');
const tasksCompletedEl = document.getElementById('tasks-completed');
const hoursSavedEl = document.getElementById('hours-saved');
const timestampEl = document.getElementById('timestamp');
const nextSlotEl = document.getElementById('next-slot');
const agentsWorkingEl = document.getElementById('agents-working');
const processesAutomatedEl = document.getElementById('processes-automated');
const stickyCta = document.getElementById('sticky-cta');

// Live Metrics Animation
function updateLiveMetrics() {
    // Active agents (127-150)
    const activeAgents = Math.floor(Math.random() * 24) + 127;
    if (activeAgentsEl) activeAgentsEl.textContent = activeAgents;
    
    // Tasks completed today (2800-3000)
    const tasksCompleted = Math.floor(Math.random() * 200) + 2800;
    if (tasksCompletedEl) tasksCompletedEl.textContent = tasksCompleted.toLocaleString();
    
    // Hours saved (15000-16000)
    const hoursSaved = Math.floor(Math.random() * 1000) + 15000;
    if (hoursSavedEl) hoursSavedEl.textContent = hoursSaved.toLocaleString();
    
    // Agents working right now (3-8)
    const agentsWorking = Math.floor(Math.random() * 6) + 3;
    if (agentsWorkingEl) agentsWorkingEl.textContent = agentsWorking;
    
    // Processes automated today (10-20)
    const processesAutomated = Math.floor(Math.random() * 11) + 10;
    if (processesAutomatedEl) processesAutomatedEl.textContent = processesAutomated;
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    if (timestampEl) timestampEl.textContent = timeString;
}

// Calculate next available slot (always 7-14 days from now)
function updateNextSlot() {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 8) + 7; // 7-14 days
    const nextSlot = new Date(today.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    
    if (nextSlotEl) {
        nextSlotEl.textContent = nextSlot.toLocaleDateString('es-ES', options);
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Form handling with conversion tracking
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Track conversion event
            trackConversion('form_submit', {
                form_id: form.id,
                objetivo: data.objetivo || '',
                email: data.email || ''
            });
            
            // Show success message
            showSuccessMessage(form);
            
            // Here you would normally send to your backend/CRM
            console.log('Form submitted:', data);
        });
    });
}

// Show success message after form submission
function showSuccessMessage(form) {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = `
        <h3>¡SPRINT AGENDADO!</h3>
        <p>Respuesta en menos de 2 horas.</p>
        <p>Revisa tu email para los próximos pasos.</p>
    `;
    
    successDiv.style.cssText = `
        background-color: var(--primary);
        color: var(--background);
        padding: 20px;
        text-align: center;
        margin-top: 20px;
        border: 2px solid var(--primary);
    `;
    
    form.style.display = 'none';
    form.parentNode.appendChild(successDiv);
    
    // Hide sticky CTA after conversion
    if (stickyCta) {
        stickyCta.style.display = 'none';
    }
}

// Conversion tracking function
function trackConversion(event, data) {
    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            event_category: 'conversion',
            event_label: data.form_id,
            value: 1
        });
    }
    
    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: event,
            content_category: 'agentius_v2'
        });
    }
    
    // Console log for debugging
    console.log('Conversion tracked:', event, data);
}

// Sticky CTA behavior
function initStickyCta() {
    if (!stickyCta) return;
    
    let isVisible = false;
    
    function toggleStickyCta() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Show after scrolling 50% of the page
        const shouldShow = scrollPosition > (documentHeight - windowHeight) * 0.5;
        
        if (shouldShow && !isVisible) {
            stickyCta.style.display = 'block';
            stickyCta.style.animation = 'slideInUp 0.5s ease-out';
            isVisible = true;
        } else if (!shouldShow && isVisible) {
            stickyCta.style.display = 'none';
            isVisible = false;
        }
    }
    
    window.addEventListener('scroll', toggleStickyCta);
    
    // Click handler for sticky CTA
    stickyCta.addEventListener('click', function() {
        const formulario = document.getElementById('formulario');
        if (formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Track CTA click
        trackConversion('sticky_cta_click', {
            position: 'bottom_right'
        });
    });
}

// Agent card hover effects
function initAgentCardEffects() {
    const agentCards = document.querySelectorAll('.agente-card');
    
    agentCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add glow effect
            this.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.4)';
            
            // Track hover for engagement
            const agentType = this.dataset.agente;
            trackConversion('agent_card_hover', {
                agent_type: agentType
            });
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// Typing effect for hero title
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-text, .typing-text-2');
    
    typingElements.forEach((element, index) => {
        const text = element.textContent;
        element.textContent = '';
        
        let i = 0;
        const delay = index * 2000; // Delay for second element
        
        setTimeout(() => {
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    // Remove cursor after typing is complete
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            }, 100);
        }, delay);
    });
}

// Matrix background effect (lightweight)
function initMatrixBackground() {
    const canvas = document.createElement('canvas');
    canvas.className = 'matrix-bg';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const chars = '01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 100);
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Track section view
                const sectionId = entry.target.id || entry.target.className;
                trackConversion('section_view', {
                    section: sectionId
                });
            }
        });
    }, observerOptions);
    
    // Observe all major sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Console easter egg for developers
function initConsoleEasterEgg() {
    console.log(`
    ╔══════════════════════════════════════╗
    ║            AGENTIUS v2.0             ║
    ║        Sistema de Agentes IA         ║
    ╠══════════════════════════════════════╣
    ║  ¿Eres desarrollador?                ║
    ║  Contáctanos: dev@agentius.ai        ║
    ║                                      ║
    ║  Agentes disponibles:                ║
    ║  • Site Builder                      ║
    ║  • Lead Generator                    ║
    ║  • Reporting Agent                   ║
    ║  • Ops Streamliner                   ║
    ╚══════════════════════════════════════╝
    `);
    
    console.log('🤖 Tip: Escribe "agentius.help()" para ver comandos disponibles');
    
    // Add global helper function
    window.agentius = {
        help: function() {
            console.log(`
            Comandos disponibles:
            • agentius.stats() - Ver métricas en tiempo real
            • agentius.agents() - Listar agentes disponibles
            • agentius.contact() - Información de contacto
            `);
        },
        stats: function() {
            console.log('📊 Métricas actuales:', {
                agentes_activos: activeAgentsEl?.textContent || 'N/A',
                tareas_completadas: tasksCompletedEl?.textContent || 'N/A',
                horas_ahorradas: hoursSavedEl?.textContent || 'N/A'
            });
        },
        agents: function() {
            console.log('🤖 Agentes disponibles:', [
                'Reporting Agent - Automatiza reportes',
                'Lead Generator - Genera leads automáticamente',
                'Site Builder - Construye sitios web',
                'Ops Streamliner - Optimiza operaciones'
            ]);
        },
        contact: function() {
            console.log('📧 Contacto: execute@agentius.ai');
            console.log('🌐 Web: https://agentius.ai');
        }
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    updateLiveMetrics();
    updateTimestamp();
    updateNextSlot();
    initSmoothScrolling();
    initFormHandling();
    initStickyCta();
    
    // Visual effects
    initAgentCardEffects();
    initTypingEffect();
    initMatrixBackground();
    initScrollAnimations();
    
    // Developer features
    initConsoleEasterEgg();
    
    // Update metrics every 5 seconds
    setInterval(updateLiveMetrics, 5000);
    
    // Update timestamp every second
    setInterval(updateTimestamp, 1000);
    
    console.log('🚀 Agentius v2.0 initialized - Ready to convert!');
});

// Track page load
window.addEventListener('load', function() {
    trackConversion('page_load', {
        version: 'v2.0',
        timestamp: new Date().toISOString()
    });
});

// Track exit intent (when user moves mouse to top of page)
document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0) {
        trackConversion('exit_intent', {
            time_on_page: Date.now() - performance.timing.navigationStart
        });
        
        // Could show exit intent popup here
        console.log('🚨 Exit intent detected - Consider showing offer popup');
    }
});

// Keyboard shortcuts for power users
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus on contact form
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const formulario = document.getElementById('formulario');
        if (formulario) {
            formulario.scrollIntoView({ behavior: 'smooth' });
            const firstInput = formulario.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateLiveMetrics,
        trackConversion,
        initFormHandling
    };
}

