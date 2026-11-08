// System theme auto-detection & UI Interactions
document.addEventListener('DOMContentLoaded', () => {
  // 1. System Theme Auto-Detection (prefers-color-scheme)
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

  function syncSystemColorMode() {
    const root = document.documentElement;
    if (prefersDarkScheme.matches) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  // Initial sync & listener for live system changes
  syncSystemColorMode();
  prefersDarkScheme.addEventListener('change', syncSystemColorMode);

  // 2. Mobile Drawer Navigation
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('mobile-drawer-close');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    });

    const closeDrawer = () => {
      drawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    };

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.classList.contains('translate-x-full')) {
        closeDrawer();
      }
    });
  }
});
