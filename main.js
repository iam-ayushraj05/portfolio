// --- Scroll Restoration ---
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
if (window.location.hash) {
    window.history.replaceState('', document.title, window.location.pathname + window.location.search);
}
window.scrollTo(0, 0);
setTimeout(() => window.scrollTo(0, 0), 10);

// --- EmailJS Setup ---
// ⚠️ REPLACE the values below with your own from https://www.emailjs.com/
const EMAILJS_PUBLIC_KEY = 'GDlHz3Pnp19XFW29h';   // EmailJS → Account → Public Key
const EMAILJS_SERVICE_ID = 'service_9hitxt5';   // EmailJS → Email Services → Service ID
const EMAILJS_TEMPLATE_ID = 'template_7o1t8qj';  // EmailJS → Email Templates → Template ID

emailjs.init(EMAILJS_PUBLIC_KEY);

const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formToast = document.getElementById('form-toast');

function showToast(message, success) {
    formToast.textContent = message;
    formToast.style.display = 'block';
    formToast.style.background = success
        ? 'rgba(34, 197, 94, 0.15)'
        : 'rgba(239, 68, 68, 0.15)';
    formToast.style.border = success
        ? '1px solid rgba(34, 197, 94, 0.4)'
        : '1px solid rgba(239, 68, 68, 0.4)';
    formToast.style.color = success ? '#22c55e' : '#ef4444';
    setTimeout(() => { formToast.style.display = 'none'; }, 5000);
}

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Sending...';

        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
            .then(() => {
                showToast('✅ Message sent! I\'ll get back to you soon.', true);
                contactForm.reset();
            })
            .catch((error) => {
                console.error('EmailJS Error:', error);
                showToast('❌ Something went wrong. Please try again or email me directly.', false);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:8px;"></i>Send Message';
            });
    });
}

// --- Theme Toggle (Light/Dark Mode) ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Check local storage for theme
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');

    if (isLight) {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    }
    updateThreeJsTheme(isLight);
});


// --- Three.js Particle Network Background ---
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();

// Theme-aware colors
const darkBg = 0x090514;
const lightBg = 0xF8FAFC;
const darkParticle = 0x3B82F6;   // blue — matches dark theme primary
const lightParticle = 0x2563EB;   // slightly deeper blue for light bg

scene.fog = new THREE.FogExp2(
    body.classList.contains('light-mode') ? lightBg : darkBg, 0.0012
);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Particles ---
const particlesCount = 280;
const positions = new Float32Array(particlesCount * 3);
const velocities = [];

for (let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 220;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 220;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 110;
    velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.15,
        z: (Math.random() - 0.5) * 0.15
    });
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMat = new THREE.PointsMaterial({
    color: body.classList.contains('light-mode') ? lightParticle : darkParticle,
    size: 0.55,
    transparent: true,
    opacity: 0.85
});

const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

const lineMat = new THREE.LineBasicMaterial({
    color: body.classList.contains('light-mode') ? lightParticle : darkParticle,
    transparent: true,
    opacity: 0.18
});

let linesMesh;

// --- Update colors when theme toggles ---
function updateThreeJsTheme(isLight) {
    scene.fog.color.setHex(isLight ? lightBg : darkBg);
    particlesMat.color.setHex(isLight ? lightParticle : darkParticle);
    lineMat.color.setHex(isLight ? lightParticle : darkParticle);
}

// --- Mouse parallax ---
let mouseX = 0, mouseY = 0;
const halfW = window.innerWidth / 2;
const halfH = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX - halfW;
    mouseY = e.clientY - halfH;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation loop ---
function animate() {
    requestAnimationFrame(animate);

    const pos = particlesMesh.geometry.attributes.position.array;

    for (let i = 0; i < particlesCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;
        if (Math.abs(pos[i * 3]) > 110) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 110) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 55) velocities[i].z *= -1;
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;

    // Build connecting lines between nearby particles
    const linePositions = [];
    for (let i = 0; i < particlesCount; i++) {
        for (let j = i + 1; j < particlesCount; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 22) {
                linePositions.push(
                    pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
                    pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
                );
            }
        }
    }

    if (linesMesh) scene.remove(linesMesh);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(linesMesh);

    // Smooth cursor-following camera
    camera.position.x += (mouseX * 0.04 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.04 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();


// --- GSAP Scroll Animations ---
gsap.registerPlugin(ScrollTrigger);

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

const tl = gsap.timeline();
tl.from('.logo', { y: -50, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.nav-links li', { y: -50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.6')
    .from('.hero-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4')
    .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4');

gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: { trigger: title, start: "top 85%" },
        y: 30, opacity: 0, duration: 0.8
    });
});

gsap.utils.toArray('.glass-panel').forEach(panel => {
    gsap.from(panel, {
        scrollTrigger: { trigger: panel, start: "top 85%" },
        y: 50, opacity: 0, duration: 1, ease: 'power3.out'
    });
});

// --- Typewriter Animation ---
const phrases = ['Full Stack Developer', 'Logical Problem Solver', 'DSA Enthusiast'];
const typeText = document.querySelector('.typewriter-text');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeDelay = 100;

function typeWriter() {
    if (!typeText) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typeText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50;
    } else {
        typeText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 100;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        typeDelay = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeDelay = 500;
    }

    setTimeout(typeWriter, typeDelay);
}

document.addEventListener('DOMContentLoaded', typeWriter);
