// SafePet — script.js

// Global safety: suppress noisy unhandled promise rejections early
window.addEventListener('unhandledrejection', (e) => { console.info('Unhandled promise rejection (suppressed):', e.reason); try{ if(e.preventDefault) e.preventDefault(); }catch(e){} });

// Backup preloader hide in case DOMContentLoaded flow is interrupted
setTimeout(()=>{ const pre = document.getElementById('preloader'); if(pre){ pre.classList.add('preloader--hide'); setTimeout(()=>{ if(pre.parentNode) pre.parentNode.removeChild(pre); }, 450); } }, 3000);

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    if(!pre) return;
    // allow user to dismiss by clicking
    pre.addEventListener('click', () => { pre.classList.add('preloader--hide'); });

    setTimeout(() => {
      // add hide class to trigger CSS transition (auto-hide after ~1.5s)
      pre.classList.add('preloader--hide');
      // remove from DOM after transition ends
      pre.addEventListener('transitionend', () => { if(pre && pre.parentNode) pre.parentNode.removeChild(pre); }, { once: true });
    }, 1500); // hide shortly after load for faster UX
  });
  // Safety fallback in case load event hangs (shorter, hide after ~2s)
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if(pre){ pre.classList.add('preloader--hide'); setTimeout(()=>{ if(pre.parentNode) pre.parentNode.removeChild(pre); }, 450); }
  }, 2000);
  // AOS Init
  if (window.AOS) { AOS.init({ duration: 900, once: true, easing: 'ease-in-out' }); }

  // Mobile menu toggle (only active on small screens)
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const body = document.body;

  const isSmall = () => window.innerWidth <= 900;
  const openMenu = () => { mobileMenu.classList.add('open'); mobileMenu.setAttribute('aria-hidden', 'false'); body.classList.add('menu-open'); body.style.overflow = 'hidden'; };
  const closeMenu = () => { mobileMenu.classList.remove('open'); mobileMenu.setAttribute('aria-hidden', 'true'); body.classList.remove('menu-open'); body.style.overflow = ''; };

  mobileToggle.addEventListener('click', () => { if(isSmall()){ mobileMenu.classList.contains('open') ? closeMenu() : openMenu(); }});
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if(isSmall()) closeMenu(); }));

  // Close mobile menu if user resizes to desktop width
  window.addEventListener('resize', () => { if(!isSmall() && mobileMenu.classList.contains('open')) closeMenu(); });

  // Smooth scroll for anchors (improved)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(!href || href === '#') return;
      const el = document.querySelector(href);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
  });

  // Mascotas Felices counter
  const counters = document.querySelectorAll('.counter');
  const runCount = (el) => {
    const target = +el.dataset.target;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = prefix + value.toLocaleString() + suffix;
      if(progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const obs = new IntersectionObserver((entries, o)=>{
    entries.forEach(entry => { if(entry.isIntersecting){ runCount(entry.target); o.unobserve(entry.target); }});
  }, {threshold: 0.6});
  counters.forEach(c => obs.observe(c));

  // Tabs para Cómo Llegar (videos)
  const tabs = document.querySelectorAll('.tab');
  const dirCar = document.getElementById('dir-carro');
  const dirWalk = document.getElementById('dir-caminar');
  const videoCar = document.getElementById('video-car');
  const videoWalk = document.getElementById('video-walk');
  const carFallback = document.getElementById('video-car-fallback');
  const retryCar = document.getElementById('retry-car');

  const pauseAllVideos = () => { document.querySelectorAll('video').forEach(v => { try{ v.pause(); }catch(e){} }); };

  const tryPlay = (videoEl, fallbackEl) => {
    if(!videoEl) return;
    // ensure source exists; if not, try to set it to carro.mp4
    const src = videoEl.querySelector('source')?.getAttribute('src');
    if(!src || src.trim() === '' || !/carro/i.test(src)){
      videoEl.querySelector('source')?.setAttribute('src', 'videos/carro.mp4');
      videoEl.load();
    }

    videoEl.play().then(()=>{
      fallbackEl?.classList.add('hidden');
    }).catch(err => {
      console.warn('Playback failed:', err);
      fallbackEl?.classList.remove('hidden');
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      if(mode === 'carro'){
        dirCar.classList.remove('hidden'); dirWalk.classList.add('hidden');
        pauseAllVideos();
        tryPlay(videoCar, carFallback);
      } else {
        dirWalk.classList.remove('hidden'); dirCar.classList.add('hidden');
        pauseAllVideos();
        tryPlay(videoWalk, null);
      }
    });
  });

  // Retry button
  retryCar?.addEventListener('click', () => { carFallback?.classList.add('hidden'); tryPlay(videoCar, carFallback); });

  /* New: Locate cards (two-column) support */
  const locateCards = document.querySelectorAll('.locate-card');
  if(locateCards && locateCards.length){
    // set default active state if none
    if(!document.querySelector('.locate-card.active')) locateCards[0].classList.add('active');
    locateCards.forEach(card => {
      card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        locateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if(mode === 'carro'){
          dirCar.classList.remove('hidden'); dirWalk.classList.add('hidden');
          pauseAllVideos(); tryPlay(videoCar, carFallback);
        } else {
          dirWalk.classList.remove('hidden'); dirCar.classList.add('hidden');
          pauseAllVideos(); tryPlay(videoWalk, null);
        }
      });
    });
  }

  // Header scroll behavior: toggle .header-active when scrolling past 500px
  (function(){
    const header = document.querySelector('header.site-header');
    if(!header) return;
    // mark initial state as top
    header.classList.add('is-top');
    const onScrollHeader = () => {
      if(window.scrollY > 500){ header.classList.add('header-active'); header.classList.remove('is-top'); }
      else { header.classList.remove('header-active'); header.classList.add('is-top'); }
      // Ensure floating petshop button follows same visual state even when it's outside the header
      const petshopBtn = document.querySelector('.petshop');
      if(petshopBtn){
        if(window.scrollY > 95) petshopBtn.classList.add('petshop--dark');
        else petshopBtn.classList.remove('petshop--dark');
      }
      // (no deeper threshold toggles here) 
    };
    // run once to set initial state
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, {passive:true});
  })();

  // Show fallback on error
  if(videoCar){ videoCar.addEventListener('error', () => { carFallback?.classList.remove('hidden'); }); }
  if(videoWalk){ videoWalk.addEventListener('error', () => { /* could show fallback for walk */ }); }

  // Send route (placeholder behaviour)
  document.getElementById('sendRoute')?.addEventListener('click', () => {
    alert('Te hemos enviado un video de la ruta al chat. (Placeholder)');
  });

  // Agendar Cita: open booking modal instead of scrolling
  const bookingModal = document.getElementById('bookingModal');
  const bookingClose = bookingModal?.querySelector('.modal-close');
  const cancelBooking = document.getElementById('cancelBooking');
  const bookingForm = document.getElementById('bookingForm');
  const agendarBtn = document.getElementById('agendarBtn');

  const openBooking = () => {
    if(!bookingModal) return;
    bookingModal.classList.remove('hidden');
    setTimeout(()=>{ bookingModal.classList.add('open'); bookingModal.setAttribute('aria-hidden','false'); const first = bookingModal.querySelector('input,select,textarea,button'); if(first) first.focus(); }, 20);
    document.body.style.overflow = 'hidden';
  };
  const closeBooking = () => {
    if(!bookingModal) return; bookingModal.classList.remove('open'); setTimeout(()=>{ bookingModal.classList.add('hidden'); bookingModal.setAttribute('aria-hidden','true'); }, 260); document.body.style.overflow = '';
  };

  agendarBtn?.addEventListener('click', (e) => { e.preventDefault(); openBooking(); });
  document.getElementById('heroAgendar')?.addEventListener('click', (e) => { e.preventDefault(); openBooking(); });
  bookingClose?.addEventListener('click', closeBooking);
  cancelBooking?.addEventListener('click', closeBooking);

  // Booking submit -> open WhatsApp with formatted message
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(bookingForm);
    const payload = Object.fromEntries(data.entries());
    const lines = [];
    lines.push(`Nueva cita desde SafePet`);
    lines.push(`Nombre: ${payload.name || ''}`);
    lines.push(`Teléfono: ${payload.phone || ''}`);
    if(payload.email) lines.push(`Email: ${payload.email}`);
    if(payload.pet) lines.push(`Mascota: ${payload.pet}`);
    lines.push(`Servicio: ${payload.service || ''}`);
    if(payload.date) lines.push(`Fecha preferida: ${payload.date}`);
    if(payload.notes) lines.push(`Notas: ${payload.notes}`);
    const message = lines.join('\n');
    // Recipient (user provided 04129983853) — convert to international Venezuela +58
    const to = '584129983853';
    const url = `https://wa.me/${to}?text=` + encodeURIComponent(message);
    window.open(url, '_blank');
    // Optionally we can close and reset the form
    closeBooking(); bookingForm.reset();
  });

  // Optional: pause videos when user navigates away
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ document.querySelectorAll('video').forEach(v => v.pause()); }
  });

  // Small UI polish: WhatsApp open animation (only if element exists)
  const wa = document.querySelector('.whatsapp');
  if(wa) setTimeout(()=> wa.classList.add('visible'), 1500);

  // Team carousel controls
  const carousel = document.getElementById('teamCarousel');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  if(carousel){
    const cardWidth = () => carousel.querySelector('.member-card')?.getBoundingClientRect().width ?? 200;
    prevBtn?.addEventListener('click', () => { carousel.scrollBy({ left: - (cardWidth() + 16), behavior: 'smooth' }); });
    nextBtn?.addEventListener('click', () => { carousel.scrollBy({ left: (cardWidth() + 16), behavior: 'smooth' }); });
    // keyboard support
    carousel.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowRight') nextBtn?.click();
      if(e.key === 'ArrowLeft') prevBtn?.click();
    });
  }

  // Facility lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');

  // Instagram feed disabled — using direct link to Instagram profile instead of the API
  // Removed fetch logic and token handling to avoid CORS/token errors in the console.
  const btnRedes = document.getElementById('btnRedes');
  const redesPanel = document.getElementById('redesPanel');
  if(btnRedes && redesPanel){
    btnRedes.addEventListener('click', () => {
      const expanded = btnRedes.getAttribute('aria-expanded') === 'true';
      btnRedes.setAttribute('aria-expanded', String(!expanded));
      redesPanel.classList.toggle('hidden');
      redesPanel.setAttribute('aria-hidden', String(expanded));
    });
  }



  document.querySelectorAll('.facility-tile').forEach(tile => {
    const open = () => {
      const full = tile.getAttribute('data-full') || tile.querySelector('img')?.src;
      const caption = tile.querySelector('.facility-caption')?.textContent || '';
      lightboxImg.setAttribute('src', full);
      lightboxImg.setAttribute('alt', caption);
      lightboxCaption.textContent = caption;
      lightbox.classList.remove('hidden');
      lightbox.setAttribute('aria-hidden', 'false');
    };
    tile.addEventListener('click', open);
    tile.addEventListener('keypress', (e) => { if(e.key === 'Enter' || e.key === ' ') open(); });
  });

  const closeLightbox = () => { lightbox.classList.add('hidden'); lightbox.setAttribute('aria-hidden', 'true'); lightboxImg.setAttribute('src', ''); };
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) closeLightbox(); });

  // Graceful fallback for images (optional progressive enhancement)
  // Ensure key content images use lazy loading to reduce CLS and bandwidth on mobile
  try{
    document.querySelectorAll('.insta-grid img, .testimonial-avatar, .fundadora-media img, .member-avatar, .facility-tile img').forEach(img => {
      if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      // attempt decode to avoid layout shifts
      if(img.decode) img.decode().catch(()=>{});
    });
  }catch(e){}

  // Profile modal (team)
  const profileModal = document.getElementById('profileModal');
  const modalOverlay = profileModal?.querySelector('.modal-overlay');
  const modalClose = profileModal?.querySelector('.modal-close');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalName = document.getElementById('modalName');
  const modalTitle = document.getElementById('modalTitle');
  const modalBullets = document.getElementById('modalBullets');

  let lastActiveElement = null;
  const modalBioEl = document.getElementById('modalBio');
  const modalActions = document.getElementById('modalActions');
  const modalCloseCTA = document.getElementById('modalCloseCTA');

  // focus-trap helpers
  const getFocusable = (container) => Array.from(container.querySelectorAll('a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
  let trapHandler = null;

  const openProfile = (card) => {
    if(!card || !profileModal) return;
    lastActiveElement = document.activeElement;
    const name = card.dataset.fullname || card.querySelector('h4')?.textContent || card.querySelector('.team-ceo-name')?.textContent || card.querySelector('.member-name')?.textContent || '';
    const title = card.dataset.title || card.querySelector('.profile-role')?.textContent || card.querySelector('.team-ceo-role')?.textContent || card.querySelector('.member-role')?.textContent || '';
    const bullets = (card.dataset.bullets || '').split('|').filter(Boolean);
    const bio = card.dataset.bio || card.querySelector('.team-ceo-bio')?.textContent || '';
    const img = card.querySelector('img')?.getAttribute('src') || '';

    modalAvatar.setAttribute('src', img);
    modalAvatar.setAttribute('alt', name);
    modalName.textContent = name;
    modalTitle.textContent = title;
    modalBullets.innerHTML = '';
    bullets.forEach(b => { const li = document.createElement('li'); li.textContent = b.trim(); modalBullets.appendChild(li); });
    modalBioEl.textContent = bio;

    // actions: show 'Agendar Cita' only for médicos/veterinarios; always show Close
    modalActions.style.display = 'flex';
    const cta = modalActions.querySelector('.modal-cta');
    const titleLower = (title || '').toLowerCase();
    const isVet = /m[eé]dic|m[eé]dico|veterinari/i.test(titleLower);
    if(isVet){
      cta.style.display = 'inline-block';
      // if the card provides a whatsapp link, prefer it; otherwise open booking modal pre-filled
      if(card.dataset.whatsapp){ cta.setAttribute('href', card.dataset.whatsapp); cta.setAttribute('target','_blank'); }
      else {
        cta.setAttribute('href','#');
        // remove previous handler and attach a one-time click to open booking modal and prefill service/title
        cta.onclick = (ev) => { ev.preventDefault(); openBooking(); /* prefill service with Consultation and add note of doctor */ const svc = document.getElementById('bookService'); const notes = document.getElementById('bookNotes'); if(svc) svc.value = 'Consulta'; if(notes) notes.value = `Preferencia por consulta con ${name}`; };
      }
      // add pulse and avatar glow for emphasis
      cta.classList.add('pulse');
      modalAvatar.classList.add('modal-avatar-glow');
    } else {
      cta.style.display = 'none';
      cta.classList.remove('pulse');
      modalAvatar.classList.remove('modal-avatar-glow');
    }

    // show modal with animation and mark visible to AT
    profileModal.classList.remove('hidden');
    // allow DOM update then apply open state
    setTimeout(()=> {
      profileModal.classList.add('open');
      profileModal.setAttribute('aria-hidden','false');
      // ensure modal body scrolls to top on open (mobile)
      const bodyEl = profileModal.querySelector('.modal-body'); if(bodyEl) bodyEl.scrollTop = 0;
      // trap focus inside modal
      const focusable = getFocusable(profileModal);
      if(focusable.length){ focusable[0].focus(); }
      trapHandler = (e) => {
        if(e.key !== 'Tab') return;
        const focusables = getFocusable(profileModal);
        if(!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if(e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
        else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
      };
      document.addEventListener('keydown', trapHandler);
    }, 12);

    body.style.overflow = 'hidden';
  };

  const closeProfile = () => {
    if(!profileModal) return;
    // move focus back to the trigger BEFORE hiding to avoid aria-hidden warning
    try{
      if(lastActiveElement){ lastActiveElement.focus(); }
      else { document.body.focus(); }
    }catch(e){}

    // remove focus trap
    if(trapHandler) { document.removeEventListener('keydown', trapHandler); trapHandler = null; }

    profileModal.classList.remove('open');
    // give a moment for focus to move then hide from AT
    setTimeout(()=>{ profileModal.setAttribute('aria-hidden','true'); }, 8);

    // wait for animation to finish before hiding and cleanup
    setTimeout(()=>{
      if(profileModal) profileModal.classList.add('hidden');
      modalAvatar.setAttribute('src','');
      modalName.textContent = '';
      modalTitle.textContent = '';
      modalBullets.innerHTML = '';
      modalBioEl.textContent = '';
      modalActions.style.display = '';
      const cta = modalActions.querySelector('.modal-cta'); if(cta) { cta.style.display = ''; cta.classList.remove('pulse'); }
      modalAvatar.classList.remove('modal-avatar-glow');
    }, 320);
    body.style.overflow = '';
  };

  modalCloseCTA?.addEventListener('click', closeProfile);

  // existing profile-card triggers
  document.querySelectorAll('.profile-card .profile-avatar, .profile-card .view-profile').forEach(el => {
    el.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.profile-card');
      openProfile(card);
    });
  });

  // make featured avatar open the profile modal
  document.querySelectorAll('.team-ceo .team-ceo-avatar').forEach(el => {
    el.addEventListener('click', (e) => { const card = e.currentTarget.closest('.team-ceo'); openProfile(card); });
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const card = e.currentTarget.closest('.team-ceo'); openProfile(card); } });
  });

  // make member-card avatars open the profile modal (click & keyboard)
  document.querySelectorAll('.member-card .member-avatar').forEach(el => {
    el.addEventListener('click', (e) => { const card = e.currentTarget.closest('.member-card'); openProfile(card); });
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const card = e.currentTarget.closest('.member-card'); openProfile(card); } });
  });

  modalOverlay?.addEventListener('click', closeProfile);
  modalClose?.addEventListener('click', closeProfile);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && profileModal && !profileModal.classList.contains('hidden')) closeProfile(); });

  // suppress noisy unhandled promise rejections and log them cleanly
  window.addEventListener('unhandledrejection', (e) => { console.info('Unhandled promise rejection (suppressed):', e.reason); if(e.preventDefault) e.preventDefault(); });

});