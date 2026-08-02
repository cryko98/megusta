/* ============ ME GUSTA WORLD — script ============ */

// ---------- Live market cap ----------
// Ide írd be a token contract address-t (CA) — amíg üres, az MCAP chip rejtve marad.
const TOKEN_CA = "";

function formatMcap(v) {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "K";
  return "$" + Math.round(v);
}

async function updateMcap() {
  if (!TOKEN_CA) return;
  try {
    const resp = await fetch("https://api.dexscreener.com/latest/dex/tokens/" + TOKEN_CA);
    const data = await resp.json();
    const pairs = (data.pairs || []).filter((p) => p.marketCap || p.fdv);
    if (!pairs.length) return;
    pairs.sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0));
    const best = pairs[0];
    const chip = document.getElementById("mcapChip");
    document.getElementById("mcapValue").textContent = formatMcap(best.marketCap || best.fdv);
    if (best.url) chip.href = best.url;
    const lp = document.getElementById("listPrice");
    if (lp && best.priceUsd) lp.textContent = "$" + Number(best.priceUsd).toPrecision(4);
    const lm = document.getElementById("listMcap");
    if (lm) lm.textContent = formatMcap(best.marketCap || best.fdv);
  } catch { /* keep last value */ }
}

const mcapChip = document.getElementById("mcapChip");
const caChip = document.getElementById("caChip");
const caValue = document.getElementById("caValue");

function flashValue(el, text) {
  const old = el.textContent;
  el.textContent = text;
  setTimeout(() => { el.textContent = old; }, 1400);
}

mcapChip.addEventListener("click", (e) => {
  if (!TOKEN_CA) {
    e.preventDefault();
    flashValue(document.getElementById("mcapValue"), "SOON™");
  }
});

caChip.addEventListener("click", () => {
  if (!TOKEN_CA) {
    flashValue(caValue, "SOON™");
    return;
  }
  navigator.clipboard.writeText(TOKEN_CA).then(
    () => flashValue(caValue, "COPIED!"),
    () => flashValue(caValue, TOKEN_CA.slice(0, 8) + "…")
  );
});

if (TOKEN_CA) {
  caValue.textContent = TOKEN_CA.slice(0, 4) + "…" + TOKEN_CA.slice(-4);
}
updateMcap();
setInterval(updateMcap, 60000);

// ---------- Boot screen ----------
const boot = document.getElementById("boot");
window.addEventListener("load", () => {
  setTimeout(() => {
    boot.classList.add("gone");
    setTimeout(() => boot.remove(), 700);
  }, 2000);
});
// fallback if load never fires
setTimeout(() => {
  if (document.getElementById("boot")) {
    boot.classList.add("gone");
    setTimeout(() => boot.remove(), 700);
  }
}, 4500);

// ---------- Slide to unlock ----------
const site = document.getElementById("site");
const bar = document.getElementById("unlockbar");
const thumb = document.getElementById("unlockThumb");

let dragging = false;
let startX = 0;
let unlocked = false;

function maxTravel() {
  return bar.offsetWidth - thumb.offsetWidth - 14;
}

function unlock() {
  if (unlocked) return;
  unlocked = true;
  site.classList.remove("locked");
  bar.classList.add("gone");
  setTimeout(() => bar.remove(), 600);
}

function onDown(e) {
  if (unlocked) return;
  dragging = true;
  startX = (e.touches ? e.touches[0].clientX : e.clientX) - (parseFloat(thumb.style.left) || 7);
  thumb.style.transition = "none";
}

function onMove(e) {
  if (!dragging || unlocked) return;
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
  const clamped = Math.max(7, Math.min(x, maxTravel()));
  thumb.style.left = clamped + "px";
  if (clamped >= maxTravel() - 2) unlock();
}

function onUp() {
  if (!dragging) return;
  dragging = false;
  if (!unlocked) {
    thumb.style.transition = "left .3s cubic-bezier(.34,1.56,.64,1)";
    thumb.style.left = "7px";
  }
}

thumb.addEventListener("mousedown", onDown);
thumb.addEventListener("touchstart", onDown, { passive: true });
window.addEventListener("mousemove", onMove);
window.addEventListener("touchmove", onMove, { passive: true });
window.addEventListener("mouseup", onUp);
window.addEventListener("touchend", onUp);

bar.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); unlock(); }
});

// ---------- Face image on the background planet ----------
// troll.png (white background art) is inked onto the globe; falls back to the
// drawn face if the file is missing.
const PLANET_FACE_SRC = "troll.png";
(() => {
  const img = document.getElementById("planetFaceImg");
  const wrap = document.getElementById("planetFace");
  const drawn = document.getElementById("planetFaceDrawn");
  if (!img || !wrap || !drawn) return;
  const probe = new Image();
  probe.onload = () => {
    img.setAttribute("href", PLANET_FACE_SRC);
    wrap.style.display = "";
    drawn.style.display = "none";
  };
  probe.onerror = () => wrap.remove();
  probe.src = PLANET_FACE_SRC;
})();

// ---------- Starfield ----------
const starsBox = document.getElementById("stars");
for (let i = 0; i < 38; i++) {
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

// ---------- Mood blast ----------
document.querySelectorAll(".mood").forEach((mood) => {
  mood.addEventListener("click", () => {
    const img = mood.querySelector("img");
    const caption = mood.querySelector("figcaption").textContent;
    const blast = document.createElement("div");
    blast.className = "moodblast";
    const rays = document.createElement("div");
    rays.className = "moodblast__rays";
    const face = img.cloneNode();
    face.classList.add("moodblast__face");
    const cap = document.createElement("div");
    cap.className = "moodblast__cap";
    cap.textContent = caption;
    const hint = document.createElement("div");
    hint.className = "moodblast__hint";
    hint.textContent = "click to close";
    blast.append(rays, face, cap, hint);
    const kill = () => blast.remove();
    blast.addEventListener("click", kill);
    setTimeout(kill, 6000);
    document.body.appendChild(blast);
  });
});

// ---------- Meme Lab ----------
const canvas = document.getElementById("memeCanvas");
const ctx = canvas.getContext("2d");
const topInput = document.getElementById("topText");
const bottomInput = document.getElementById("bottomText");

const face = new Image();
face.src = "megustalogo.png";

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
    const x = (canvas.width - s) / 2;
    const y = (canvas.height - s) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, s / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(face, x, y, s, s);
    ctx.restore();
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
