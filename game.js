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
  // Weakness multipliers: extra damage taken by enemy
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

  // Damage Display – single element used for flashing effect
  const damageDisplay = document.createElement("div");
  damageDisplay.style.fontSize = "18px";
  damageDisplay.style.color = "#AAAAAA"; // initial gray
  enemyDisplay.appendChild(damageDisplay);

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

  // --- Update the Score Every Second ---
  setInterval(() => {
    score += increment;
    scoreDisplay.innerText = "Score: " + score;
  }, 1000);

  // --- Attack the Enemy Every 2 Seconds ---
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
    // Clear damage display on spawn
    damageDisplay.innerText = "";
  }

  // --- Function: Attack the Enemy ---
  function attackEnemy() {
    // Calculate damage based on enemy type:
    let baseDamage = elements[enemyType] || 0;
    let bonusDamage = baseDamage * weaknessMultiplier[enemyType];
    let totalDamage = Math.floor(baseDamage + bonusDamage);

    enemyHP -= totalDamage;
    animateDamage(totalDamage);

    if (enemyHP <= 0) {
      score += 100; // reward for defeating enemy
      spawnEnemy();
      return;
    }
    enemyHPElem.innerText = `Enemy HP: ${enemyHP}`;
  }

  // --- Function: Animate Damage Flash ---
  // This function will flash the damage number from gray to white and back.
  function animateDamage(newDamage) {
    // Set the damage text
    damageDisplay.innerText = `(-${newDamage})`;
    // Start with gray
    damageDisplay.style.color = "#AAAAAA";
    
    // After 200ms, change to white
    setTimeout(() => {
      damageDisplay.style.color = "#FFFFFF";
    }, 200);
    
    // After 800ms, change back to gray (or you can keep it white as needed)
    setTimeout(() => {
      damageDisplay.style.color = "#AAAAAA";
    }, 800);
  }

  // --- Function: Upgrade an Element's Damage ---
  function upgradeElement(element) {
    const cost = elementUpgradeCost[element];
    if (score >= cost) {
      score -= cost;
      elements[element] += 1;
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