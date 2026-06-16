/* ==========================================================================
   1. PRELOADER ENGINE
   ========================================================================== */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }
});

/* ==========================================================================
   2. MOBILE NAVBAR NAVIGATION TOOGLE
   ========================================================================== */
const menuIcon = document.getElementById('menu-icon');
const navbar = document.querySelector('.navbar');

if (menuIcon && navbar) {
    menuIcon.addEventListener('click', () => {
        // Toggle Font Awesome icon representations
        menuIcon.firstElementChild.classList.toggle('fa-bars');
        menuIcon.firstElementChild.classList.toggle('fa-xmark');
        navbar.classList.toggle('active');
    });
}

// Close mobile navbar on selecting individual anchors
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navbar && navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            if (menuIcon) {
                menuIcon.firstElementChild.classList.add('fa-bars');
                menuIcon.firstElementChild.classList.remove('fa-xmark');
            }
        }
    });
});

/* ==========================================================================
   3. SCROLL ACTIVE LINK STATE & STICKY HEADER
   ========================================================================== */
const sections = document.querySelectorAll('section');
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    let top = window.scrollY;

    // Sticky navbar backdrop initialization
    if (header) {
        header.classList.toggle('sticky', top > 100);
    }

    // Scroll active element confirmation
    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                const targetLink = document.querySelector(`.navbar a[href*=${id}]`);
                if (targetLink) {
                    targetLink.classList.add('active');
                }
            });
        }
    });
});

/* ==========================================================================
   4. NATIVE TYPING ANIMATION ENGINE
   ========================================================================== */
const strings = [
    "Artificial Intelligence & Data Science Student",
    "Aspiring Software Developer",
    "Tech Enthusiast"
];
let stringIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetweenStrings = 2000;
const typingTextElement = document.querySelector('.typing-text');

function typeEffect() {
    if (!typingTextElement) return;

    const currentString = strings[stringIndex];

    if (isDeleting) {
        // Remove trailing character
        typingTextElement.textContent = currentString.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Append next character
        typingTextElement.textContent = currentString.substring(0, charIndex + 1);
        charIndex++;
    }

    let deltaSpeed = isDeleting ? erasingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentString.length) {
        // Wait at the completed string phrase
        deltaSpeed = delayBetweenStrings;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        // Proceed to adjacent array string
        stringIndex = (stringIndex + 1) % strings.length;
        deltaSpeed = 500;
    }

    setTimeout(typeEffect, deltaSpeed);
}

// Initialise structural animation loop on Document Object loading
document.addEventListener('DOMContentLoaded', () => {
    if (typingTextElement) {
        setTimeout(typeEffect, 1000);
    }
});

/* ==========================================================================
   5. LIGHT / DARK CONFIGURATION CONTROLLER
   ========================================================================== */
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Inspect persistence storage parameters for design system parameters
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        let currentTheme = htmlElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

/* ==========================================================================
   6. SCROLL REVEAL STRUCTURAL TRIGGERS
   ========================================================================== */
const revealElements = document.querySelectorAll('.reveal');

function checkReveal() {
    const triggerBottom = (window.innerHeight / 5) * 4;

    revealElements.forEach(el => {
        const boxTop = el.getBoundingClientRect().top;
        if (boxTop < triggerBottom) {
            el.classList.add('active');
        } else {
            // Optional: remove if you want elements to hide again when scrolling back up
            // el.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', checkReveal);
// Execute initial baseline assertion check on render lifecycle
document.addEventListener('DOMContentLoaded', checkReveal);

/* ==========================================================================
   7. INTERACTIVE CONTACT FORM INTERFACE LOGIC
   ========================================================================== */
const portfolioForm = document.getElementById('portfolioForm');
if (portfolioForm) {
    portfolioForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Fetch values for processing processing structures
        const name = document.getElementById('formName').value;
        const email = document.getElementById('formEmail').value;
        const subject = document.getElementById('formSubject').value;
        const message = document.getElementById('formMessage').value;

        // Custom validation or transmission execution logic
        alert(`Thank you, ${name}! Your validation message framework has successfully submitted. (Simulated handling via JavaScript)`);
        
        // Reset element states
        portfolioForm.reset();
    });
}