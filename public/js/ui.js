// UI Interactions (drawer, dropdowns, sticky nav)
document.addEventListener('DOMContentLoaded', () => {
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

