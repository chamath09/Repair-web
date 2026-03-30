/* ═══════════════════════════════════════════
   Paul's Auto Repair — Scripts
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── Mobile nav toggle ──
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    navLinks.classList.toggle('is-open', isOpen);
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) {
        isOpen = false;
        navLinks.classList.remove('is-open');
        const spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
  });

  // ── Scroll reveal (AOS-style) ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.15 });

  document.querySelectorAll('[data-aos]').forEach(el => revealObserver.observe(el));

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Stagger card animations ──
  document.querySelectorAll('.service-card[data-aos]').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.why-card[data-aos]').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });


  // ═══════════════════════════════════════════
  //  TESTIMONIAL SLIDER
  // ═══════════════════════════════════════════

  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');

  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    let current = 0;
    let autoPlayTimer = null;
    let startX = 0;
    let isDragging = false;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.testimonials__dot');

    function goTo(index) {
      current = ((index % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn.addEventListener('click', () => { next(); resetAutoPlay(); });
    prevBtn.addEventListener('click', () => { prev(); resetAutoPlay(); });

    // Auto-play
    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 5000);
    }
    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }
    startAutoPlay();

    // Pause on hover
    const slider = track.closest('.testimonials__slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      slider.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch / swipe support
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      clearInterval(autoPlayTimer);
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      startAutoPlay();
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      const section = document.getElementById('reviews');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') { next(); resetAutoPlay(); }
      if (e.key === 'ArrowLeft') { prev(); resetAutoPlay(); }
    });
  }


  // ═══════════════════════════════════════════
  //  PARTICLE SYSTEM — Hero & Contact
  // ═══════════════════════════════════════════

  class ParticleCanvas {
    constructor(canvasId, options = {}) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -1000, y: -1000 };
      this.opts = {
        count: options.count || 50,
        color: options.color || '147, 197, 253',
        maxSize: options.maxSize || 3,
        speed: options.speed || 0.4,
        connectDistance: options.connectDistance || 140,
        mouseRadius: options.mouseRadius || 160,
        ...options
      };
      this.animId = null;
      this.visible = false;
      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());

      // Track mouse only over the parent section
      const section = this.canvas.closest('section, header');
      if (section) {
        section.addEventListener('mousemove', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        });
        section.addEventListener('mouseleave', () => {
          this.mouse.x = -1000;
          this.mouse.y = -1000;
        });
      }

      // Observe visibility to start/stop animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.visible) {
            this.visible = true;
            this.animate();
          } else if (!entry.isIntersecting && this.visible) {
            this.visible = false;
            cancelAnimationFrame(this.animId);
          }
        });
      }, { threshold: 0.05 });

      observer.observe(this.canvas);
    }

    resize() {
      const parent = this.canvas.parentElement;
      this.canvas.width = parent.offsetWidth;
      this.canvas.height = parent.offsetHeight;
      this.createParticles();
    }

    createParticles() {
      this.particles = [];
      const { count, maxSize, speed } = this.opts;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * maxSize + 0.5,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.5 + 0.15
        });
      }
    }

    animate() {
      if (!this.visible) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p, i) => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x > this.canvas.width + 10) p.x = -10;
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.y > this.canvas.height + 10) p.y = -10;
        if (p.y < -10) p.y = this.canvas.height + 10;

        // Mouse repulsion
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.opts.mouseRadius) {
          const force = (this.opts.mouseRadius - dist) / this.opts.mouseRadius;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${this.opts.color}, ${p.opacity})`;
        this.ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < this.opts.connectDistance) {
            const lineOpacity = (1 - dist2 / this.opts.connectDistance) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(${this.opts.color}, ${lineOpacity})`;
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();
          }
        }
      });

      this.animId = requestAnimationFrame(() => this.animate());
    }
  }

  // Initialize particle canvases
  new ParticleCanvas('hero-particles', {
    count: 60,
    color: '147, 197, 253',
    maxSize: 2.5,
    speed: 0.3,
    connectDistance: 130,
    mouseRadius: 150
  });

  new ParticleCanvas('contact-particles', {
    count: 40,
    color: '96, 165, 250',
    maxSize: 2,
    speed: 0.25,
    connectDistance: 120,
    mouseRadius: 130
  });

});
