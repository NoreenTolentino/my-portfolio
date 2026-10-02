/*
========================================
Portfolio script
Features:
1. Dark / light mode toggle (remembers the choice)
2. Hamburger menu for mobile
3. Smooth scrolling for anchor links
4. Highlight of the current section in the navigation
5. Enlarged certificate viewer
6. Automatic year in the footer
7. Scroll reveal animation
8. Typing effect for the role line
========================================
*/

// Key used to save the chosen theme in the browser
const THEME_KEY = 'portfolio-theme';

// Tells the stylesheet that JavaScript is running, so scroll animations can be enabled.
document.documentElement.classList.add('js');

/*
Theme setup. This runs immediately (script is loaded in the <head>) 
so the saved theme is applied before the page is drawn and there is no flash.
*/
(function applySavedTheme() {
  let savedTheme = null;

  // localStorage can be blocked in some browsers, so it is wrapped in try/catch
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (error) {
    savedTheme = null;
  }

  // Use the saved choice, otherwise start in dark mode
  const theme = savedTheme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
})();

/*
Start every feature once the page has finished loading.
*/
document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initMobileMenu();
  initSmoothScroll();
  initActiveNavLink();
  initCertificateViewer();
  setCurrentYear();
  initRevealOnScroll();
  initRoleTypewriter();
});

/*
1. Dark / light mode
*/
// Switches between light and dark theme when the toggle button is clicked.
function initThemeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  const root = document.documentElement;

  if (!toggleButton) return;

  // Make the button label match the theme that is already active
  updateThemeLabel(toggleButton, root.getAttribute('data-theme'));

  toggleButton.addEventListener('click', function () {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    updateThemeLabel(toggleButton, nextTheme);

    // Remember the choice for the next visit
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
      // Saving is optional, so the error is ignored
    }
  });
}

// Updates the button's accessible label so screen readers announce the next action.
function updateThemeLabel(button, theme) {
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  button.setAttribute('aria-label', label);
}

/*
2. Hamburger menu
*/
// Shows and hides the navigation on small screens.
function initMobileMenu() {
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  if (!menuButton || !nav) return;

  // Opens or closes the menu and keeps the button's ARIA attributes in sync.
  function setMenuOpen(isOpen) {
    nav.classList.toggle('is-open', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  // Clicking the hamburger button toggles the menu
  menuButton.addEventListener('click', function () {
    setMenuOpen(!nav.classList.contains('is-open'));
  });

  // Close the menu after choosing a link
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });

  // Close the menu with the Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  // Reset the menu when the screen becomes wide enough for the desktop layout
  window.matchMedia('(min-width: 821px)').addEventListener('change', function (event) {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
}

/*
3. Smooth scrolling
*/
// Makes links that point to a section (like #projects) scroll smoothly.
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  // People who prefer less motion get an instant jump instead
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  anchorLinks.forEach(function (link) {
    // The skip link should use the browser's default behavior so focus moves correctly
    if (link.classList.contains('skip-link')) return;

    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });
}

/*
4. Current section highlight
*/
// Marks the navigation link of the section that is currently on screen.
function initActiveNavLink() {
  const links = Array.from(document.querySelectorAll('.nav-list a'));
  const sections = links.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  });

  // Finds the current section based on scroll position and updates the links.
  function updateActiveLink() {
    // A section counts as "current" once its top passes this distance from the top of the screen
    const triggerOffset = 120;
    let currentIndex = -1;

    sections.forEach(function (section, index) {
      if (section && section.getBoundingClientRect().top <= triggerOffset) {
        currentIndex = index;
      }
    });

    // At the very bottom of the page, the last section (Contact) is current
    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atPageBottom) {
      currentIndex = sections.length - 1;
    }

    links.forEach(function (link, index) {
      const isCurrent = index === currentIndex;
      link.classList.toggle('is-active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/*
5. Certificate viewer
*/
// Opens a certificate in a larger popup when its thumbnail is clicked.
function initCertificateViewer() {
  const dialog = document.getElementById('cert-dialog');
  const dialogImage = document.getElementById('cert-dialog-img');
  const closeButton = document.getElementById('cert-dialog-close');
  const certButtons = document.querySelectorAll('.cert-button');

  // Stop here if the browser does not support the <dialog> element
  if (!dialog || !dialogImage || typeof dialog.showModal !== 'function') return;

  // Copy the clicked thumbnail into the popup and show it
  certButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const thumbnail = button.querySelector('img');
      dialogImage.src = thumbnail.src;
      dialogImage.alt = thumbnail.alt;
      dialog.showModal();
    });
  });

  // Close with the X button
  if (closeButton) {
    closeButton.addEventListener('click', function () {
      dialog.close();
    });
  }

  // Close when clicking the dark area outside the image
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

/*
6. Footer year
*/
// Writes the current year into the footer so it never goes out of date.
function setCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/*
7. Scroll reveal animation
*/
// Fades elements in (class "reveal") the first time they scroll into view.
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Show everything right away if animation is not wanted or not supported
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (item) {
      item.classList.add('is-visible');
    });
    return;
  }

  // Adds the "is-visible" class once and then stops watching that element
  const observer = new IntersectionObserver(
    function (entries, activeObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px 40px 0px' }
  );

  items.forEach(function (item) {
    observer.observe(item);
  });
}

/*
8. Typing effect
*/
// Types and deletes the job titles in the hero, one after the other.
function initRoleTypewriter() {
  const target = document.getElementById('role-text');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep the first title as plain text if animation is not wanted
  if (!target || reduceMotion) return;

  const roles = ['Front-End Developer', 'UI/UX Developer'];
  let roleIndex = 0;
  let charCount = roles[0].length;
  let isDeleting = true;

  // Adds or removes one letter, then schedules the next step.
  function typeStep() {
    const currentRole = roles[roleIndex];
    let delay = isDeleting ? 45 : 85;

    charCount += isDeleting ? -1 : 1;
    target.textContent = currentRole.slice(0, charCount);

    if (!isDeleting && charCount === currentRole.length) {
      // Finished typing: pause so the title can be read
      isDeleting = true;
      delay = 2200;
    } else if (isDeleting && charCount === 0) {
      // Finished deleting: move on to the next title
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(typeStep, delay);
  }

  // The first title is already on screen, so wait before deleting it
  setTimeout(typeStep, 2200);
}