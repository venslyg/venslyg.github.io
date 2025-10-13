// --- NEW: tsparticles configuration ---
// This code loads a beautiful, lightweight particle animation in the background.
window.addEventListener('load', () => {
  tsParticles.load("tsparticles", {
    fpsLimit: 60,
    background: {
      color: "#05060a",
    },
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#00bfff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.5,
        random: true,
      },
      size: {
        value: 3,
        random: { enable: true, minimumValue: 1 },
      },
      links: {
        enable: true,
        distance: 150,
        color: "#00bfff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      events: {
        onhover: {
          enable: true,
          mode: "repulse",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
      },
      modes: {
        repulse: {
          distance: 100,
        },
        push: {
          quantity: 4,
        },
      },
    },
    detectRetina: true,
  });
});

// NAV toggle (mobile)
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle && navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Active nav link on scroll
const navItems = document.querySelectorAll('.nav-link');
function clearActive() {
  navItems.forEach(n => n.classList.remove('active'));
}

// IntersectionObserver for sections to update nav and fade-in
const observerOpts = { root: null, rootMargin: '0px', threshold: 0.25 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
    if (entry.isIntersecting) {
      clearActive();
      if (navLink) navLink.classList.add('active');
      entry.target.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
      });
    }
  });
}, observerOpts);
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

// Smooth link behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open')) navLinks.classList.remove('open');
  });
});

// --- NEW: Horizontal scroll for projects ---
const projectsWrapper = document.querySelector('.projects-wrapper');
if (projectsWrapper) {
  projectsWrapper.addEventListener('wheel', (evt) => {
    // Prevent the default vertical scroll
    evt.preventDefault();
    // Add the vertical scroll amount to the horizontal scroll position
    projectsWrapper.scrollLeft += evt.deltaY;
  });
}

// --- PIANO JAVASCRIPT ---
const sampler = new Tone.Sampler({
  urls: { C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3" },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

const piano = document.querySelector(".piano");
const keys = document.querySelectorAll(".key");
const recordBtn = document.getElementById("recordBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const statusEl = document.getElementById("status");

let recording = false;
let isMouseDown = false;
let startTime = 0;
let recordedNotes = [];
let playbackTimeouts = [];

const keyMap = {a: "C4", w: "C#4", s: "D4", e: "D#4", d: "E4", f: "F4", t: "F#4", g: "G4", y: "G#4", h: "A4", u: "A#4", j: "B4", k: "C5"};

function noteOn(note, isKeyEvent = false) {
  const key = document.querySelector(`[data-note='${note}']`);
  if (!key || (isKeyEvent && key.classList.contains("active"))) return;
  sampler.triggerAttack(note);
  key.classList.add("active");
  if (recording) {
    recordedNotes.push({ note: note, time: Date.now() - startTime, duration: "8n" });
  }
}

function noteOff(note) {
  const key = document.querySelector(`[data-note='${note}']`);
  if (key) {
    sampler.triggerRelease(note);
    key.classList.remove("active");
  }
}

keys.forEach(key => {
  const note = key.dataset.note;
  key.addEventListener("mousedown", (e) => { e.stopPropagation(); noteOn(note); });
  key.addEventListener("mouseup", () => noteOff(note));
  key.addEventListener("mouseleave", () => noteOff(note));
  key.addEventListener("mouseover", () => { if (isMouseDown) noteOn(note); });
});

piano.addEventListener('mousedown', () => isMouseDown = true);
window.addEventListener('mouseup', () => {
  isMouseDown = false;
  sampler.releaseAll();
  keys.forEach(k => k.classList.remove('active'));
});

document.addEventListener("keydown", e => { if (keyMap[e.key] && !e.repeat) noteOn(keyMap[e.key], true); });
document.addEventListener("keyup", e => { if (keyMap[e.key]) noteOff(keyMap[e.key]); });

recordBtn.addEventListener("click", async () => {
  if (Tone.context.state !== 'running') await Tone.start();
  recording = !recording;
  if (recording) {
    recordedNotes = [];
    startTime = Date.now();
    statusEl.textContent = "Recording...";
    recordBtn.textContent = "⏹ Stop";
    playBtn.disabled = true;
  } else {
    statusEl.textContent = "Recorded 🎵";
    recordBtn.textContent = "⏺ Record";
    playBtn.disabled = recordedNotes.length === 0;
  }
});

function resetPlaybackUI() {
  statusEl.textContent = "Idle";
  playBtn.disabled = recordedNotes.length === 0;
  recordBtn.disabled = false;
  stopBtn.classList.add("hidden");
  keys.forEach(k => k.classList.remove('active'));
}

playBtn.addEventListener("click", () => {
  if (recordedNotes.length === 0) return;
  statusEl.textContent = "Playing...";
  playBtn.disabled = true;
  recordBtn.disabled = true;
  stopBtn.classList.remove("hidden");

  recordedNotes.forEach(noteEvent => {
    const timeoutId = setTimeout(() => {
      const key = document.querySelector(`[data-note='${noteEvent.note}']`);
      if (key) {
        sampler.triggerAttackRelease(noteEvent.note, noteEvent.duration);
        key.classList.add("active");
        setTimeout(() => key.classList.remove("active"), 200);
      }
    }, noteEvent.time);
    playbackTimeouts.push(timeoutId);
  });

  const lastNoteTime = recordedNotes.length > 0 ? recordedNotes[recordedNotes.length - 1].time : 0;
  const finalTimeoutId = setTimeout(resetPlaybackUI, lastNoteTime + 500);
  playbackTimeouts.push(finalTimeoutId);
});

stopBtn.addEventListener("click", () => {
  playbackTimeouts.forEach(id => clearTimeout(id));
  playbackTimeouts = [];
  sampler.releaseAll();
  resetPlaybackUI();
});