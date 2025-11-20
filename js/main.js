// Theme toggle (light/dark ambience)
const body = document.body;
const themeToggle = document.getElementById("themeToggle");

function updateThemeToggleIcon() {
  if (!themeToggle) return;
  // show sun when in light mode, show moon when in dark mode
  if (body.classList.contains('light')) {
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
}

if (themeToggle) {
  // initialize icon based on current state
  updateThemeToggleIcon();

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light");
    updateThemeToggleIcon();
  });
}

// Mobile burger menu
const burgerBtn = document.getElementById("burgerBtn");
const mainNav = document.getElementById("mainNav");

if (burgerBtn && mainNav) {
  burgerBtn.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });
}

// Modals
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

const signupButtons = ["openSignup", "heroSignup", "ctaSignup", "membershipSignup"];
const signinButtons = ["openSignin", "heroSignin", "ctaSignin"];

signupButtons.forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", () => openModal("signupModal"));
  }
});

signinButtons.forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", () => openModal("signinModal"));
  }
});

// Delegate modal close / overlay clicks to a single document listener to reduce listeners
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('.pp-modal-close');
  if (closeBtn) {
    const modalId = closeBtn.getAttribute('data-close');
    if (modalId) closeModal(modalId);
    return;
  }

  const overlay = e.target.closest('.pp-modal-overlay');
  if (overlay && e.target === overlay) {
    overlay.style.display = 'none';
  }
});

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Review carousel (show 3 at a time, navigate with arrows)
;(function setupReviewCarousel(){
  const carousel = document.querySelector('.pp-review-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.pp-review-viewport');
  const track = carousel.querySelector('.pp-review-track');
  const cards = track ? Array.from(track.children) : [];
  const prevBtn = carousel.querySelector('.pp-carousel-btn.prev');
  const nextBtn = carousel.querySelector('.pp-carousel-btn.next');

  if (!viewport || !track || cards.length === 0) return;

  let index = 0;

  // compute visible count based on CSS widths
  function visibleCount(){
    const vw = window.innerWidth;
    if (vw <= 640) return 1;
    if (vw <= 900) return 2;
    return 3;
  }

  function updateButtons(){
    const v = visibleCount();
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= Math.max(0, cards.length - v);
  }

  function scrollToIndex(i){
    const card = cards[i];
    if (!card) return;
    // compute left offset of card relative to track
    const left = card.offsetLeft - track.offsetLeft;
    viewport.scrollTo({ left, behavior: 'smooth' });
    index = i;
    updateButtons();
  }

  prevBtn.addEventListener('click', ()=>{
    const v = visibleCount();
    const nextIndex = Math.max(0, index - 1);
    scrollToIndex(nextIndex);
  });

  nextBtn.addEventListener('click', ()=>{
    const v = visibleCount();
    const maxIndex = Math.max(0, cards.length - v);
    const nextIndex = Math.min(maxIndex, index + 1);
    scrollToIndex(nextIndex);
  });

  // Recompute on resize
  let resizeTimer = null;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
      // ensure index not out of range for new visible count
      const v = visibleCount();
      if (index > Math.max(0, cards.length - v)) index = Math.max(0, cards.length - v);
      scrollToIndex(index);
    }, 120);
  });

  // init
  updateButtons();
  // ensure starting position
  scrollToIndex(0);
})();

  // ---------- Hero card runtime sizer (make card square at 90% of column width) ----------
  (function heroCardFixedSizer(){
    // Fixed target per user request: 500x500
    const TARGET = 500;
    const BASELINE = 500; // baseline for scale calculations
    let resizeTimer = null;

    function applyFixedSize(){
      const cards = document.querySelectorAll('.pp-hero-card.float-card.reveal.visible');
      if (!cards || cards.length === 0) return;
      cards.forEach((el) => {
        el.style.width = TARGET + 'px';
        el.style.height = TARGET + 'px';
        el.style.setProperty('--pp-hero-scale', (TARGET / BASELINE).toFixed(3));
        // set image percent to 60% for this fixed layout
        el.style.setProperty('--pp-hero-image-percent', '60%');
      });
    }

    function schedule(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyFixedSize, 80);
    }

    document.addEventListener('DOMContentLoaded', ()=>{
      applyFixedSize();
      setTimeout(applyFixedSize, 120);
    });

    window.addEventListener('resize', schedule);

    // Observe class changes (if card gains/loses visible)
    const mo = new MutationObserver((mutations)=>{
      for (const m of mutations){
        if (m.type === 'attributes' && m.attributeName === 'class'){
          const tgt = m.target;
          if (tgt && tgt.classList && tgt.classList.contains('pp-hero-card')){
            schedule();
          }
        }
      }
    });

    document.querySelectorAll('.pp-hero-card').forEach((n)=> mo.observe(n, { attributes: true }));

    window.__applyHero500 = applyFixedSize;
  })();


// Trip carousel inside hero card (shows single trip, arrow navigation)
;(function setupTripCarousel(){
  const carousel = document.querySelector('.pp-trip-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.pp-trip-viewport');
  const track = carousel.querySelector('.pp-trip-track');
  const cards = track ? Array.from(track.children) : [];
  const prevBtn = carousel.querySelector('.pp-trip-btn.prev');
  const nextBtn = carousel.querySelector('.pp-trip-btn.next');

  if (!viewport || !track || cards.length === 0) return;

  let index = 0;

  function updateButtons(){
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= Math.max(0, cards.length - 1);
  }

  function scrollToIndex(i){
    const card = cards[i];
    if (!card) return;
    // Use transform-based sliding so each card occupies full viewport width
    // ensure the track uses transform for animation (CSS transition already present)
    track.style.transform = `translateX(-${i * 100}%)`;
    index = i;
    updateButtons();
  }

  prevBtn.addEventListener('click', ()=>{
    const nextIndex = Math.max(0, index - 1);
    scrollToIndex(nextIndex);
  });

  nextBtn.addEventListener('click', ()=>{
    const nextIndex = Math.min(cards.length - 1, index + 1);
    scrollToIndex(nextIndex);
  });

  // keyboard navigation while carousel focused
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  // update on resize in case layout shifts
  window.addEventListener('resize', ()=>{
    // keep same index but re-scroll to it
    setTimeout(()=> scrollToIndex(index), 80);
  });

  // init
  updateButtons();
  scrollToIndex(0);
})();
