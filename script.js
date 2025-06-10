document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM geladen – Speicher-, Achievement- und Offline-Version");

  /* -------------------------------------------------
     0) SPEICHERSTAND LADEN
  ---------------------------------------------------*/
  const saved = JSON.parse(localStorage.getItem('gandonSave')) || {};

  let counter            = saved.counter            || 0;
  let autoGeneratorLevel = saved.autoGeneratorLevel || 0;
  let upgradeCost        = saved.upgradeCost        || 50;
  let pepBoostActive     = false;          // Boost nicht persistieren
  let boostTimeLeft      = 0;
  const boostMultiplier  = 2;

  let currentSkin  = saved.currentSkin  || "default";
  let ownedSkins   = saved.ownedSkins   || ["default"];
  let unlocked     = saved.unlocked     || [];      // Achievements

  /* Offline-Progress ------------------------------------------------*/
  if (saved.lastSave){
    const secsOffline = Math.floor((Date.now() - saved.lastSave) / 1000);
    const gained = secsOffline * autoGeneratorLevel;
    if (gained > 0){
      counter += gained;
      alert(`Willkommen zurück!\nDein Auto-Generator hat in deiner Abwesenheit ${gained} Gandons verdient.`);
    }
  }

  /* -------------------------------------------------
     1) DOM-Elemente
  ---------------------------------------------------*/
  const counterDisplay     = document.getElementById('counter');
  const gandonButton       = document.getElementById('gandon-button');
  const gandonImage        = gandonButton.querySelector('img');
  const autoUpgradeButton  = document.getElementById('auto-upgrade');
  const pepUpgradeButton   = document.getElementById('pep-upgrade');
  const autoStatus         = document.getElementById('auto-status');
  const boostTimerDisplay  = document.getElementById('boost-timer');
  const timerValueDisplay  = document.getElementById('timer-value');

  const shopButton         = document.getElementById('shop-button');
  const shopModal          = document.getElementById('shop-modal');
  const closeShopButton    = document.getElementById('close-shop');
  const buySkinButtons     = document.querySelectorAll('.buy-skin-btn');
  const selectSkinButtons  = document.querySelectorAll('.select-skin-btn');

  const achList            = document.getElementById('achievements-list');

  /* -------------------------------------------------
     2) SKIN-URLs (Platzhalter)
  ---------------------------------------------------*/
  const skinUrls = {
    "default": "https://i.ibb.co/nq7cksLC/gandon.webp",
    "neger": "https://i.ibb.co/XZx0ftGV/IMG-7542.png",
    "karotten": "https://i.ibb.co/8g59HTd7/IMG-7543.png",
    "diabetes": "https://i.ibb.co/d0s4V3qD/IMG-7544.png"
  };
  gandonImage.src = skinUrls[currentSkin];

  /* -------------------------------------------------
     3) ACHIEVEMENTS
  ---------------------------------------------------*/
  const achievementList = [
    { id:'first100', text:'100 Gandons gesammelt!',   condition: () => counter >= 100 },
    { id:'lvl5auto', text:'Auto-Generator Level 5!',  condition: () => autoGeneratorLevel >= 5 }
  ];

  function renderAchievements(){
    achList.innerHTML = '';
    unlocked.forEach(a => {
      const obj = achievementList.find(x => x.id === a);
      if (obj){
        achList.insertAdjacentHTML('beforeend', `<p>🏆 ${obj.text}</p>`);
      }
    });
  }

  function checkAchievements(){
    achievementList.forEach(a => {
      if (!unlocked.includes(a.id) && a.condition()){
        unlocked.push(a.id);
        alert('Achievement freigeschaltet: ' + a.text);
        renderAchievements();
      }
    });
  }

  /* -------------------------------------------------
     4) ANZEIGE & SPEICHERN
  ---------------------------------------------------*/
  function saveGame(){
    localStorage.setItem('gandonSave', JSON.stringify({
      counter, autoGeneratorLevel, upgradeCost,
      ownedSkins, currentSkin, unlocked,
      lastSave: Date.now()
    }));
  }

  function updateDisplay(){
    counterDisplay.textContent = "Gandons: " + counter;

    /* Upgrade-Buttons */
    autoUpgradeButton.textContent = `Auto-Gandon-Generator Level ${autoGeneratorLevel + 1} (Kosten: ${upgradeCost} Gandons)`;
    autoUpgradeButton.style.opacity = counter < upgradeCost ? "0.7" : "1";

    pepUpgradeButton.textContent = "Pep-Line Boost (Kosten: 100 Gandons)";
    pepUpgradeButton.style.opacity = (counter < 100 || pepBoostActive) ? "0.7" : "1";
    pepUpgradeButton.disabled = pepBoostActive || counter < 100;

    /* Auto-Status */
    autoStatus.textContent = autoGeneratorLevel > 0
      ? `Auto-Generator: Level ${autoGeneratorLevel} (+${autoGeneratorLevel} Gandons/Sekunde)`
      : "Auto-Generator: Nicht aktiv";

    /* Shop-Buttons */
    updateShopButtons();

    /* Achievements */
    checkAchievements();

    /* Speichern */
    saveGame();
  }

  /* -------------------------------------------------
     5) SHOP-Buttons aktualisieren
  ---------------------------------------------------*/
  function updateShopButtons(){
    buySkinButtons.forEach(btn => {
      const skin  = btn.dataset.skin;
      const price = +btn.dataset.price;

      if (ownedSkins.includes(skin)){
        btn.textContent = "Gekauft";
        btn.disabled = true;
      }else{
        btn.textContent = `Kaufen (${price})`;
        btn.disabled = counter < price;
      }
    });

    /* Select-Buttons Status */
    document.querySelectorAll('.select-skin-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.skin === currentSkin);
    });
  }

  /* -------------------------------------------------
     6) SPIEL-LOGIK
  ---------------------------------------------------*/
  function incrementCounter(){
    /* Kritische Klicks 10 % */
    const crit = Math.random() < 0.1 ? 10 : 1;
    const increment = (pepBoostActive ? boostMultiplier : 1) * crit;
    counter += increment;

    if (crit > 1){
      gandonButton.classList.add('crit');
      setTimeout(() => gandonButton.classList.remove('crit'), 200);
    }

    /* Klick-Animation */
    gandonImage.style.transform = 'scale(1.2)';
    setTimeout(() => gandonImage.style.transform = 'scale(1)', 200);

    updateDisplay();
  }

  function autoGenerate(){
    if (autoGeneratorLevel > 0){
      const inc = autoGeneratorLevel * (pepBoostActive ? boostMultiplier : 1);
      counter += inc;
      updateDisplay();
    }
  }

  /* Boost-Timer */
  let boostTimer = null;
  function updateBoostTimer(){
    boostTimeLeft--;
    timerValueDisplay.textContent = boostTimeLeft;
    if (boostTimeLeft <= 0){
      pepBoostActive = false;
      boostTimerDisplay.classList.add('hidden');
      clearInterval(boostTimer);
      boostTimer = null;
      updateDisplay();
    }
  }

  /* -------------------------------------------------
     7) BUTTON-HANDLER
  ---------------------------------------------------*/
  gandonButton.onclick = incrementCounter;
  gandonButton.ontouchstart = e => { e.preventDefault(); incrementCounter(); };

  autoUpgradeButton.onclick = () => {
    if (counter >= upgradeCost){
      counter -= upgradeCost;
      autoGeneratorLevel++;
      upgradeCost += 50;
      updateDisplay();
    }else{
      alert(`Nicht genügend Gandons (benötigt ${upgradeCost})`);
    }
  };

  pepUpgradeButton.onclick = () => {
    if (pepBoostActive) { alert("Boost läuft bereits!"); return; }
    if (counter < 100){ alert("Nicht genügend Gandons (benötigt 100)"); return; }

    counter -= 100;
    pepBoostActive = true;
    boostTimeLeft = 60;
    timerValueDisplay.textContent = boostTimeLeft;
    boostTimerDisplay.classList.remove('hidden');
    if (boostTimer) clearInterval(boostTimer);
    boostTimer = setInterval(updateBoostTimer, 1000);
    updateDisplay();
  };

  /* Shop */
  shopButton.onclick  = () => { shopModal.classList.remove('hidden'); updateShopButtons(); };
  closeShopButton.onclick = () => shopModal.classList.add('hidden');

  buySkinButtons.forEach(btn => btn.onclick = () => {
    const skin = btn.dataset.skin;
    const price = +btn.dataset.price;
    if (ownedSkins.includes(skin)){ alert("Schon gekauft!"); return; }
    if (counter < price){ alert(`Zu wenig Gandons (benötigt ${price})`); return; }
    counter -= price;
    ownedSkins.push(skin);
    updateDisplay();
  });

  selectSkinButtons.forEach(btn => btn.onclick = () => {
    const skin = btn.dataset.skin;
    if (ownedSkins.includes(skin)){
      currentSkin = skin;
      gandonImage.src = skinUrls[skin];
      updateShopButtons();
      updateDisplay();
    }
  });

  /* -------------------------------------------------
     8) INITIALISIERUNG
  ---------------------------------------------------*/
  renderAchievements();
  updateDisplay();
  setInterval(autoGenerate, 1000);
});