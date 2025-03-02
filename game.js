document.addEventListener("DOMContentLoaded", function () {
  // Inject CSS for the flash animation.
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes flashAnimation {
      0% { color: #AAAAAA; }
      50% { color: #FFFFFF; }
      100% { color: #AAAAAA; }
    }
    .flash {
      animation: flashAnimation 1s ease;
    }
  `;
  document.head.appendChild(style);

  // --- Basic Game Variables ---
  let score = 0;
  let increment = 1;
  let enemyHP = 100.00;  // float value
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
  enemyDisplay.style.color = "#FFFFFF";
  enemyDisplay.style.fontSize = "20px";
  gameContainer.appendChild(enemyDisplay);

  // Container for Enemy HP and Damage (on the same line)
  const enemyInfo = document.createElement("div");
  enemyInfo.style.display = "inline-flex";
  enemyInfo.style.alignItems = "baseline";
  enemyDisplay.appendChild(enemyInfo);

  // Enemy HP Element (inline)
  const enemyHPElem = document.createElement("span");
  enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
  enemyInfo.appendChild(enemyHPElem);

  // Damage Display (inline, with margin-left for spacing)
  const damageDisplay = document.createElement("span");
  damageDisplay.style.marginLeft = "10px";
  damageDisplay.style.color = "#AAAAAA"; // initial gray
  // Set transition via CSS animation (the .flash class)
  enemyInfo.appendChild(damageDisplay);

  // Enemy Type Display (on a new line)
  const enemyTypeElem = document.createElement("div");
  enemyTypeElem.style.marginTop = "5px";
  enemyDisplay.appendChild(enemyTypeElem);

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
    enemyHP = 100.00;
    // Randomly pick an enemy elemental type
    const elementOptions = Object.keys(elements);
    enemyType = elementOptions[Math.floor(Math.random() * elementOptions.length)];
    enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
    enemyTypeElem.innerHTML = `Type: <span style="color: ${elementColors[enemyType]};">${enemyType}</span>`;
    // Clear damage display on spawn
    damageDisplay.innerText = "";
    damageDisplay.classList.remove("flash");
  }

  // --- Function: Attack the Enemy ---
  function attackEnemy() {
    let baseDamage = elements[enemyType] || 0;
    let bonusDamage = baseDamage * weaknessMultiplier[enemyType];
    // Calculate total damage as a decimal rounded to two places.
    let totalDamage = parseFloat((baseDamage + bonusDamage).toFixed(2));
    
    enemyHP -= totalDamage;
    animateDamage(totalDamage);

    if (enemyHP <= 0) {
      score += 100; // reward for defeating enemy
      spawnEnemy();
      return;
    }
    enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
  }

  // --- Function: Animate Damage Flash ---
  // Uses a CSS keyframe animation to smoothly flash the damage from gray to white and back.
  function animateDamage(newDamage) {
    // Set the damage text with two decimals in brackets.
    damageDisplay.innerText = `(-${newDamage.toFixed(2)})`;
    // Remove the flash class (to restart the animation)
    damageDisplay.classList.remove("flash");
    // Force reflow to reset the animation.
    void damageDisplay.offsetWidth;
    // Add the flash class to trigger the animation.
    damageDisplay.classList.add("flash");
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
    } else {
      alert("Not enough score for passive upgrade!");
    }
  }

  // --- Save Data as Cookies ---
  function saveGame() {
    document.cookie = "score=" + score + "; path=/";
    document.cookie = "enemyHP=" + enemyHP.toFixed(2) + "; path=/";
    console.log("Game saved in cookies.");
  }
  // Example: Save game every 10 seconds.
  setInterval(saveGame, 10000);

  // --- Initialize the Game ---
  spawnEnemy();
  console.log("Game initialized. Ready to expand!");
});