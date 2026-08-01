(function(){
  "use strict";
  var area = document.getElementById('gameArea');
  var dragonEl = document.getElementById('gameDragon');
  var playerEl = document.getElementById('playerAvatar');
  var ropeEl = document.getElementById('ropeLine');
  var fireEl = document.getElementById('fireBlast');
  var overlay = document.getElementById('gameOverlay');
  var overlayEmoji = document.getElementById('overlayEmoji');
  var overlayTitle = document.getElementById('overlayTitle');
  var overlayText = document.getElementById('overlayText');
  var startBtn = document.getElementById('startBtn');
  var hudScore = document.getElementById('hudScore');
  var hudLevel = document.getElementById('hudLevel');
  var hudBest = document.getElementById('hudBest');
  var hudPower = document.getElementById('hudPower');
  var powerDot = document.getElementById('powerDot');
  var corral = document.getElementById('corral');
  var snareBox = document.getElementById('snareBox');
  var captureTimer = document.getElementById('captureTimer');
  var escapeBanner = document.getElementById('escapeBanner');
  var chocolateBanner = document.getElementById('chocolateBanner');
  var caveScene = document.getElementById('caveScene');
  var caveScoreDisplay = document.getElementById('caveScoreDisplay');
  var caveLivesDisplay = document.getElementById('caveLivesDisplay');
  var caveMessage = document.getElementById('caveMessage');

  var inCaveScene = false;
  var caveTriggered = false;
  var caveScore = 0;
  var caveLives = 3;
  var caveRaptorInterval = null;
  var activeRaptors = [];
  var CAVE_TARGET = 10;
  var CAVE_MAX_RAPTORS = 2;
  var chipShieldEl = document.getElementById('chipShield');
  var hudCalories = document.getElementById('hudCalories');

  var snared = false;
  var dragging = false;
  var dragOffsetX = 0, dragOffsetY = 0;
  var snareTimerExpiresAt = 0;
  var snareCountdownInterval = null;

  var LEVEL_MAX = 7;
  var LEVEL_GRADIENT_CLASS = ['','lvl1','lvl2','lvl3','lvl4','lvl5','lvl6','lvl7'];
  var CM2_PX = 2 * 96 / 2.54;
  var SHIELD_WIDTH_PX = 6 * 96;

  var twoPlayerMode = false;
  var p1Keys = {};
  var P1_SPEED = 260;
  var P2_WIN_SCORE = 15;
  var p1ControlsHint = document.getElementById('p1ControlsHint');
  var start2pBtn = document.getElementById('start2pBtn');
  var hudBroadcasts = document.getElementById('hudBroadcasts');
  var hudBroadcastsRow = document.getElementById('hudBroadcastsRow');
  var P1_BROADCAST_MAX = 6;
  var p1BroadcastsRemaining = P1_BROADCAST_MAX;
  var P1_MOVE_RANGE_PX = 3 * 96;

  var phase1WinnerPlayer = 0;
  var duelWinnerRole = '';
  var roleSelectOverlay = document.getElementById('roleSelectOverlay');
  var roleSelectTitle = document.getElementById('roleSelectTitle');
  var duelScene = document.getElementById('duelScene');
  var duelDragonScore = document.getElementById('duelDragonScore');
  var duelProtagonistScore = document.getElementById('duelProtagonistScore');
  var motherDragonEl = document.getElementById('motherDragonEl');
  var babyDragonEl = document.getElementById('babyDragonEl');
  var menacingDragonSprite = document.getElementById('menacingDragonSprite');
  var protagonistSprite = document.getElementById('protagonistSprite');
  var duelCorral = document.getElementById('duelCorral');
  var duelSnareBox = document.getElementById('duelSnareBox');
  var duelCaptureTimer = document.getElementById('duelCaptureTimer');
  var reflectRect = document.getElementById('reflectRect');
  var duelMessage = document.getElementById('duelMessage');
  var pickProtagonistBtn = document.getElementById('pickProtagonistBtn');
  var pickDragonBtn = document.getElementById('pickDragonBtn');

  var duelRunning = false;
  var duelDragonPts = 0, duelProtagonistPts = 0;
  var DUEL_TARGET = 50;
  var babyGrowth = 0;
  var motherTearInterval = null;
  var duelTriangleInterval = null;
  var activeDuelTriangle = null;
  var duelBreathCooldownUntil = 0;
  var reflectActiveUntil = 0;
  var duelSnared = false, duelDragging = false;
  var duelSnareExpiresAt = 0;
  var duelSnareCountdownInterval = null;
  var duelDragOffsetX = 0, duelDragOffsetY = 0;

  var chocCalories = 0;
  var chocHitCount = 0;
  var chipShieldActive = false;
  var chipShieldExpiresAt = 0;
  var chipCycleTimeout = null;
  var activeTriangleEl = null;
  var bombardmentChocCharged = false;
  var chipBroadcastInProgress = false;
  var nextBroadcastAllowedAt = 0;
  var BROADCAST_COOLDOWN_MS = 4000;
  var HEAD_PROXIMITY_PX = 2 * 96;
  var pMouth = document.getElementById('pMouth');
  var pSmear = document.getElementById('pSmear');
  var pFace = document.getElementById('pFace');
  var pEyeL = document.getElementById('pEyeL');
  var pEyeR = document.getElementById('pEyeR');
  var frownTimeout = null;
  var MOUTH_SMILE = 'M25 54 Q35 62 45 54';
  var MOUTH_FROWN = 'M25 58 Q35 50 45 58';
  var FACE_NORMAL = '#e8b98a';
  var FACE_SCARED = '#3a2010';
  var EYE_NORMAL = '#1a1208';
  var EYE_SCARED = '#ff2020';

  function showFrown(){
    pMouth.setAttribute('d', MOUTH_FROWN);
    pSmear.setAttribute('opacity', '1');
    pFace.setAttribute('fill', FACE_SCARED);
    pEyeL.setAttribute('fill', EYE_SCARED);
    pEyeR.setAttribute('fill', EYE_SCARED);
    if (frownTimeout) clearTimeout(frownTimeout);
    frownTimeout = setTimeout(function(){
      pMouth.setAttribute('d', MOUTH_SMILE);
      pSmear.setAttribute('opacity', '0');
      pFace.setAttribute('fill', FACE_NORMAL);
      pEyeL.setAttribute('fill', EYE_NORMAL);
      pEyeR.setAttribute('fill', EYE_NORMAL);
      frownTimeout = null;
    }, 1000);
  }

  function resetFace(){
    if (frownTimeout){ clearTimeout(frownTimeout); frownTimeout = null; }
    pMouth.setAttribute('d', MOUTH_SMILE);
    pSmear.setAttribute('opacity', '0');
    pFace.setAttribute('fill', FACE_NORMAL);
    pEyeL.setAttribute('fill', EYE_NORMAL);
    pEyeR.setAttribute('fill', EYE_NORMAL);
  }

  var POWER_COLORS = { 0:'#3a3a3a', 1:'#8a8a8a', 2:'#4fc3f7', 3:'#66bb6a', 4:'#ffa726', 5:'#ff3b3b' };
  var ropePower = 0;
  var ropePowerExpiresAt = 0;
  var numberSpawnInterval = null;
  var activeNumberEl = null;

  var W = 0, H = 0;
  var dragonX = 0, dragonY = 0, dragonW = 110, dragonH = 80;
  var vx = 0, vy = 0;
  var baseSpeed = 108; // px per second
  var score = 0, level = 1;
  var best = parseInt(localStorage.getItem('sdc_rope_best') || '0', 10);
  hudBest.textContent = best;

  var running = false;
  var lastTime = 0;
  var rafId = null;
  var fireTimer = 0;
  var nextFireCheck = 3000;

  function resize(){
    W = area.clientWidth;
    H = area.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function randomVelocity(speed){
    var angle = Math.random() * Math.PI * 2;
    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  }

  function placeDragonRandom(){
    if (twoPlayerMode){
      dragonX = W / 2 - dragonW / 2;
      dragonY = H / 2 - dragonH / 2;
      vx = 0; vy = 0;
      return;
    }
    var fromLeft = Math.random() < 0.5;
    var speed = baseSpeed + (level - 1) * 22;
    dragonY = Math.random() * (H - dragonH - 90) + 10;
    if (fromLeft){
      dragonX = -dragonW;
      vx = speed;
    } else {
      dragonX = W;
      vx = -speed;
    }
    vy = (Math.random() * 2 - 1) * speed * 0.6;
  }

  function updateDragonFacing(){
    if (vx < 0) dragonEl.classList.add('face-left');
    else dragonEl.classList.remove('face-left');
  }

  function updateLevelBackground(){
    area.classList.remove('lvl1','lvl2','lvl3','lvl4','lvl5','lvl6','lvl7');
    area.classList.add(LEVEL_GRADIENT_CLASS[Math.min(level, LEVEL_MAX)]);
  }

  function draw(){
    dragonEl.style.left = dragonX + 'px';
    dragonEl.style.top = dragonY + 'px';
    updateDragonFacing();
  }

  function setRopePower(n){
    ropePower = n;
    ropePowerExpiresAt = performance.now() + n * 3000;
    hudPower.textContent = n;
    powerDot.style.background = POWER_COLORS[n];
    powerDot.style.boxShadow = n > 0 ? ('0 0 ' + (6 + n * 4) + 'px ' + POWER_COLORS[n]) : 'none';
  }

  function clearRopePower(){
    ropePower = 0;
    ropePowerExpiresAt = 0;
    hudPower.textContent = 0;
    powerDot.style.background = POWER_COLORS[0];
    powerDot.style.boxShadow = 'none';
  }

  function spawnFloatingNumber(){
    if (activeNumberEl){ activeNumberEl.remove(); activeNumberEl = null; }
    if (!running) return;
    var n = 1 + Math.floor(Math.random() * 5);
    var el = document.createElement('div');
    el.className = 'floating-number p' + n;
    el.textContent = n;
    var margin = 40;
    var x = margin + Math.random() * (W - margin * 2 - 34);
    var y = margin + Math.random() * (H - 90 - margin * 2 - 34);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('click', function(e){
      e.stopPropagation();
      setRopePower(n);
      el.remove();
      if (activeNumberEl === el) activeNumberEl = null;
    });
    area.appendChild(el);
    activeNumberEl = el;
  }

  function startNumberSpawner(){
    spawnFloatingNumber();
    numberSpawnInterval = setInterval(spawnFloatingNumber, 5000);
  }

  function stopNumberSpawner(){
    if (numberSpawnInterval) clearInterval(numberSpawnInterval);
    numberSpawnInterval = null;
    if (activeNumberEl){ activeNumberEl.remove(); activeNumberEl = null; }
  }

  function tick(now){
    if (!running) return;
    var dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!snared && !dragging){
      if (twoPlayerMode){
        var mv = P1_SPEED * dt;
        var moveX = 0, moveY = 0;
        if (p1Keys['arrowup'] || p1Keys['w']) moveY -= mv;
        if (p1Keys['arrowdown'] || p1Keys['s']) moveY += mv;
        if (p1Keys['arrowleft'] || p1Keys['a']) moveX -= mv;
        if (p1Keys['arrowright'] || p1Keys['d']) moveX += mv;
        var bandMin = Math.max(0, W / 2 - P1_MOVE_RANGE_PX - dragonW / 2);
        var bandMax = Math.min(W - dragonW, W / 2 + P1_MOVE_RANGE_PX - dragonW / 2);
        dragonX = Math.max(bandMin, Math.min(bandMax, dragonX + moveX));
        dragonY = Math.max(10, Math.min(H - dragonH - 90, dragonY + moveY));
        if (moveX < 0) vx = -1; else if (moveX > 0) vx = 1;
      } else {
        dragonX += vx * dt;
        dragonY += vy * dt;

        if (dragonX <= 0 && vx < 0){ dragonX = 0; vx = Math.abs(vx); }
        if (dragonX >= W - dragonW && vx > 0){ dragonX = W - dragonW; vx = -Math.abs(vx); }
        if (dragonY <= 0){ dragonY = 0; vy = Math.abs(vy); }
        if (dragonY >= H - dragonH - 90){ dragonY = H - dragonH - 90; vy = -Math.abs(vy); }
      }

      updateDragonFacing();
      dragonEl.style.left = dragonX + 'px';
      dragonEl.style.top = dragonY + 'px';
    }

    if (!snared && !twoPlayerMode){
      fireTimer += dt * 1000;
      if (level >= 3 && fireTimer >= nextFireCheck){
        fireTimer = 0;
        nextFireCheck = 2200 + Math.random() * 1800;
        var chance = Math.min(0.08 + (level - 3) * 0.05, 0.4);
        if (Math.random() < chance && isDragonFacingPlayer()) breatheFire();
      }
    }

    if (ropePower > 0 && now >= ropePowerExpiresAt){
      clearRopePower();
    }

    if (chipShieldActive){
      updateChipShieldPosition();
      if (now >= chipShieldExpiresAt) clearChipShield();
    }

    if (!snared && !dragging && !twoPlayerMode && !chipBroadcastInProgress && now >= nextBroadcastAllowedAt){
      var headX = W / 2, headY = H - 80;
      var dcx2 = dragonX + dragonW / 2, dcy2 = dragonY + dragonH / 2;
      var distToHead = Math.sqrt(Math.pow(dcx2 - headX, 2) + Math.pow(dcy2 - headY, 2));
      if (distToHead <= HEAD_PROXIMITY_PX){
        if (chipCycleTimeout){ clearTimeout(chipCycleTimeout); chipCycleTimeout = null; }
        if (activeTriangleEl){ activeTriangleEl.remove(); activeTriangleEl = null; }
        startChipBroadcast();
        chipCycleTimeout = setTimeout(startChipCycle, 1500);
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function getDragonMouthPos(){
    var facingLeft = dragonEl.classList.contains('face-left');
    return {
      x: dragonX + (facingLeft ? dragonW * 0.25 : dragonW * 0.75),
      y: dragonY + dragonH * 0.35
    };
  }

  function isDragonFacingPlayer(){
    var mouth = getDragonMouthPos();
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var pcx = (pRect.left - aRect.left) + pRect.width / 2;
    var facingLeft = dragonEl.classList.contains('face-left');
    if (facingLeft) return pcx <= mouth.x + 24;
    return pcx >= mouth.x - 24;
  }

  function fireBeamHitsPlayer(mouthX, mouthY, beamLen){
    if (beamLen < 8) return false;
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var pcx = (pRect.left - aRect.left) + pRect.width / 2;
    var pcy = (pRect.top - aRect.top) + pRect.height / 2;
    var dx = pcx - mouthX, dy = pcy - mouthY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return true;
    var ux = dx / dist, uy = dy / dist;
    var t = (pcx - mouthX) * ux + (pcy - mouthY) * uy;
    if (t < 0 || t > beamLen) return false;
    var closestX = mouthX + ux * t, closestY = mouthY + uy * t;
    var miss = Math.sqrt((pcx - closestX) * (pcx - closestX) + (pcy - closestY) * (pcy - closestY));
    var hitRadius = Math.max(pRect.width, pRect.height) / 2 + 14;
    return miss <= hitRadius;
  }

  function breatheFire(){
    if (!isDragonFacingPlayer()) return;
    dragonEl.classList.add('mouth-open');
    var mouth = getDragonMouthPos();
    var dcx = mouth.x, dcy = mouth.y;
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var pcx = (pRect.left - aRect.left) + pRect.width / 2;
    var pcy = (pRect.top - aRect.top) + pRect.height / 2;

    var dx = pcx - dcx, dy = pcy - dcy;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;

    fireEl.style.left = dcx + 'px';
    fireEl.style.top = dcy + 'px';
    fireEl.style.width = dist + 'px';
    fireEl.style.transform = 'rotate(' + angle + 'deg)';
    fireEl.classList.remove('blast');
    void fireEl.offsetWidth;
    fireEl.classList.add('blast');

    setTimeout(function(){
      dragonEl.classList.remove('mouth-open');
      fireEl.classList.remove('blast');
      if (running && fireBeamHitsPlayer(dcx, dcy, dist)) endGame('fire');
    }, 450);
  }

  function spawnScorePopup(x, y, text){
    var el = document.createElement('div');
    el.className = 'popup-score';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.textContent = text;
    area.appendChild(el);
    setTimeout(function(){ el.remove(); }, 700);
  }

  function throwRope(clickX, clickY){
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var pcx = (pRect.left - aRect.left) + pRect.width / 2;
    var pcy = (pRect.top - aRect.top) + pRect.height / 2;

    var dx = clickX - pcx, dy = clickY - pcy;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;

    ropeEl.style.left = pcx + 'px';
    ropeEl.style.top = pcy + 'px';
    ropeEl.style.width = dist + 'px';
    ropeEl.style.transform = 'rotate(' + angle + 'deg)';
    ropeEl.className = 'p' + ropePower;
    ropeEl.classList.remove('throw');
    void ropeEl.offsetWidth;
    ropeEl.classList.add('throw');

    playerEl.classList.remove('throwing');
    void playerEl.offsetWidth;
    playerEl.classList.add('throwing');

    var dcx = dragonX + dragonW / 2, dcy = dragonY + dragonH / 2;
    var hitDist = Math.sqrt(Math.pow(clickX - dcx, 2) + Math.pow(clickY - dcy, 2));
    var catchRadius = 55 + ropePower * 15;

    if (hitDist < catchRadius){
      startSnare();
    }
  }

  function updateSnareBoxPosition(){
    var pad = 10;
    snareBox.style.left = (dragonX - pad) + 'px';
    snareBox.style.top = (dragonY - pad) + 'px';
    snareBox.style.width = (dragonW + pad * 2) + 'px';
    snareBox.style.height = (dragonH + pad * 2) + 'px';
  }

  function startSnare(){
    snared = true;
    vx = 0; vy = 0;
    dragonEl.classList.add('snared');
    updateSnareBoxPosition();
    snareBox.classList.add('active');
    snareTimerExpiresAt = performance.now() + 4000;
    captureTimer.textContent = '4';
    captureTimer.classList.add('active');
    if (snareCountdownInterval) clearInterval(snareCountdownInterval);
    snareCountdownInterval = setInterval(function(){
      var remaining = Math.max(0, Math.ceil((snareTimerExpiresAt - performance.now()) / 1000));
      captureTimer.textContent = remaining;
      if (performance.now() >= snareTimerExpiresAt){
        clearInterval(snareCountdownInterval);
        snareCountdownInterval = null;
        if (snared) breakFree();
      }
    }, 100);
  }

  function endSnareUI(){
    snared = false;
    dragging = false;
    dragonEl.classList.remove('snared');
    snareBox.classList.remove('active');
    captureTimer.classList.remove('active');
    if (snareCountdownInterval){ clearInterval(snareCountdownInterval); snareCountdownInterval = null; }
  }

  function breakFree(){
    endSnareUI();
    var v = randomVelocity(baseSpeed + (level - 1) * 22);
    vx = v.vx; vy = v.vy;
    showEscapeBanner();
  }

  function showEscapeBanner(){
    escapeBanner.classList.remove('flying');
    void escapeBanner.offsetWidth;
    escapeBanner.classList.add('flying');
  }

  function completeCatch(){
    endSnareUI();
    var gained = 1 + ropePower;
    score += gained;
    hudScore.textContent = score;
    dragonEl.classList.add('caught');
    spawnScorePopup(dragonX + dragonW / 2, dragonY + dragonH / 2, '+' + gained);
    setTimeout(function(){ dragonEl.classList.remove('caught'); }, 400);
    if (score % 5 === 0 && level < LEVEL_MAX){
      level++;
      hudLevel.textContent = level;
      updateLevelBackground();
      if (level === LEVEL_MAX && !caveTriggered && !twoPlayerMode){
        caveTriggered = true;
        setTimeout(enterCaveScene, 900);
      }
      if (twoPlayerMode && score >= P2_WIN_SCORE){
        phase1WinnerPlayer = 2;
        showRoleSelect('Player 2 wins Phase 1!');
      }
    }
    placeDragonRandom();
  }

  function checkCorralDrop(){
    var cRect = corral.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var cLeft = cRect.left - aRect.left, cTop = cRect.top - aRect.top;
    var cRight = cLeft + cRect.width, cBottom = cTop + cRect.height;
    var dcx = dragonX + dragonW / 2, dcy = dragonY + dragonH / 2;
    if (dcx >= cLeft && dcx <= cRight && dcy >= cTop && dcy <= cBottom){
      completeCatch();
    }
  }

  function updateChipShieldPosition(){
    chipShieldEl.style.left = (dragonX + dragonW / 2 - SHIELD_WIDTH_PX / 2) + 'px';
    chipShieldEl.style.top = (dragonY + dragonH + CM2_PX) + 'px';
  }

  var activeFallingChips = [];

  function removeFromFallingList(record){
    var idx = activeFallingChips.indexOf(record);
    if (idx !== -1) activeFallingChips.splice(idx, 1);
  }

  function deflectAllFallingChips(){
    var toDeflect = activeFallingChips.slice();
    activeFallingChips.length = 0;
    toDeflect.forEach(function(record){
      record.done = true;
      if (record.rafId) cancelAnimationFrame(record.rafId);
      var rect = record.el.getBoundingClientRect();
      var aRect = area.getBoundingClientRect();
      var curX = rect.left - aRect.left;
      var curY = rect.top - aRect.top;
      record.el.remove();
      spawnChipDispersed(curX, curY, Math.random() < 0.5 ? 'left' : 'right');
    });
  }

  function activateChipShield(n){
    chipShieldActive = true;
    chipShieldExpiresAt = performance.now() + n * 1000;
    chipShieldEl.classList.add('active');
    updateChipShieldPosition();
    deflectAllFallingChips();
  }

  function clearChipShield(){
    chipShieldActive = false;
    chipShieldEl.classList.remove('active');
  }

  function spawnWarningTriangle(){
    if (!running) return;
    var n = 1 + Math.floor(Math.random() * 5);
    var el = document.createElement('div');
    el.className = 'chip-triangle';
    var span = document.createElement('span');
    span.textContent = n;
    el.appendChild(span);
    var margin = 40;
    var x = margin + Math.random() * (W - margin * 2 - 38);
    var y = margin + Math.random() * (H - 90 - margin * 2 - 32);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('click', function(e){
      e.stopPropagation();
      activateChipShield(n);
      el.remove();
      if (activeTriangleEl === el) activeTriangleEl = null;
    });
    area.appendChild(el);
    if (activeTriangleEl) activeTriangleEl.remove();
    activeTriangleEl = el;
    setTimeout(function(){
      if (el.parentNode) el.remove();
      if (activeTriangleEl === el) activeTriangleEl = null;
    }, 2500);
  }

  var PLAYER_HALF_WIDTH = 90;
  var CM_PX = 96 / 2.54;

  function checkChipPlayerHit(finalX){
    if (!running){ return; }
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    var playerCenterX = (pRect.left - aRect.left) + pRect.width / 2;
    var zoneLeft = playerCenterX - PLAYER_HALF_WIDTH, zoneRight = playerCenterX + PLAYER_HALF_WIDTH;
    var isHit = finalX > zoneLeft && finalX < zoneRight;
    if (isHit){
      hitPlayerWithChip();
    }
  }

  var CHIP_FALL_MS = 1800;

  function createChipExplosion(x, y){
    var boom = document.createElement('div');
    boom.className = 'choc-explosion';
    boom.style.left = (x - 10) + 'px';
    boom.style.top = (y - 10) + 'px';
    area.appendChild(boom);
    setTimeout(function(){ boom.remove(); }, 600);
  }

  function spawnFallingChip(originX, originY){
    var chip = document.createElement('div');
    chip.className = 'choc-chip';
    var driftX = originX + (Math.random() * 60 - 30);
    var y = originY;
    chip.style.left = driftX + 'px';
    chip.style.top = y + 'px';
    area.appendChild(chip);

    var targetY = H - 14;
    var totalDist = Math.max(targetY - originY, 1);
    var fallSpeed = totalDist / (CHIP_FALL_MS / 1000);
    var lastT = performance.now();
    var warned = false;

    var record = { el: chip, driftX: driftX, rafId: null, done: false };

    function fallStep(now){
      if (record.done) return;
      var dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      y += fallSpeed * dt;

      if (!warned && (targetY - y) <= CM_PX){
        warned = true;
        if (running) showFrown();
      }

      if (y >= targetY){
        y = targetY;
        chip.style.top = y + 'px';
        record.done = true;
        createChipExplosion(driftX, y);
        chip.remove();
        removeFromFallingList(record);
        checkChipPlayerHit(driftX);
        return;
      }

      chip.style.top = y + 'px';
      record.rafId = requestAnimationFrame(fallStep);
    }

    record.rafId = requestAnimationFrame(fallStep);
    activeFallingChips.push(record);
  }

  function spawnChipDispersed(originX, originY, dir){
    var chip = document.createElement('div');
    chip.className = 'choc-chip';
    chip.style.left = originX + 'px';
    chip.style.top = originY + 'px';
    area.appendChild(chip);
    void chip.offsetHeight;
    chip.style.transition = 'left 2s ease-out, top 2s ease-out, opacity 2s ease-out';
    chip.style.left = (dir === 'left' ? -30 : W + 30) + 'px';
    chip.style.top = (originY - 25) + 'px';
    chip.style.opacity = '0';
    setTimeout(function(){ chip.remove(); }, 2000);
  }

  function showChocolateBanner(){
    if (!chocolateBanner || !area) return;
    var bannerW = chocolateBanner.offsetWidth || 320;
    chocolateBanner.style.setProperty('--choc-start', area.clientWidth + 'px');
    chocolateBanner.style.setProperty('--choc-end', (-bannerW - 24) + 'px');
    chocolateBanner.classList.remove('flying');
    void chocolateBanner.offsetWidth;
    chocolateBanner.classList.add('flying');
  }

  if (chocolateBanner){
    chocolateBanner.addEventListener('animationend', function(e){
      if (e.animationName === 'chocBannerFloat') chocolateBanner.classList.remove('flying');
    });
  }

  function hitPlayerWithChip(){
    showFrown();
    if (bombardmentChocCharged){ return; }
    bombardmentChocCharged = true;
    chocCalories += 5;
    chocHitCount++;
    hudCalories.textContent = chocCalories;
    playerEl.style.transform = 'translateX(-50%) scale(' + (1 + chocHitCount * 0.05) + ')';
    var pRect = playerEl.getBoundingClientRect();
    var aRect = area.getBoundingClientRect();
    spawnScorePopup((pRect.left - aRect.left) + pRect.width / 2, (pRect.top - aRect.top), '+5 cal');
    if (chocCalories >= 50){
      if (twoPlayerMode){
        phase1WinnerPlayer = 1;
        showRoleSelect('Player 1 wins Phase 1!');
      } else {
        endGame('choc');
      }
    }
  }

  function startChipBroadcast(){
    bombardmentChocCharged = false;
    chipBroadcastInProgress = true;
    showChocolateBanner();
    nextBroadcastAllowedAt = performance.now() + 1500 + BROADCAST_COOLDOWN_MS;
    setTimeout(function(){ chipBroadcastInProgress = false; }, 1500);
    var count = 20;
    var interval = 1500 / count;
    var dropped = 0;
    var iv = setInterval(function(){
      if (!running){ clearInterval(iv); return; }
      var originX = dragonX + dragonW / 2;
      var originY = dragonY + dragonH * 0.6;
      if (chipShieldActive){
        spawnChipDispersed(originX, originY, Math.random() < 0.5 ? 'left' : 'right');
      } else {
        spawnFallingChip(originX, originY);
      }
      dropped++;
      if (dropped >= count) clearInterval(iv);
    }, interval);
  }

  function startChipCycle(){
    stopChipCycle();
    chipCycleTimeout = setTimeout(function(){
      if (!running) return;
      spawnWarningTriangle();
      chipCycleTimeout = setTimeout(function(){
        if (!running) return;
        startChipBroadcast();
        chipCycleTimeout = setTimeout(startChipCycle, 1500);
      }, 1000);
    }, 6000);
  }

  function stopChipCycle(){
    if (chipCycleTimeout){ clearTimeout(chipCycleTimeout); chipCycleTimeout = null; }
    if (activeTriangleEl){ activeTriangleEl.remove(); activeTriangleEl = null; }
    clearChipShield();
    activeFallingChips.forEach(function(record){
      record.done = true;
      if (record.rafId) cancelAnimationFrame(record.rafId);
      record.el.remove();
    });
    activeFallingChips.length = 0;
  }

  dragonEl.addEventListener('pointerdown', function(e){
    if (!running || !snared) return;
    dragging = true;
    var aRect = area.getBoundingClientRect();
    dragOffsetX = (e.clientX - aRect.left) - dragonX;
    dragOffsetY = (e.clientY - aRect.top) - dragonY;
    e.preventDefault();
    e.stopPropagation();
  });

  area.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var aRect = area.getBoundingClientRect();
    dragonX = (e.clientX - aRect.left) - dragOffsetX;
    dragonY = (e.clientY - aRect.top) - dragOffsetY;
    dragonX = Math.max(0, Math.min(W - dragonW, dragonX));
    dragonY = Math.max(0, Math.min(H - dragonH, dragonY));
    dragonEl.style.left = dragonX + 'px';
    dragonEl.style.top = dragonY + 'px';
    updateSnareBoxPosition();
  });

  var suppressNextClick = false;

  window.addEventListener('pointerup', function(){
    if (!dragging) return;
    dragging = false;
    if (snared) checkCorralDrop();
    suppressNextClick = true;
    setTimeout(function(){ suppressNextClick = false; }, 50);
  });

  area.addEventListener('click', function(e){
    if (!running || snared || suppressNextClick) return;
    var aRect = area.getBoundingClientRect();
    throwRope(e.clientX - aRect.left, e.clientY - aRect.top);
  });

  var P1_KEYS = ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '];

  function triggerP1ChipDrop(){
    if (!running || !twoPlayerMode || snared || dragging) return;
    if (chipBroadcastInProgress || p1BroadcastsRemaining <= 0) return;
    p1BroadcastsRemaining--;
    if (hudBroadcasts) hudBroadcasts.textContent = p1BroadcastsRemaining;
    startChipBroadcast();
  }

  window.addEventListener('keydown', function(e){
    if (duelRunning){
      if (e.key === ' '){ e.preventDefault(); duelBreatheFire(); }
      return;
    }
    if (!twoPlayerMode || !running) return;
    var k = e.key.toLowerCase();
    if (P1_KEYS.indexOf(k) === -1) return;
    e.preventDefault();
    p1Keys[k] = true;
    if (k === ' ') triggerP1ChipDrop();
  });

  window.addEventListener('keyup', function(e){
    var k = e.key.toLowerCase();
    if (P1_KEYS.indexOf(k) === -1) return;
    p1Keys[k] = false;
  });

  var rulesCard = document.getElementById('rulesCard');
  var howToPlayLink = document.getElementById('howToPlayLink');

  function setRulesCollapsed(collapsed){
    rulesCard.style.display = collapsed ? 'none' : '';
    howToPlayLink.style.display = collapsed ? 'inline' : 'none';
  }

  howToPlayLink.addEventListener('click', function(e){
    e.preventDefault();
    rulesCard.style.display = '';
    rulesCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function setTipWidgetHidden(hidden){
    var tipBar = document.getElementById('sdc-tip-widget');
    if (!tipBar) return;
    if (hidden){
      tipBar.style.top = '0';
      tipBar.style.bottom = 'auto';
      tipBar.style.borderTop = 'none';
      tipBar.style.borderBottom = '2px solid var(--accent,#b5651d)';
      tipBar.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)';
    } else {
      tipBar.style.top = 'auto';
      tipBar.style.bottom = '0';
      tipBar.style.borderTop = '2px solid var(--accent,#b5651d)';
      tipBar.style.borderBottom = 'none';
      tipBar.style.boxShadow = '0 -4px 14px rgba(0,0,0,0.4)';
    }
  }

  function startGame(isTwoPlayer){
    setTipWidgetHidden(true);
    setRulesCollapsed(true);
    twoPlayerMode = !!isTwoPlayer;
    p1Keys = {};
    p1ControlsHint.classList.toggle('show', twoPlayerMode);
    hudBroadcastsRow.style.display = twoPlayerMode ? 'block' : 'none';
    p1BroadcastsRemaining = P1_BROADCAST_MAX;
    hudBroadcasts.textContent = p1BroadcastsRemaining;
    caveTriggered = false;
    nextBroadcastAllowedAt = 0;
    if (inCaveScene) exitCaveScene();
    score = 0; level = 1; fireTimer = 0; nextFireCheck = 3000;
    chocCalories = 0; chocHitCount = 0;
    hudScore.textContent = 0;
    hudLevel.textContent = 1;
    hudCalories.textContent = 0;
    clearRopePower();
    endSnareUI();
    overlay.classList.remove('show');
    playerEl.classList.remove('toasted');
    playerEl.style.transform = 'translateX(-50%) scale(1)';
    resetFace();
    bombardmentChocCharged = false;
    updateLevelBackground();
    resize();
    placeDragonRandom();
    draw();
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
    startNumberSpawner();
    if (!twoPlayerMode) startChipCycle();
  }

  function endGame(reason){
    setTipWidgetHidden(false);
    setRulesCollapsed(false);
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    stopNumberSpawner();
    clearRopePower();
    endSnareUI();
    stopChipCycle();
    if (score > best){
      best = score;
      localStorage.setItem('sdc_rope_best', String(best));
      hudBest.textContent = best;
    }
    playerEl.classList.add('toasted');
    p1ControlsHint.classList.remove('show');
    if (twoPlayerMode && reason === 'p2win'){
      overlayEmoji.textContent = '🏆🎉';
      overlayTitle.textContent = 'Player 2 Wins!';
      overlayText.textContent = 'The deflector caught the dragon enough times! Final score: ' + score + '.';
    } else if (twoPlayerMode && reason === 'choc'){
      overlayEmoji.textContent = '🏆🍫';
      overlayTitle.textContent = 'Player 1 Wins!';
      overlayText.textContent = 'The dragon bombed Player 2 with enough chocolate! Final score: ' + score + '.';
    } else if (reason === 'choc'){
      overlayEmoji.textContent = '🍫😵🍫';
      overlayTitle.textContent = 'Chocolate Overload!';
      overlayText.textContent = 'Too many chips landed — you\'ve had plenty of sugar for one day. Final score: ' + score + '. Best: ' + best + '.';
    } else {
      overlayEmoji.textContent = '😊🔥😊';
      overlayTitle.textContent = 'Happy Demise!';
      overlayText.textContent = 'The dragon got you — but everyone\'s smiling. Final score: ' + score + '. Best: ' + best + '.';
    }
    startBtn.textContent = twoPlayerMode ? '1 Player' : 'Play Again';
    start2pBtn.textContent = '2 Player';
    overlay.classList.add('show');
  }

  function enterCaveScene(){
    inCaveScene = true;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    stopNumberSpawner();
    stopChipCycle();
    clearRopePower();
    endSnareUI();
    caveScore = 0;
    caveLives = 3;
    caveScoreDisplay.textContent = caveScore;
    caveLivesDisplay.textContent = caveLives;
    caveMessage.classList.remove('show');
    caveScene.classList.add('show');
    startCaveRaptors();
  }

  function exitCaveScene(){
    inCaveScene = false;
    stopCaveRaptors();
    caveScene.classList.remove('show');
  }

  function spawnRaptor(){
    if (!inCaveScene) return;
    if (activeRaptors.length >= CAVE_MAX_RAPTORS) return;
    var el = document.createElement('div');
    el.className = 'raptor';
    var margin = 20;
    var x = margin + Math.random() * (W - margin * 2 - 92);
    var y = 50 + Math.random() * (H - 50 - 90 - 66);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    caveScene.appendChild(el);
    var raptor = { el: el, timer: null, slain: false };
    el.addEventListener('click', function(e){
      e.stopPropagation();
      if (raptor.slain) return;
      slayRaptor(raptor);
    });
    raptor.timer = setTimeout(function(){
      if (!raptor.slain) raptorAttack(raptor);
    }, 3200);
    activeRaptors.push(raptor);
  }

  function removeRaptorFromList(raptor){
    var idx = activeRaptors.indexOf(raptor);
    if (idx !== -1) activeRaptors.splice(idx, 1);
  }

  function slayRaptor(raptor){
    raptor.slain = true;
    if (raptor.timer) clearTimeout(raptor.timer);
    raptor.el.classList.add('slain');
    caveScore += 2;
    caveScoreDisplay.textContent = caveScore;
    setTimeout(function(){
      raptor.el.remove();
      removeRaptorFromList(raptor);
    }, 300);
    if (caveScore >= CAVE_TARGET) caveWin();
  }

  function raptorAttack(raptor){
    raptor.slain = true;
    raptor.el.remove();
    removeRaptorFromList(raptor);
    caveLives--;
    caveLivesDisplay.textContent = Math.max(caveLives, 0);
    if (caveLives <= 0) caveLose();
  }

  function startCaveRaptors(){
    stopCaveRaptors();
    spawnRaptor();
    caveRaptorInterval = setInterval(spawnRaptor, 2200);
  }

  function stopCaveRaptors(){
    if (caveRaptorInterval){ clearInterval(caveRaptorInterval); caveRaptorInterval = null; }
    activeRaptors.forEach(function(r){
      if (r.timer) clearTimeout(r.timer);
      r.el.remove();
    });
    activeRaptors.length = 0;
  }

  function caveLose(){
    stopCaveRaptors();
    caveMessage.textContent = 'Hurry up and get back to this level... you must save the mother dragon and her baby.';
    caveMessage.classList.add('show');
    setTimeout(function(){
      exitCaveScene();
      caveTriggered = false;
      startGame();
    }, 3200);
  }

  function caveWin(){
    stopCaveRaptors();
    caveMessage.textContent = 'The cave is clear! Something is waiting deeper in...';
    caveMessage.classList.add('show');
    setTimeout(function(){
      caveScene.classList.remove('show');
      caveMessage.classList.remove('show');
      enterBossScene();
    }, 2600);
  }

  var bossScene = document.getElementById('bossScene');
  var bossLivesDisplay = document.getElementById('bossLivesDisplay');
  var bossDamageDisplay = document.getElementById('bossDamageDisplay');
  var bossIntroBanner = document.getElementById('bossIntroBanner');
  var antagonistDragon = document.getElementById('antagonistDragon');
  var bossFlameBeam = document.getElementById('bossFlameBeam');
  var bossPauseOverlay = document.getElementById('bossPauseOverlay');
  var bossMessage = document.getElementById('bossMessage');

  var bossRunning = false;
  var bossLives = 2;
  var bossDamage = 0;
  var BOSS_TARGET_SECONDS = 8;
  var bossNumberInterval = null;
  var activeBossNumber = null;
  var bossAttackInterval = null;
  var bossSequenceActive = false;

  function enterBossScene(){
    bossRunning = true;
    bossLives = 2;
    bossDamage = 0;
    bossSequenceActive = false;
    bossLivesDisplay.textContent = bossLives;
    bossDamageDisplay.textContent = 0;
    antagonistDragon.classList.remove('defeated');
    bossMessage.classList.remove('show');
    bossScene.classList.add('show');

    bossIntroBanner.textContent = '🎺 The trumpets sound! You receive 2 extra lives!';
    bossIntroBanner.classList.add('show');
    setTimeout(function(){
      bossIntroBanner.classList.remove('show');
      startBossNumberSpawner();
      startBossAttacks();
    }, 2200);
  }

  function exitBossScene(){
    bossRunning = false;
    stopBossNumberSpawner();
    if (bossAttackInterval){ clearInterval(bossAttackInterval); bossAttackInterval = null; }
    bossScene.classList.remove('show');
  }

  function spawnBossNumber(){
    if (!bossRunning || bossSequenceActive) return;
    if (activeBossNumber){ activeBossNumber.remove(); activeBossNumber = null; }
    var n = 1 + Math.floor(Math.random() * 5);
    var el = document.createElement('div');
    el.className = 'floating-number p' + n;
    el.textContent = n;
    var margin = 40;
    var x = margin + Math.random() * (bossScene.clientWidth - margin * 2 - 34);
    var y = 220 + Math.random() * (bossScene.clientHeight - 300);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('click', function(e){
      e.stopPropagation();
      el.remove();
      if (activeBossNumber === el) activeBossNumber = null;
      triggerBossFlameSequence(n);
    });
    bossScene.appendChild(el);
    activeBossNumber = el;
  }

  function startBossNumberSpawner(){
    spawnBossNumber();
    bossNumberInterval = setInterval(spawnBossNumber, 5000);
  }

  function stopBossNumberSpawner(){
    if (bossNumberInterval){ clearInterval(bossNumberInterval); bossNumberInterval = null; }
    if (activeBossNumber){ activeBossNumber.remove(); activeBossNumber = null; }
  }

  function positionBossFlameBeam(){
    var swordRect = document.getElementById('bossSword').getBoundingClientRect();
    var dragonRect = antagonistDragon.getBoundingClientRect();
    var sceneRect = bossScene.getBoundingClientRect();
    var sx = (swordRect.left - sceneRect.left) + swordRect.width / 2;
    var sy = (swordRect.top - sceneRect.top) + swordRect.height / 2;
    var dx = (dragonRect.left - sceneRect.left) + dragonRect.width / 2;
    var dy = (dragonRect.top - sceneRect.top) + dragonRect.height / 2;
    var dist = Math.sqrt(Math.pow(dx - sx, 2) + Math.pow(dy - sy, 2));
    var angle = Math.atan2(dy - sy, dx - sx) * 180 / Math.PI;
    bossFlameBeam.style.left = sx + 'px';
    bossFlameBeam.style.top = sy + 'px';
    bossFlameBeam.style.width = dist + 'px';
    bossFlameBeam.style.transform = 'rotate(' + angle + 'deg)';
  }

  function triggerBossFlameSequence(n){
    if (!bossRunning) return;
    bossSequenceActive = true;
    stopBossNumberSpawner();
    bossPauseOverlay.textContent = 'Grabbed ' + n + '! Steadying the blade...';
    bossPauseOverlay.classList.add('show');

    setTimeout(function(){
      bossPauseOverlay.textContent = '🎺 Trumpet blast! 🎺';
      setTimeout(function(){
        bossPauseOverlay.classList.remove('show');
        positionBossFlameBeam();
        bossFlameBeam.classList.add('active');
        antagonistDragon.classList.add('scorched');

        setTimeout(function(){
          bossFlameBeam.classList.remove('active');
          antagonistDragon.classList.remove('scorched');
          bossDamage += n;
          bossDamageDisplay.textContent = Math.min(bossDamage, BOSS_TARGET_SECONDS);
          bossSequenceActive = false;
          if (bossDamage >= BOSS_TARGET_SECONDS){
            bossVictory();
          } else if (bossRunning){
            startBossNumberSpawner();
          }
        }, n * 1000);
      }, 2000);
    }, 3000);
  }

  function startBossAttacks(){
    if (bossAttackInterval) clearInterval(bossAttackInterval);
    bossAttackInterval = setInterval(function(){
      if (!bossRunning || bossSequenceActive) return;
      if (Math.random() < 0.35) bossAttackPlayer();
    }, 4500);
  }

  function bossAttackPlayer(){
    antagonistDragon.classList.add('attacking');
    setTimeout(function(){ antagonistDragon.classList.remove('attacking'); }, 400);
    bossLives--;
    bossLivesDisplay.textContent = Math.max(bossLives, 0);
    if (bossLives <= 0) bossDefeat();
  }

  function bossVictory(){
    exitBossScene();
    playerEl.classList.add('toasted');
    overlayEmoji.textContent = '🏆🐲';
    overlayTitle.textContent = 'The Mother Dragon is Saved!';
    overlayText.textContent = 'Eight seconds of flame brought the antagonist dragon down for good. You did it — final score: ' + score + '.';
    startBtn.textContent = '1 Player';
    overlay.classList.add('show');
  }

  function bossDefeat(){
    exitBossScene();
    bossMessage.textContent = 'Hurry up and get back to this level... you must save the mother dragon and her baby.';
    bossScene.classList.add('show');
    bossMessage.classList.add('show');
    setTimeout(function(){
      bossScene.classList.remove('show');
      bossMessage.classList.remove('show');
      caveTriggered = false;
      startGame(false);
    }, 3200);
  }

  function showRoleSelect(title){
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    stopNumberSpawner();
    clearRopePower();
    endSnareUI();
    stopChipCycle();
    p1ControlsHint.classList.remove('show');
    roleSelectTitle.textContent = title;
    roleSelectOverlay.classList.add('show');
  }

  function pickRole(role){
    roleSelectOverlay.classList.remove('show');
    duelWinnerRole = role;
    startDuel();
  }

  function startDuel(){
    duelRunning = true;
    duelDragonPts = 0; duelProtagonistPts = 0;
    duelDragonScore.textContent = 0;
    duelProtagonistScore.textContent = 0;
    babyGrowth = 0;
    babyDragonEl.style.transform = 'translate(-50%,0) scale(1)';
    babyDragonEl.classList.remove('mouth-open', 'exploding');
    babyDragonEl.textContent = '🐉';
    menacingDragonSprite.classList.remove('breathing');
    reflectRect.classList.remove('active');
    reflectActiveUntil = 0;
    duelBreathCooldownUntil = 0;
    duelMessage.classList.remove('show');
    duelScene.classList.add('show');
    if (motherTearInterval) clearInterval(motherTearInterval);
    motherTearInterval = setInterval(spawnMotherTear, 2000);
    if (duelTriangleInterval) clearInterval(duelTriangleInterval);
    spawnDuelTriangle();
    duelTriangleInterval = setInterval(spawnDuelTriangle, 4000);
  }

  function stopDuel(){
    duelRunning = false;
    if (motherTearInterval){ clearInterval(motherTearInterval); motherTearInterval = null; }
    if (duelTriangleInterval){ clearInterval(duelTriangleInterval); duelTriangleInterval = null; }
    if (activeDuelTriangle){ activeDuelTriangle.remove(); activeDuelTriangle = null; }
    if (duelSnareCountdownInterval){ clearInterval(duelSnareCountdownInterval); duelSnareCountdownInterval = null; }
    duelSnared = false; duelDragging = false;
    duelSnareBox.classList.remove('active');
    duelCaptureTimer.classList.remove('active');
  }

  function spawnMotherTear(){
    if (!duelRunning) return;
    var tear = document.createElement('div');
    tear.className = 'duel-tear';
    tear.textContent = '💧';
    var mRect = motherDragonEl.getBoundingClientRect();
    var sRect = duelScene.getBoundingClientRect();
    tear.style.left = (mRect.left - sRect.left + 16) + 'px';
    tear.style.top = (mRect.top - sRect.top + 30) + 'px';
    duelScene.appendChild(tear);
    setTimeout(function(){ tear.remove(); }, 1400);
  }

  function spawnDuelTriangle(){
    if (!duelRunning) return;
    if (activeDuelTriangle){ activeDuelTriangle.remove(); activeDuelTriangle = null; }
    var el = document.createElement('div');
    el.className = 'chip-triangle';
    var span = document.createElement('span');
    span.textContent = '⚔';
    el.appendChild(span);
    var W2 = duelScene.clientWidth, H2 = duelScene.clientHeight;
    var x = 40 + Math.random() * (W2 - 120);
    var y = 130 + Math.random() * (H2 - 260);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.addEventListener('click', function(e){
      e.stopPropagation();
      activateReflect();
      el.remove();
      if (activeDuelTriangle === el) activeDuelTriangle = null;
    });
    duelScene.appendChild(el);
    activeDuelTriangle = el;
  }

  function activateReflect(){
    reflectRect.classList.add('active');
    reflectActiveUntil = performance.now() + 3000;
    var dRect = menacingDragonSprite.getBoundingClientRect();
    var sRect = duelScene.getBoundingClientRect();
    reflectRect.style.left = (dRect.left - sRect.left - 20) + 'px';
    reflectRect.style.top = (dRect.top - sRect.top + 10) + 'px';
    setTimeout(function(){
      if (performance.now() >= reflectActiveUntil) reflectRect.classList.remove('active');
    }, 3000);
  }

  function duelBreatheFire(){
    if (!duelRunning || performance.now() < duelBreathCooldownUntil) return;
    duelBreathCooldownUntil = performance.now() + 1600;
    menacingDragonSprite.classList.add('breathing');
    setTimeout(function(){ menacingDragonSprite.classList.remove('breathing'); }, 300);

    if (performance.now() < reflectActiveUntil){
      duelProtagonistPts += 5;
      duelProtagonistScore.textContent = duelProtagonistPts;
      if (duelProtagonistPts >= DUEL_TARGET) endDuel('protagonist');
      return;
    }
    duelDragonPts += 10;
    duelDragonScore.textContent = duelDragonPts;
    babyGrowth++;
    babyDragonEl.classList.add('mouth-open');
    babyDragonEl.style.transform = 'translate(-50%,0) scale(' + (1 + babyGrowth * 0.25) + ')';
    setTimeout(function(){ babyDragonEl.classList.remove('mouth-open'); }, 400);
    if (duelDragonPts >= DUEL_TARGET){
      babyDragonEl.classList.add('exploding');
      setTimeout(function(){ endDuel('dragon'); }, 500);
    }
  }

  function updateDuelSnareBoxPosition(){
    var dRect = menacingDragonSprite.getBoundingClientRect();
    var sRect = duelScene.getBoundingClientRect();
    duelSnareBox.style.left = (dRect.left - sRect.left - 10) + 'px';
    duelSnareBox.style.top = (dRect.top - sRect.top - 10) + 'px';
    duelSnareBox.style.width = (dRect.width + 20) + 'px';
    duelSnareBox.style.height = (dRect.height + 20) + 'px';
  }

  function startDuelSnare(){
    duelSnared = true;
    updateDuelSnareBoxPosition();
    duelSnareBox.classList.add('active');
    duelSnareExpiresAt = performance.now() + 3000;
    duelCaptureTimer.textContent = '3';
    duelCaptureTimer.classList.add('active');
    if (duelSnareCountdownInterval) clearInterval(duelSnareCountdownInterval);
    duelSnareCountdownInterval = setInterval(function(){
      var remaining = Math.max(0, Math.ceil((duelSnareExpiresAt - performance.now()) / 1000));
      duelCaptureTimer.textContent = remaining;
      if (performance.now() >= duelSnareExpiresAt){
        clearInterval(duelSnareCountdownInterval);
        duelSnareCountdownInterval = null;
        endDuelSnareUI();
      }
    }, 100);
  }

  function endDuelSnareUI(){
    duelSnared = false;
    duelDragging = false;
    duelSnareBox.classList.remove('active');
    duelCaptureTimer.classList.remove('active');
    if (duelSnareCountdownInterval){ clearInterval(duelSnareCountdownInterval); duelSnareCountdownInterval = null; }
  }

  function checkDuelCorralDrop(){
    var cRect = duelCorral.getBoundingClientRect();
    var dRect = menacingDragonSprite.getBoundingClientRect();
    var overlap = !(dRect.right < cRect.left || dRect.left > cRect.right || dRect.bottom < cRect.top || dRect.top > cRect.bottom);
    if (overlap) endDuel('protagonist');
  }

  menacingDragonSprite.addEventListener('click', function(e){
    e.stopPropagation();
    if (!duelRunning || duelSnared) return;
    startDuelSnare();
  });

  menacingDragonSprite.addEventListener('pointerdown', function(e){
    if (!duelRunning || !duelSnared) return;
    duelDragging = true;
    e.preventDefault();
    e.stopPropagation();
  });

  duelScene.addEventListener('pointermove', function(e){
    if (!duelDragging) return;
    var sRect = duelScene.getBoundingClientRect();
    var x = e.clientX - sRect.left, y = e.clientY - sRect.top;
    menacingDragonSprite.style.left = x + 'px';
    menacingDragonSprite.style.top = y + 'px';
    menacingDragonSprite.style.transform = 'scale(1.5)';
    updateDuelSnareBoxPosition();
  });

  window.addEventListener('pointerup', function(){
    if (!duelDragging) return;
    duelDragging = false;
    if (duelSnared) checkDuelCorralDrop();
  });

  function endDuel(winner){
    stopDuel();
    duelScene.classList.remove('show');
    var winningPlayer;
    if ((winner === 'protagonist' && duelWinnerRole === 'protagonist') || (winner === 'dragon' && duelWinnerRole === 'dragon')){
      winningPlayer = phase1WinnerPlayer;
    } else {
      winningPlayer = phase1WinnerPlayer === 1 ? 2 : 1;
    }
    playerEl.classList.add('toasted');
    overlayEmoji.textContent = winner === 'dragon' ? '🏆🐉' : '🏆⚔️';
    overlayTitle.textContent = 'Player ' + winningPlayer + ' Wins the Duel!';
    overlayText.textContent = winner === 'dragon'
      ? 'The baby dragon couldn\'t take any more chocolate fire and burst with joy. The menacing dragon reigns supreme.'
      : 'The protagonist either reflected the fire back or roped the dragon straight into the corral. Victory!';
    startBtn.textContent = '1 Player';
    start2pBtn.textContent = '2 Player';
    overlay.classList.add('show');
  }

  pickProtagonistBtn.addEventListener('click', function(){ pickRole('protagonist'); });
  pickDragonBtn.addEventListener('click', function(){ pickRole('dragon'); });

  startBtn.addEventListener('click', function(){ startGame(false); });
  start2pBtn.addEventListener('click', function(){ startGame(true); });

  if (location.search.indexOf('testact3') !== -1){
    startGame(false);
    setTimeout(function(){
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      stopNumberSpawner();
      stopChipCycle();
      enterBossScene();
    }, 200);
  }

  function bindMissingImageFallback(img, emoji){
    if (!img) return;
    img.addEventListener('error', function onErr(){
      img.removeEventListener('error', onErr);
      var el = document.createElement('span');
      el.id = img.id;
      el.className = (img.className || '') + ' asset-fallback';
      el.textContent = emoji;
      el.setAttribute('aria-label', img.alt || emoji);
      if (img.parentNode) img.parentNode.replaceChild(el, img);
    });
  }
  bindMissingImageFallback(document.getElementById('caveSword'), '⚔️');
  bindMissingImageFallback(document.getElementById('babyDragonBoss'), '🐉');
  bindMissingImageFallback(document.getElementById('antagonistDragon'), '🐲');
  bindMissingImageFallback(document.getElementById('bossSword'), '⚔️');
})();
