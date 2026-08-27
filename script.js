const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");
const keys = document.querySelector(".keys");

let currentValue = "0";
let previousValue = null;
let pendingOperator = null;
let freshInput = false;

const MAX_DIGITS = 12;

function updateDisplay() {
  currentEl.textContent = formatForDisplay(currentValue);
  historyEl.textContent = previousValue !== null && pendingOperator
    ? `${formatForDisplay(previousValue)} ${pendingOperator}`
    : "";

  document.querySelectorAll(".key-operator").forEach((btn) => {
    btn.classList.toggle("active", pendingOperator === btn.dataset.operator);
  });
}

function formatForDisplay(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "Error";
  if (!isFinite(number)) return "Error";

  const parts = String(value).split(".");
  const integerPart = Number(parts[0]).toLocaleString("en-US");
  return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
}

function inputDigit(digit) {
  if (freshInput || currentValue === "0") {
    currentValue = digit;
    freshInput = false;
  } else if (currentValue.replace(/[-.]/g, "").length < MAX_DIGITS) {
    currentValue += digit;
  }
}

function inputDecimal() {
  if (freshInput) {
    currentValue = "0.";
    freshInput = false;
    return;
  }
  if (!currentValue.includes(".")) {
    currentValue += ".";
  }
}

function clearAll() {
  currentValue = "0";
  previousValue = null;
  pendingOperator = null;
  freshInput = false;
}

function negate() {
  if (currentValue === "0") return;
  currentValue = currentValue.startsWith("-")
    ? currentValue.slice(1)
    : `-${currentValue}`;
}

function percent() {
  currentValue = String(Number(currentValue) / 100);
}

function compute(a, operator, b) {
  switch (operator) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function roundResult(value) {
  return Math.round((value + Number.EPSILON) * 1e10) / 1e10;
}

function setOperator(operator) {
  if (pendingOperator && previousValue !== null && !freshInput) {
    const result = compute(Number(previousValue), pendingOperator, Number(currentValue));
    previousValue = String(roundResult(result));
    currentValue = previousValue;
  } else {
    previousValue = currentValue;
  }
  pendingOperator = operator;
  freshInput = true;
}

function equals() {
  if (!pendingOperator || previousValue === null) return;
  const result = compute(Number(previousValue), pendingOperator, Number(currentValue));
  currentValue = String(roundResult(result));
  previousValue = null;
  pendingOperator = null;
  freshInput = true;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest(".key");
  if (!button) return;

  const { action, digit, operator } = button.dataset;

  switch (action) {
    case "digit":
      inputDigit(digit);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "clear":
      clearAll();
      break;
    case "negate":
      negate();
      break;
    case "percent":
      percent();
      break;
    case "operator":
      setOperator(operator);
      break;
    case "equals":
      equals();
      break;
  }

  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    const operatorMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    setOperator(operatorMap[key]);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    percent();
  } else {
    return;
  }

  updateDisplay();
});

updateDisplay();
