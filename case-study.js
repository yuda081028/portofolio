const sectionLinks = [...document.querySelectorAll('.rail-link')];
const caseSections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((link) => {
        const isCurrent = link.hash === `#${entry.target.id}`;
        link.classList.toggle('is-current', isCurrent);
      });
    });
  }, { rootMargin: '-20% 0px -65% 0px' });
  caseSections.forEach((section) => sectionObserver.observe(section));
}
