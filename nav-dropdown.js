(function(){
  document.querySelectorAll('.nav-dropdown > .dropdown-trigger').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var parent = btn.parentElement;
      var wasOpen = parent.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
      if (!wasOpen) parent.classList.add('open');
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      document.querySelectorAll('.nav-dropdown.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });
})();
