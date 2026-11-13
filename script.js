const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTop = document.querySelector('.back-to-top');
const typedRole = document.querySelector('.typed-role');
const dialog = document.querySelector('.project-dialog');

const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  navLinks.classList.remove('is-open');
  document.body.classList.remove('menu-open');
};

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Buka menu navigasi' : 'Tutup menu navigasi');
  navLinks.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => {
  if (window.innerWidth > 680) closeMenu();
});

const updateScrollState = () => {
  const isScrolled = window.scrollY > 24;
  header.classList.toggle('is-scrolled', isScrolled);
  backToTop.classList.toggle('is-visible', window.scrollY > 420);
};
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const sectionLinks = [...document.querySelectorAll('.nav-link')];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const activeSectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => activeSectionObserver.observe(section));

const revealElements = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  revealElements.forEach((element) => {
    if (element.dataset.revealDelay) element.style.setProperty('--reveal-delay', `${element.dataset.revealDelay}ms`);
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-revealed'));
}

const roles = ['Student', 'Junior Web Developer'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  typedRole.textContent = roles[1];
} else {
  let roleIndex = 0;
  let characterIndex = roles[0].length;
  let deleting = true;

  const typeNextCharacter = () => {
    const currentRole = roles[roleIndex];
    typedRole.textContent = currentRole.slice(0, characterIndex);

    if (deleting) {
      characterIndex -= 1;
      if (characterIndex < 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        characterIndex = 0;
        window.setTimeout(typeNextCharacter, 350);
        return;
      }
    } else {
      characterIndex += 1;
      if (characterIndex > roles[roleIndex].length) {
        deleting = true;
        window.setTimeout(typeNextCharacter, 1700);
        return;
      }
    }
    window.setTimeout(typeNextCharacter, deleting ? 55 : 95);
  };

  window.setTimeout(typeNextCharacter, 1600);
}

document.querySelector('.detail-trigger').addEventListener('click', () => {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});