(function(){
  var TIPS_EN = [
    "Please Excuse My Dear Aunt Sally — the order of operations: Parentheses, Exponents, Multiply, Divide, Add, Subtract.",
    "Richard Of York Gave Battle In Vain — the colors of the rainbow, in order: Red, Orange, Yellow, Green, Blue, Indigo, Violet.",
    "My Very Educated Mother Just Served Us Noodles — the planets in order from the sun.",
    "Never Eat Soggy Waffles — North, East, South, West, clockwise on a map.",
    "HOMES — Huron, Ontario, Michigan, Erie, Superior: the five Great Lakes.",
    "Thirty days hath September, April, June, and November — the rest have 31, except February.",
    "One Collar, Two Sleeves — how to spell \"necessary\": one C, two S's.",
    "King Henry Died By Drinking Chocolate Milk — metric prefixes from kilo down to milli.",
    "Every Good Boy Does Fine — the lines of the treble clef: E, G, B, D, F.",
    "9 times any number 1–10? The digits of the answer always add up to 9. Try 9×7=63, and 6+3=9.",
    "A five-minute walk clears the head better than five more minutes staring at the same problem.",
    "Writing a to-do list before bed helps your brain let go of the day and actually rest.",
    "Spring forward, fall back — clocks jump ahead an hour in spring and back an hour in autumn.",
    "Righty tighty, lefty loosey — turn a screw or jar lid right to tighten, left to loosen.",
    "I before E, except after C — believe, receive. (A few sneaky words like \"weird\" break the rule.)",
    "FANBOYS — For, And, Nor, But, Or, Yet, So: the seven little words that join two full sentences.",
    "In fourteen hundred ninety-two, Columbus sailed the ocean blue — an easy way to lock in the date.",
    "Knuckle trick: months landing on a knuckle have 31 days; months in the dip have 30 (or 28).",
    "The 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds to rest your eyes.",
    "Name it to tame it — putting a feeling into words (\"I'm frustrated\") actually calms your brain.",
    "Writing something by hand helps you remember it better than typing it into your phone."
  ];
  var TIPS_ES = [
    "Paréntesis, Exponentes, Multiplicación, División, Adición, Sustracción — el orden correcto para resolver una expresión matemática.",
    "Rojo, Anaranjado, Amarillo, Verde, Azul, Índigo, Violeta — el orden de los colores en un arcoíris.",
    "Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano, Neptuno — los planetas en orden desde el sol.",
    "Nunca Entres Sin Whisky — Norte, Este, Sur, Oeste, en sentido horario en un mapa.",
    "HOMES (en inglés) — Huron, Ontario, Michigan, Erie, Superior: los cinco Grandes Lagos.",
    "Treinta días trae noviembre, con abril, junio y septiembre — de veintiocho solo hay uno, los demás de treinta y uno.",
    "Kilo, Hecto, Deca, unidad base, Deci, Centi, Mili — los prefijos métricos de mayor a menor.",
    "Mi-Sol-Si-Re-Fa · Fa-La-Do-Mi — las líneas y espacios del pentagrama en clave de sol.",
    "9 por cualquier número del 1 al 10: los dígitos del resultado siempre suman 9. Prueba 9×7=63, y 6+3=9.",
    "Una caminata de cinco minutos despeja la mente mejor que cinco minutos más mirando el mismo problema.",
    "Escribir una lista de pendientes antes de dormir ayuda a que tu cerebro suelte el día y descanse de verdad.",
    "Primavera adelanta, otoño atrasa — en primavera los relojes se adelantan una hora; en otoño se atrasan.",
    "A la derecha aprieta, a la izquierda afloja — para tornillos y tapas de frasco.",
    "En mil cuatrocientos noventa y dos, Colón llegó a América — una fecha fácil de recordar.",
    "Truco de los nudillos: los meses que caen sobre un nudillo tienen 31 días; los del hueco, 30 (o 28).",
    "La regla 20-20-20: cada 20 minutos, mira algo a 6 metros durante 20 segundos para descansar la vista.",
    "Ponle nombre para calmarlo — decir en voz alta lo que sientes (\"estoy frustrado\") tranquiliza al cerebro.",
    "Un vaso de agua al despertar despeja la mente: el cerebro amanece un poco deshidratado.",
    "Escribir algo a mano ayuda a recordarlo mejor que escribirlo en el teléfono."
  ];

  var isEs = document.documentElement.lang === 'es';
  var TIPS = isEs ? TIPS_ES : TIPS_EN;

  function dayIndex(){
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) % TIPS.length;
  }

  var todayKey = 'sdc_tip_dismissed_' + new Date().toISOString().slice(0,10);
  if (localStorage.getItem(todayKey)) return;

  var linkHref = isEs ? (location.pathname.indexOf('/es/') !== -1 ? 'memorytricks.html' : 'es/memorytricks.html') : 'memorytricks.html';
  var label = isEs ? 'Truco del día' : 'Tip of the Day';
  var moreLabel = isEs ? 'Ver más trucos' : 'Useful memory tricks';
  var closeLabel = isEs ? 'Cerrar' : 'Dismiss';

  var bar = document.createElement('div');
  bar.setAttribute('id', 'sdc-tip-widget');
  bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;'
    + 'background:linear-gradient(180deg,#26241f,#1c1b19);border-top:2px solid var(--accent,#b5651d);'
    + 'color:#efe9da;font-family:"Courier New",Courier,monospace;font-size:0.78rem;'
    + 'padding:10px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;'
    + 'box-shadow:0 -4px 14px rgba(0,0,0,0.4);';

  bar.innerHTML =
    '<span style="font-size:1.2rem;">🐲</span>' +
    '<strong style="color:var(--focus,#e8b94d);white-space:nowrap;">' + label + ':</strong>' +
    '<span style="flex:1;min-width:200px;">' + TIPS[dayIndex()] + '</span>' +
    '<span style="font-size:1.4rem;">👉🏻</span>' +
    '<a href="' + linkHref + '" style="color:#ffe600;text-decoration:underline;white-space:nowrap;font-weight:bold;font-size:1.5rem;">' + moreLabel + ' → 😊</a>' +
    '<button type="button" aria-label="' + closeLabel + '" style="background:none;border:1px solid #4a4739;color:#a8a396;border-radius:6px;padding:3px 9px;cursor:pointer;font-family:inherit;font-size:0.75rem;">✕</button>';

  document.body.appendChild(bar);

  var siteFooter = document.getElementById('sitefooter');
  if (siteFooter){
    var footerPos = getComputedStyle(siteFooter).position;
    if (footerPos === 'absolute' || footerPos === 'fixed'){
      siteFooter.style.bottom = '54px';
    }
  }

  bar.querySelector('button').addEventListener('click', function(){
    localStorage.setItem(todayKey, '1');
    bar.remove();
    if (siteFooter && (getComputedStyle(siteFooter).position === 'absolute' || getComputedStyle(siteFooter).position === 'fixed')){
      siteFooter.style.bottom = '';
    }
  });
})();

/* Sister-site cross-link -> tontoaxolote.com (added on every page via this shared script) */
(function(){
  try {
    var foot = document.getElementById('sitefooter');
    if (!foot || /tontoaxolote/i.test(foot.innerHTML)) return;
    foot.appendChild(document.createTextNode(' \u00b7 '));
    var a = document.createElement('a');
    a.href = 'https://tontoaxolote.com/';
    a.textContent = '\uD83E\uDD8E Spanish for Kids';
    a.title = 'Tonto Axolote \u2014 our sister site: bilingual Spanish for kids';
    a.rel = 'noopener';
    foot.appendChild(a);
  } catch (e) {}
})();
