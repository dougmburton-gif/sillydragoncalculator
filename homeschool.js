// Keep the shared tools available without floating over the reading area.
(() => {
  const footer = document.querySelector('.site-footer');
  const tools = document.createElement('div');
  tools.className = 'footer-tools';
  ['shareWidget', 'blogQuickLink'].forEach(id => {
    const element = document.getElementById(id);
    if (element) tools.append(element);
  });
  footer.append(tools);
  const tip = document.getElementById('sdc-tip-widget');
  if (tip) footer.append(tip);
  document.querySelectorAll('.dropdown-trigger').forEach((button, index) => {
    const parent = button.parentElement;
    const menu = parent.querySelector('.dropdown-menu');
    menu.id = `homeschool-menu-${index}`;
    button.setAttribute('aria-controls', menu.id);
    const sync = () => button.setAttribute('aria-expanded', String(parent.classList.contains('open')));
    sync();
    new MutationObserver(sync).observe(parent, {attributes:true, attributeFilter:['class']});
  });
})();
