/* ============ ME GUSTA WORLD — script ============ */

// ---------- Lock screen clock ----------
function updateClock() {
  const now = new Date();
  let h = now.getHours() % 12;
  if (h === 0) h = 12;
  const m = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("lockClock").textContent = h + ":" + m;
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  document.getElementById("lockDate").textContent =
    days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate();
}
updateClock();
setInterval(updateClock, 15000);

// ---------- Slide to unlock ----------
const lock = document.getElementById("lock");
const site = document.getElementById("site");
const slider = document.getElementById("slider");
const thumb = document.getElementById("sliderThumb");

let dragging = false;
let startX = 0;
let unlocked = false;

function maxTravel() {
  return slider.querySelector(".lock__slider-track").offsetWidth - thumb.offsetWidth - 8;
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  lock.classList.add("unlocked");
  site.classList.add("revealed");
  setTimeout(() => lock.remove(), 800);
}

function onDown(e) {
  if (unlocked) return;
  dragging = true;
  startX = (e.touches ? e.touches[0].clientX : e.clientX) - (parseFloat(thumb.style.left) || 4);
  thumb.style.transition = "none";
}

function onMove(e) {
  if (!dragging || unlocked) return;
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
  const clamped = Math.max(4, Math.min(x, maxTravel()));
  thumb.style.left = clamped + "px";
  if (clamped >= maxTravel() - 2) unlock();
}

function onUp() {
  if (!dragging) return;
  dragging = false;
  if (!unlocked) {
    thumb.style.transition = "left .3s cubic-bezier(.34,1.56,.64,1)";
    thumb.style.left = "4px";
  }
}

thumb.addEventListener("mousedown", onDown);
thumb.addEventListener("touchstart", onDown, { passive: true });
window.addEventListener("mousemove", onMove);
window.addEventListener("touchmove", onMove, { passive: true });
window.addEventListener("mouseup", onUp);
window.addEventListener("touchend", onUp);

document.getElementById("lockSkip").addEventListener("click", unlock);

slider.setAttribute("tabindex", "0");
slider.setAttribute("role", "button");
slider.setAttribute("aria-label", "Slide to unlock");
slider.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlock(); }
});

// ---------- Starfield ----------
const starsBox = document.getElementById("stars");
for (let i = 0; i < 90; i++) {
  const s = document.createElement("i");
  s.style.left = Math.random() * 100 + "%";
  s.style.top = Math.random() * 100 + "%";
  const size = Math.random() < 0.15 ? 4 : Math.random() < 0.5 ? 3 : 2;
  s.style.width = s.style.height = size + "px";
  s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
  s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";
  starsBox.appendChild(s);
}

// ---------- Mobile nav ----------
const burger = document.getElementById("burger");
const nav = document.querySelector(".nav");
burger.addEventListener("click", () => nav.classList.toggle("open"));

// ---------- Panels ----------
let openedPanel = null;
let lastTrigger = null;

function openPanel(name, trigger) {
  const panel = document.getElementById("panel-" + name);
  if (!panel) return;
  closePanel();
  panel.classList.add("open");
  openedPanel = panel;
  lastTrigger = trigger || null;
  nav.classList.remove("open");
  const closeBtn = panel.querySelector(".panel__close");
  if (closeBtn) closeBtn.focus();
  if (name === "lab") renderMeme();
}

function closePanel() {
  if (!openedPanel) return;
  openedPanel.classList.remove("open");
  openedPanel = null;
  if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  lastTrigger = null;
}

document.querySelectorAll("[data-panel]").forEach((el) => {
  el.addEventListener("click", () => openPanel(el.dataset.panel, el));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPanel(el.dataset.panel, el);
    }
  });
});

document.querySelectorAll(".panel__close").forEach((btn) =>
  btn.addEventListener("click", closePanel)
);
document.querySelectorAll(".panel").forEach((panel) =>
  panel.addEventListener("click", (e) => {
    if (e.target === panel) closePanel();
  })
);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePanel();
});

// ---------- Meme Lab ----------
const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");
const topInput = document.getElementById("topText");
const bottomInput = document.getElementById("bottomText");

const face = new Image();
face.src = "Megusta.jpg";

function drawMemeText(text, y, baseline) {
  if (!text) return;
  let size = 52;
  const maxWidth = canvas.width - 40;
  do {
    ctx.font = size + 'px "Archivo Black", Impact, sans-serif';
    size -= 2;
  } while (size > 16 && ctx.measureText(text).width > maxWidth);
  ctx.textAlign = "center";
  ctx.textBaseline = baseline;
  ctx.lineWidth = 8;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillText(text, canvas.width / 2, y);
}

function renderMeme() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (face.complete && face.naturalWidth) {
    const s = Math.min(canvas.width, canvas.height) * 0.78;
    ctx.drawImage(face, (canvas.width - s) / 2, (canvas.height - s) / 2, s, s);
  }
  drawMemeText(topInput.value.toUpperCase(), 26, "top");
  drawMemeText(bottomInput.value.toUpperCase(), canvas.height - 26, "bottom");
}

face.onload = renderMeme;
topInput.addEventListener("input", renderMeme);
bottomInput.addEventListener("input", renderMeme);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderMeme);
renderMeme();

document.getElementById("downloadMeme").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "me-gusta-meme.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

const RANDOM_MEMES = [
  ["WHEN THE SHOWER WATER", "GETS IN YOUR EARS"],
  ["STEPPING ON", "CRUNCHY LEAVES"],
  ["PEELING GLUE", "OFF MY HANDS"],
  ["POPPING", "BUBBLE WRAP"],
  ["SMELL OF", "GASOLINE"],
  ["FRESHLY PRINTED", "PAPER WARMTH"],
  ["BITING", "ICE CREAM"],
  ["SOCKS STRAIGHT", "FROM THE DRYER"],
  ["CRACKING EVERY", "SINGLE KNUCKLE"],
  ["MONDAY?", "ME GUSTA"],
];

document.getElementById("randomMeme").addEventListener("click", () => {
  const pick = RANDOM_MEMES[Math.floor(Math.random() * RANDOM_MEMES.length)];
  topInput.value = pick[0];
  bottomInput.value = pick[1];
  renderMeme();
});
