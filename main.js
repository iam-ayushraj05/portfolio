// --- Three.js Setup ---
const canvas = document.querySelector('#bg-canvas');

const scene = new THREE.Scene();
// No fog to keep it clean, or maybe subtle fog
scene.fog = new THREE.FogExp2(0x050505, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Transparent background
    antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// --- 3D Objects ---

// 1. Particles (Stars)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 150;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// 2. Abstract Geometric Shape (TorusKnot)
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
// Wireframe material for a tech/developer vibe
const material = new THREE.MeshBasicMaterial({ 
    color: 0x7000ff, 
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

// 3. Floating spheres around
const spheres = [];
const sphereGeo = new THREE.IcosahedronGeometry(1, 0);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    wireframe: true,
    transparent: true,
    opacity: 0.5
});

for(let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.x = (Math.random() - 0.5) * 40;
    sphere.position.y = (Math.random() - 0.5) * 40;
    sphere.position.z = (Math.random() - 0.5) * 20;
    
    // Add custom properties for animation
    sphere.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        speedRot: (Math.random() - 0.5) * 0.05
    };
    
    scene.add(sphere);
    spheres.push(sphere);
}


// --- Lights ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffcc, 1);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);


// --- Interaction & Animation ---

// Mouse Movement
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// Scroll Event for Navbar
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();

    // Rotate TorusKnot
    torusKnot.rotation.x = elapsedTime * 0.2;
    torusKnot.rotation.y = elapsedTime * 0.15;
    
    // Rotate Particles
    particlesMesh.rotation.y = elapsedTime * 0.05;

    // Animate floating spheres
    spheres.forEach(sphere => {
        sphere.rotation.x += sphere.userData.speedRot;
        sphere.rotation.y += sphere.userData.speedRot;
        
        sphere.position.y += Math.sin(elapsedTime * 2 + sphere.position.x) * 0.02;
    });

    // Mouse Parallax Effect
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

animate();

// --- GSAP HTML Animations ---
gsap.registerPlugin(ScrollTrigger);

// Hero Section Intro
const tl = gsap.timeline();
tl.from('.navbar', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' })
  .from('.hero h1', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
  .from('.hero p', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
  .from('.hero .cta-btn', { y: 20, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.8');

// Section Scroll Animations
gsap.utils.toArray('.glass-panel').forEach(panel => {
    gsap.from(panel, {
        scrollTrigger: {
            trigger: panel,
            start: "top 85%", // Animation starts when top of element hits 85% of viewport
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
});

gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: "top 80%"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out'
    });
});

// Animate progress bars
gsap.utils.toArray('.progress').forEach(progress => {
    const targetWidth = progress.style.width;
    progress.style.width = '0%';
    
    gsap.to(progress, {
        scrollTrigger: {
            trigger: '.skills-grid',
            start: "top 75%"
        },
        width: targetWidth,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.5
    });
});
