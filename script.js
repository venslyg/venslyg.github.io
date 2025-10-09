// NAV toggle (mobile)
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle && navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Active nav link on scroll
const navItems = document.querySelectorAll('.nav-link');
const sections = Array.from(navItems).map(a => document.querySelector(a.getAttribute('href')));

// Helper to remove active
function clearActive() {
  navItems.forEach(n => n.classList.remove('active'));
}

// Particle background
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create particles
const PARTICLE_COUNT = 80;
for(let i=0;i<PARTICLE_COUNT;i++){
  particles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx: (Math.random()-0.5)*0.3,
    vy: (Math.random()-0.5)*0.3,
    r: Math.random()*2+1
  });
}

// Animate particles
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='rgba(0,191,255,0.7)';
  particles.forEach(p=>{
    p.x+=p.vx;
    p.y+=p.vy;

    if(p.x<0||p.x>canvas.width) p.vx*=-1;
    if(p.y<0||p.y>canvas.height) p.vy*=-1;

    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// IntersectionObserver for sections to update nav and fade-in
const observerOpts = { root: null, rootMargin: '0px', threshold: 0.25 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
    if (entry.isIntersecting) {
      clearActive();
      if (navLink) navLink.classList.add('active');
      // add fade-in for visible elements
      entry.target.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      });
    }
  });
}, observerOpts);

// observe all main sections
document.querySelectorAll('section').forEach(s => io.observe(s));

// add small nav bg on scroll for readability
const navWrap = document.querySelector('.nav-wrap');
window.addEventListener('scroll', () => {
  if (window.scrollY > 24) {
    navWrap.style.background = 'linear-gradient(180deg, rgba(5,6,10,0.45), rgba(5,6,10,0.2))';
    navWrap.style.boxShadow = '0 6px 30px rgba(0,0,0,0.6)';
  } else {
    navWrap.style.background = 'transparent';
    navWrap.style.boxShadow = 'none';
  }
});

// Smooth link behavior (extra)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    // close mobile nav if open
    if (navLinks.classList.contains('open')) navLinks.classList.remove('open');

    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
