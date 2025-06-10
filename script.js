document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM geladen - Multi-Upgrade mit Pep-Line Version");
  
  // Variablen
  let counter = 0;
  let autoGeneratorLevel = 0;
  let upgradeCost = 50;
  let pepBoostActive = false;
  let boostTimeLeft = 0;
  let boostMultiplier = 2; // Verdoppelt die Gandons
  let boostTimer = null;
  
  const counterDisplay = document.getElementById('counter');
  const gandonButton = document.getElementById('gandon-button');
  const autoUpgradeButton = document.getElementById('auto-upgrade');
  const pepUpgradeButton = document.getElementById('pep-upgrade');
  const autoStatus = document.getElementById('auto-status');
  const boostTimerDisplay = document.getElementById('boost-timer');
  const timerValueDisplay = document.getElementById('timer-value');
  
  // Event-Handler für den Gandon-Button
  function incrementCounter() {
    console.log("Klick/Touch auf Gandon erkannt!");
    
    // Wenn Boost aktiv, dann doppelte Gandons
    const increment = pepBoostActive ? boostMultiplier : 1;
    counter += increment;
    
    updateDisplay();
    
    // Animation
    const img = gandonButton.querySelector('img');
    img.style.transform = 'scale(1.2)';
    setTimeout(function() {
      img.style.transform = 'scale(1)';
    }, 300);
  }
  
  // Funktion zur Aktualisierung der Anzeige
  function updateDisplay() {
    counterDisplay.textContent = "Gandons: " + counter;
    updateUpgradeButtons();
    
    if (autoGeneratorLevel > 0) {
      autoStatus.textContent = "Auto-Generator: Level " + autoGeneratorLevel + 
                              " (+" + autoGeneratorLevel + " Gandons/Sekunde)";
    } else {
      autoStatus.textContent = "Auto-Generator: Nicht aktiv";
    }
  }
  
  // Upgrade-Buttons aktualisieren
  function updateUpgradeButtons() {
    // Auto-Generator Button
    autoUpgradeButton.textContent = "Auto-Gandon-Generator Level " + 
                               (autoGeneratorLevel + 1) + 
                               " (Kosten: " + upgradeCost + " Gandons)";
    
    if (counter < upgradeCost) {
      autoUpgradeButton.style.opacity = "0.7";
    } else {
      autoUpgradeButton.style.opacity = "1";
    }
    
    // Pep-Line Button Text aktualisieren
    pepUpgradeButton.textContent = "Pep-Line Boost (Kosten: 100 Gandons)";
    
    if (counter < 100 || pepBoostActive) {
      pepUpgradeButton.style.opacity = "0.7";
      pepUpgradeButton.disabled = pepBoostActive;
    } else {
      pepUpgradeButton.style.opacity = "1";
      pepUpgradeButton.disabled = false;
    }
  }
  
  // Auto-Generator (wird jede Sekunde ausgeführt)
  function autoGenerate() {
    if (autoGeneratorLevel > 0) {
      // Wenn Boost aktiv, dann doppelte Gandons
      const autoIncrement = autoGeneratorLevel * (pepBoostActive ? boostMultiplier : 1);
      counter += autoIncrement;
      updateDisplay();
      console.log("Auto-Generator hat +" + autoIncrement + " Gandons erzeugt");
    }
  }
  
  // Pep-Line Boost Timer aktualisieren
  function updateBoostTimer() {
    boostTimeLeft--;
    timerValueDisplay.textContent = boostTimeLeft;
    
    if (boostTimeLeft <= 0) {
      // Boost deaktivieren
      pepBoostActive = false;
      boostTimerDisplay.classList.add('hidden');
      clearInterval(boostTimer);
      boostTimer = null;
      
      updateDisplay();
      console.log("Pep-Line Boost ist abgelaufen");
    }
  }
  
  // Event-Handler für Auto-Upgrade-Button
  function buyAutoUpgrade() {
    console.log("Auto-Upgrade-Button wurde geklickt");
    
    if (counter >= upgradeCost) {
      // Kauf durchführen
      counter -= upgradeCost;
      autoGeneratorLevel++;
      
      // Nächstes Upgrade wird teurer
      upgradeCost += 50;
      
      updateDisplay();
      console.log("Auto-Upgrade auf Level " + autoGeneratorLevel + " erfolgreich gekauft");
    } else {
      alert("Nicht genügend Gandons für das Upgrade (benötigt " + upgradeCost + ")!");
    }
  }
  
  // Event-Handler für Pep-Line-Upgrade-Button
  function buyPepBoost() {
    console.log("Pep-Line-Upgrade-Button wurde geklickt");
    
    if (counter >= 100 && !pepBoostActive) {
      // Kauf durchführen
      counter -= 100;
      pepBoostActive = true;
      boostTimeLeft = 60; // 60 Sekunden
      
      // Timer anzeigen
      boostTimerDisplay.classList.remove('hidden');
      timerValueDisplay.textContent = boostTimeLeft;
      
      // Timer starten
      if (boostTimer) {
        clearInterval(boostTimer);
      }
      boostTimer = setInterval(updateBoostTimer, 1000);
      
      updateDisplay();
      console.log("Pep-Line Boost für 60 Sekunden aktiviert");
    } else if (pepBoostActive) {
      alert("Pep-Line Boost ist bereits aktiv!");
    } else {
      alert("Nicht genügend Gandons für das Upgrade (benötigt 100)!");
    }
  }
  
  // Event-Listener zuweisen
  gandonButton.onclick = incrementCounter;
  gandonButton.ontouchstart = function(e) {
    e.preventDefault(); // Verhindert Doppel-Events
    incrementCounter();
  };
  
  // Event-Listener für Auto-Upgrade-Button
  autoUpgradeButton.onclick = buyAutoUpgrade;
  autoUpgradeButton.ontouchstart = function(e) {
    e.preventDefault();
    buyAutoUpgrade();
  };
  
  // Event-Listener für Pep-Line-Upgrade-Button
  pepUpgradeButton.onclick = buyPepBoost;
  pepUpgradeButton.ontouchstart = function(e) {
    e.preventDefault();
    buyPepBoost();
  };
  
  // Auto-Generator starten
  setInterval(autoGenerate, 1000);
  
  // Initiale Anzeige
  updateDisplay();
  
  // Testausgaben
  console.log("Gandon-Button gefunden:", !!gandonButton);
  console.log("Auto-Upgrade-Button gefunden:", !!autoUpgradeButton);
  console.log("Pep-Upgrade-Button gefunden:", !!pepUpgradeButton);
  console.log("Event-Handler wurden zugewiesen");
});