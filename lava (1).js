(function(){
  const field = document.getElementById('lavaField');
  if (!field) return;
  const COUNT = 22;
  for (let i = 0; i < COUNT; i++){
    const b = document.createElement('div');
    b.className = 'lava-bubble';
    const left = Math.random() * 100;
    const size = 8 + Math.random() * 26;
    const dur = 6 + Math.random() * 8;
    const delay = Math.random() * 12;
    b.style.left = left + '%';
    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.animationDuration = dur + 's';
    b.style.animationDelay = '-' + delay + 's';
    field.appendChild(b);
  }
})();
