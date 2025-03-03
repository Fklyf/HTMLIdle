document.addEventListener("DOMContentLoaded", function () {
  // Inject CSS for a smooth flash animation.
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

  // Damage Display (inline, with margin-left)
  const damageDisplay = document.createElement("span");
  damageDisplay.style.marginLeft = "10px";
  damageDisplay.style.color = "#AAAAAA"; // initial gray
  enemyInfo.appendChild(damageDisplay);

  // Enemy Type Display (on a new line)
  const enemyTypeElem = document.createElement("div");
  enemyTypeElem.style.marginTop = "5px";
  enemyDisplay.appendChild(enemyTypeElem);

  // Shop container for upgrade buttons and controls
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

  // --- Create Copy State Button ---
  const copyButton = document.createElement("button");
  copyButton.style.fontSize = "16px";
  copyButton.innerText = "Copy State to Clipboard";
  copyButton.addEventListener("click", copyStateToClipboard);
  shopContainer.appendChild(copyButton);

  // --- Create Input Field and Button for Loading from a String ---
  const stateInput = document.createElement("input");
  stateInput.type = "text";
  stateInput.placeholder = "Paste state string here";
  stateInput.style.fontSize = "16px";
  shopContainer.appendChild(stateInput);

  const loadStringButton = document.createElement("button");
  loadStringButton.style.fontSize = "16px";
  loadStringButton.innerText = "Load Game (From String)";
  loadStringButton.addEventListener("click", function () {
    loadGameStateFromString(stateInput.value);
  });
  shopContainer.appendChild(loadStringButton);

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
    const elementOptions = Object.keys(elements);
    enemyType = elementOptions[Math.floor(Math.random() * elementOptions.length)];
    enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
    enemyTypeElem.innerHTML = `Type: <span style="color: ${elementColors[enemyType]};">${enemyType}</span>`;
    damageDisplay.innerText = "";
    damageDisplay.classList.remove("flash");
  }

  // --- Function: Attack the Enemy ---
  function attackEnemy() {
    let baseDamage = elements[enemyType] || 0;
    let bonusDamage = baseDamage * weaknessMultiplier[enemyType];
    let totalDamage = parseFloat((baseDamage + bonusDamage).toFixed(2));
    
    enemyHP -= totalDamage;
    animateDamage(totalDamage);

    if (enemyHP <= 0) {
      score += 100;
      spawnEnemy();
      return;
    }
    enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
  }

  // --- Function: Animate Damage Flash ---
  function animateDamage(newDamage) {
    damageDisplay.innerText = `(-${newDamage.toFixed(2)})`;
    damageDisplay.classList.remove("flash");
    void damageDisplay.offsetWidth;
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

  // --- Function: Get a Complete Game State String ---
  // This function returns a compact string including all game details.
  function getStateString() {
    return "hp" + enemyHP.toFixed(2) +
           "score" + score +
           "enemy" + enemyType +
           "chaos" + elements.Chaos +
           "shock" + elements.Shock +
           "fire" + elements.Fire +
           "ice" + elements.Ice +
           "uCostChaos" + elementUpgradeCost.Chaos +
           "uCostShock" + elementUpgradeCost.Shock +
           "uCostFire" + elementUpgradeCost.Fire +
           "uCostIce" + elementUpgradeCost.Ice +
           "weakChaos" + weaknessMultiplier.Chaos.toFixed(2) +
           "weakShock" + weaknessMultiplier.Shock.toFixed(2) +
           "weakFire" + weaknessMultiplier.Fire.toFixed(2) +
           "weakIce" + weaknessMultiplier.Ice.toFixed(2);
  }

  // --- Function: Copy State String to Clipboard ---
  function copyStateToClipboard() {
    const stateString = getStateString();
    navigator.clipboard.writeText(stateString)
      .then(() => { console.log("Copied state: " + stateString); })
      .catch(err => { console.error("Copy failed: ", err); });
  }

  // --- Function: Load Game State from a String ---
  // Expects a string formatted as:
  // "hp{enemyHP}score{score}enemy{enemyType}chaos{chaos}shock{shock}fire{fire}ice{ice}uCostChaos{...}uCostShock{...}uCostFire{...}uCostIce{...}weakChaos{...}weakShock{...}weakFire{...}weakIce{...}"
  function loadGameStateFromString(stateString) {
    const enemyHPMatch = stateString.match(/hp([\d.]+)/);
    const scoreMatch = stateString.match(/score(\d+)/);
    const enemyMatch = stateString.match(/enemy(\w+)/);
    const chaosMatch = stateString.match(/chaos(\d+)/);
    const shockMatch = stateString.match(/shock(\d+)/);
    const fireMatch = stateString.match(/fire(\d+)/);
    const iceMatch = stateString.match(/ice(\d+)/);
    const uCostChaosMatch = stateString.match(/uCostChaos(\d+)/);
    const uCostShockMatch = stateString.match(/uCostShock(\d+)/);
    const uCostFireMatch = stateString.match(/uCostFire(\d+)/);
    const uCostIceMatch = stateString.match(/uCostIce(\d+)/);
    const weakChaosMatch = stateString.match(/weakChaos([\d.]+)/);
    const weakShockMatch = stateString.match(/weakShock([\d.]+)/);
    const weakFireMatch = stateString.match(/weakFire([\d.]+)/);
    const weakIceMatch = stateString.match(/weakIce([\d.]+)/);

    if (enemyHPMatch && scoreMatch && enemyMatch && chaosMatch && shockMatch &&
        fireMatch && iceMatch && uCostChaosMatch && uCostShockMatch &&
        uCostFireMatch && uCostIceMatch && weakChaosMatch && weakShockMatch &&
        weakFireMatch && weakIceMatch) {

      enemyHP = parseFloat(enemyHPMatch[1]);
      score = parseInt(scoreMatch[1]);
      enemyType = enemyMatch[1];
      elements.Chaos = parseInt(chaosMatch[1]);
      elements.Shock = parseInt(shockMatch[1]);
      elements.Fire = parseInt(fireMatch[1]);
      elements.Ice = parseInt(iceMatch[1]);
      elementUpgradeCost.Chaos = parseInt(uCostChaosMatch[1]);
      elementUpgradeCost.Shock = parseInt(uCostShockMatch[1]);
      elementUpgradeCost.Fire = parseInt(uCostFireMatch[1]);
      elementUpgradeCost.Ice = parseInt(uCostIceMatch[1]);
      weaknessMultiplier.Chaos = parseFloat(weakChaosMatch[1]);
      weaknessMultiplier.Shock = parseFloat(weakShockMatch[1]);
      weaknessMultiplier.Fire = parseFloat(weakFireMatch[1]);
      weaknessMultiplier.Ice = parseFloat(weakIceMatch[1]);

      // Update UI elements.
      scoreDisplay.innerText = "Score: " + score;
      enemyHPElem.innerText = `Enemy HP: ${enemyHP.toFixed(2)}`;
      enemyTypeElem.innerHTML = `Type: <span style="color: ${elementColors[enemyType]};">${enemyType}</span>`;

      // Update upgrade buttons.
      for (const element in upgradeButtons) {
        upgradeButtons[element].innerText = `Upgrade ${element} (Cost: ${elementUpgradeCost[element]})`;
      }

      console.log("Game state loaded from string!");
    } else {
      alert("Invalid game state string!");
    }
  }

  // --- Initialize the Game ---
  spawnEnemy();
  console.log("Game initialized. Ready to expand!");
});
