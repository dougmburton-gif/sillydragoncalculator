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

(function(){
  var tab = document.getElementById('weatherTab');
  var flash = document.getElementById('weatherFlash');
  var icons = document.getElementById('weatherIcons');
  var iconChar = document.getElementById('weatherIconChar');
  if (!tab) return;

  var CITIES = [
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
  ];

  var fired = false;
  tab.addEventListener('click', function(){
    if (fired) return;
    fired = true;

    Promise.all(CITIES.map(function(c){
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lon + '&current=temperature_2m&temperature_unit=fahrenheit';
      return fetch(url).then(function(r){ return r.json(); }).then(function(data){
        var t = data && data.current ? Math.round(data.current.temperature_2m) : null;
        return { name: c.name, temp: t };
      }).catch(function(){ return { name: c.name, temp: null }; });
    })).then(function(results){
      flash.innerHTML = results.map(function(r){
        return '<span class="city">' + r.name + '<b>' + (r.temp !== null ? r.temp + '°F' : '—') + '</b></span>';
      }).join('');
      flash.classList.add('show');
      setTimeout(function(){ flash.classList.remove('show'); }, 2000);
    });

    icons.classList.add('show');
    iconChar.textContent = '🌧️';
    icons.classList.remove('sun-phase');
    setTimeout(function(){ iconChar.textContent = '❄️'; }, 2000);
    setTimeout(function(){ iconChar.textContent = '😊☀️'; icons.classList.add('sun-phase'); }, 4000);
    setTimeout(function(){ icons.classList.remove('show', 'sun-phase'); }, 6000);
  });
})();
