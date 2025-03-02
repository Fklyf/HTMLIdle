document.addEventListener("DOMContentLoaded", function () {
  // --- Basic Game Variables ---
  let score = 0;
  let increment = 1;
  let enemyHP = 100;
  let enemyType = "None";
  
  // --- Elemental Damage & Upgrade Variables ---
  const elements = {
    "Chaos": 1,
    "Shock": 1,
    "Fire": 1,
    "Ice": 1
  };
  const elementUpgradeCost = {
    "Chaos": 20,
    "Shock": 20,
    "Fire": 20,
    "Ice": 20
  };
  // Weakness multipliers (extra damage taken by enemy)
  const weaknessMultiplier = {
    "Chaos": 1.0,
    "Shock": 1.0,
    "Fire": 1.0,
    "Ice": 1.0
  };
  const passiveUpgradeCost = 50; // fixed cost for passive upgrade

  // --- Color Mapping for Enemy Element Types ---
  const elementColors = {
    "Chaos": "#800080", // purple
    "Shock": "#0000FF", // blue
    "Fire": "#FF0000",  // red
    "Ice": "#00FFFF"    // cyan
  };

  // --- Create and Append DOM Elements ---
  const gameContainer = document.getElementById("game-container");

  // Score Display
  const scoreDisplay = document.createElement("div");
  scoreDisplay.style.fontSize = "24px";
  scoreDisplay.style.marginBottom = "20px";
  scoreDisplay.style.color = "#FFFFFF";
  scoreDisplay.innerText = "Score: " + score;
  gameContainer.appendChild(scoreDisplay);

  // Enemy Display Container
  const enemyDisplay = document.createElement("div");
  enemyDisplay.style.marginBottom = "20px";
  gameContainer.appendChild(enemyDisplay);

  // Enemy HP Element
  const enemyHPElem = document.createElement("div");
  enemyHPElem.style.fontSize = "20px";
  enemyHPElem.style.color = "#FFFFFF";
  enemyDisplay.appendChild(enemyHPElem);

  // Enemy Type Element
  const enemyTypeElem = document.createElement("div");
  enemyTypeElem.style.fontSize = "20px";
  enemyTypeElem.style.marginBottom = "10px";
  enemyDisplay.appendChild(enemyTypeElem);

  // Damage Display Container
  // Contains two parts: currentDamageElem (animated) and previousDamageElem (gray, static)
  const damageContainer = document.createElement("div");
  damageContainer.style.fontSize = "18px";
  // We'll leave the container color to inherit (white for current, gray for previous)
  enemyDisplay.appendChild(damageContainer);

  const currentDamageElem = document.createElement("div");
  currentDamageElem.style.color = "#FFFFFF";
  currentDamageElem.style.transition = "transform 0.5s ease";
  damageContainer.appendChild(currentDamageElem);

  const previousDamageElem = document.createElement("div");
  previousDamageElem.style.color = "#AAAAAA"; // gray for previous damage
  damageContainer.appendChild(previousDamageElem);

  // Shop container for upgrade buttons
  const shopContainer = document.createElement("div");
  shopContainer.style.display = "flex";
  shopContainer.style.flexDirection = "column";
  shopContainer.style.gap = "10px";
  gameContainer.appendChild(shopContainer);

  // --- Create Element Upgrade Buttons ---
  const upgradeButtons = {};
  for (const element in elements) {
    const btn = document.createElement("button");
    btn.style.fontSize = "16px";
    btn.innerText = `Upgrade ${element} (Cost: ${elementUpgradeCost[element]})`;
    btn.addEventListener("click", function () {
      upgradeElement(element);
    });
    shopContainer.appendChild(btn);
    upgradeButtons[element] = btn;
  }

  // --- Create Passive Upgrade Button ---
  const passiveBtn = document.createElement("button");
  passiveBtn.style.fontSize = "16px";
  passiveBtn.innerText = `Passive Upgrade (+0.05 multiplier) (Cost: ${passiveUpgradeCost})`;
  passiveBtn.addEventListener("click", upgradePassive);
  shopContainer.appendChild(passiveBtn);

  // --- Update Score Every Second ---
  setInterval(() => {
    score += increment;
    scoreDisplay.innerText = "Score: " + score;
  }, 1000);

  // --- Attack Enemy Every 2 Seconds ---
  setInterval(() => {
    attackEnemy();
  }, 2000);

  // --- Function: Spawn a New Enemy ---
  function spawnEnemy() {
    enemyHP = 100;
    // Randomly pick an enemy elemental type
    const elementOptions = Object.keys(elements);
    enemyType = elementOptions[Math.floor(Math.random() * elementOptions.length)];
    enemyHPElem.innerText = `Enemy HP: ${enemyHP}`;
    enemyTypeElem.innerHTML = `Type: <span style="color: ${elementColors[enemyType]};">${enemyType}</span>`;
    // Clear damage displays on spawn
    currentDamageElem.innerText = "";
    previousDamageElem.innerText = "";
  }

  // --- Function: Attack the Enemy ---
  function attackEnemy() {
    // Calculate damage based on enemy type:
    let baseDamage = elements[enemyType] || 0;
    let bonusDamage = baseDamage * weaknessMultiplier[enemyType];
    let totalDamage = Math.floor(baseDamage + bonusDamage);

    enemyHP -= totalDamage;

    // Animate the damage display (if damage > 0)
    animateDamage(totalDamage);

    // Check if enemy is defeated
    if (enemyHP <= 0) {
      score += 100; // reward score
      spawnEnemy();
      return;
    }
    enemyHPElem.innerText = `Enemy HP: ${enemyHP}`;
  }

  // --- Function: Animate Damage Display ---
  function animateDamage(damage) {
    if (damage <= 0) return;
    
    // Set current damage text in white with brackets
    currentDamageElem.innerText = `(-${damage})`;
    // Reset transform for a fresh animation
    currentDamageElem.style.transform = "translateY(0)";
    // Force reflow (optional)
    void currentDamageElem.offsetWidth;
    // Trigger the animation: slide down 20px over 0.5 seconds
    currentDamageElem.style.transform = "translateY(20px)";
    
    // After animation completes, move current damage to previous damage display (in gray) and clear current
    setTimeout(() => {
      previousDamageElem.innerText = currentDamageElem.innerText;
      currentDamageElem.innerText = "";
      currentDamageElem.style.transform = "translateY(0)";
    }, 500);
  }

  // --- Function: Upgrade an Element's Damage ---
  function upgradeElement(element) {
    const cost = elementUpgradeCost[element];
    if (score >= cost) {
      score -= cost;
      elements[element] += 1;
      // Increase cost by 50% (rounded)
      elementUpgradeCost[element] = Math.floor(cost * 1.5);
      upgradeButtons[element].innerText = `Upgrade ${element} (Cost: ${elementUpgradeCost[element]})`;
      scoreDisplay.innerText = "Score: " + score;
      console.log(`${element} damage upgraded to ${elements[element]}!`);
    } else {
      alert("Not enough score for this upgrade!");
    }
  }

  // --- Function: Upgrade Passive Weakness Multiplier ---
  function upgradePassive() {
    if (score >= passiveUpgradeCost) {
      score -= passiveUpgradeCost;
      // Increase each weakness multiplier by 0.05
      for (const element in weaknessMultiplier) {
        weaknessMultiplier[element] += 0.05;
      }
      scoreDisplay.innerText = "Score: " + score;
      console.log("Passive upgrade purchased: All weakness multipliers increased by 0.05!");
    } else {
      alert("Not enough score for passive upgrade!");
    }
  }

  // --- Initialize the Game ---
  spawnEnemy();
  console.log("Game initialized. Ready to expand!");
});