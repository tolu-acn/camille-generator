// ─── STATE ──────────────────────────────────────────────────────────────
const state = {
  canvas: { width: 1920, height: 1080 },
  background: {
    colors: ['#d4956e', '#c46aa8', '#8b7bb8'],
    stops: [0, 0.48, 1],
    direction: 135,
    saturation: 100,
    brightness: 100,
    contrast: 100,
    blendSoftness: 48
  },
  glowFields: [
    { x: 0.15, y: 0.2, width: 0.5, height: 0.5, blur: 160, opacity: 0.45, color: '#e8a878', stretch: 1.2, smear: 0 },
    { x: 0.5, y: 0.5, width: 0.6, height: 0.55, blur: 140, opacity: 0.5, color: '#d070a8', stretch: 1, smear: 0 },
    { x: 0.85, y: 0.75, width: 0.45, height: 0.5, blur: 130, opacity: 0.4, color: '#9880b8', stretch: 1.1, smear: 0 }
  ],
  texture: { amount: 75, size: 1, contrast: 45, opacity: 42, colorMode: 'mono', softness: 0 },
  marks: [
    { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.8, rotation: 10, thickness: 5, roughness: 70, curvature: 30, zigzag: 25, wobble: 55, color: '#d87840', opacity: 55, strokes: 5 },
    { anchor: 'top-right', x: 0.92, y: 0.18, scale: 1.4, rotation: -15, thickness: 4, roughness: 75, curvature: 20, zigzag: 8, wobble: 35, color: '#d870a0', opacity: 50, strokes: 4 }
  ],
  composition: { focalX: 0.5, focalY: 0.45, vignette: 12, padding: 0, safeArea: false },
  locks: { background: false, glowFields: false, texture: false, marks: false },
  export: { width: 1920, height: 1080, format: 'png', quality: 92 }
};

let noiseImageData = null;
let needsNoiseRegen = true;
let rafId = null;
let dirty = true;

// ─── PRESETS ────────────────────────────────────────────────────────────
const presets = [
  // ── Reference-matched presets ─────────────────────────────────────────
  {
    name: 'Peach Lavender',
    // Based on ref image 1: warm peach top-left → pink center → cool lavender bottom-right
    background: { colors: ['#d4956e', '#c46aa8', '#8b7bb8'], stops: [0, 0.48, 1], direction: 135, saturation: 100, brightness: 100, contrast: 100, blendSoftness: 48 },
    glowFields: [
      { x: 0.15, y: 0.2, width: 0.5, height: 0.5, blur: 160, opacity: 0.45, color: '#e8a878', stretch: 1.2, smear: 0 },
      { x: 0.5, y: 0.5, width: 0.6, height: 0.55, blur: 140, opacity: 0.5, color: '#d070a8', stretch: 1, smear: 0 },
      { x: 0.85, y: 0.75, width: 0.45, height: 0.5, blur: 130, opacity: 0.4, color: '#9880b8', stretch: 1.1, smear: 0 }
    ],
    texture: { amount: 75, size: 1, contrast: 45, opacity: 42, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.8, rotation: 10, thickness: 5, roughness: 70, curvature: 30, zigzag: 25, wobble: 55, color: '#d87840', opacity: 55, strokes: 5 },
      { anchor: 'top-right', x: 0.92, y: 0.18, scale: 1.4, rotation: -15, thickness: 4, roughness: 75, curvature: 20, zigzag: 8, wobble: 35, color: '#d870a0', opacity: 50, strokes: 4 }
    ],
    composition: { focalX: 0.5, focalY: 0.45, vignette: 12, padding: 0, safeArea: false }
  },
  {
    name: 'Deep Violet',
    // Based on ref images 2 & 4: indigo/blue base with violet blooms, heavy grain
    background: { colors: ['#3a3878', '#7848a0', '#a060b0'], stops: [0, 0.5, 1], direction: 155, saturation: 100, brightness: 92, contrast: 108, blendSoftness: 50 },
    glowFields: [
      { x: 0.15, y: 0.15, width: 0.45, height: 0.5, blur: 170, opacity: 0.5, color: '#4848a0', stretch: 1.3, smear: 0 },
      { x: 0.4, y: 0.35, width: 0.55, height: 0.5, blur: 150, opacity: 0.55, color: '#9050c0', stretch: 1, smear: 0 },
      { x: 0.8, y: 0.55, width: 0.4, height: 0.45, blur: 120, opacity: 0.4, color: '#c068b0', stretch: 1.1, smear: 0 },
      { x: 0.85, y: 0.1, width: 0.3, height: 0.3, blur: 100, opacity: 0.3, color: '#9098b8', stretch: 1, smear: 0 }
    ],
    texture: { amount: 82, size: 1, contrast: 50, opacity: 48, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.6, rotation: 5, thickness: 4.5, roughness: 75, curvature: 45, zigzag: 15, wobble: 60, color: '#c8a0d8', opacity: 50, strokes: 5 },
      { anchor: 'top-right', x: 0.92, y: 0.18, scale: 1.2, rotation: -20, thickness: 4, roughness: 65, curvature: 35, zigzag: 20, wobble: 45, color: '#d08868', opacity: 45, strokes: 3 }
    ],
    composition: { focalX: 0.45, focalY: 0.45, vignette: 22, padding: 0, safeArea: false }
  },
  {
    name: 'Magenta Sunset',
    // Based on ref images 3 & 5: blue/indigo corner, hot pink bloom, warm orange/peach sweep
    background: { colors: ['#5040a0', '#c84898', '#d88860'], stops: [0, 0.45, 1], direction: 140, saturation: 105, brightness: 100, contrast: 102, blendSoftness: 45 },
    glowFields: [
      { x: 0.1, y: 0.1, width: 0.45, height: 0.45, blur: 160, opacity: 0.5, color: '#4850a8', stretch: 1.2, smear: 0 },
      { x: 0.3, y: 0.35, width: 0.55, height: 0.55, blur: 150, opacity: 0.6, color: '#d048a0', stretch: 1, smear: 0 },
      { x: 0.7, y: 0.5, width: 0.5, height: 0.5, blur: 140, opacity: 0.5, color: '#e09058', stretch: 1.1, smear: 0 },
      { x: 0.85, y: 0.2, width: 0.35, height: 0.3, blur: 110, opacity: 0.35, color: '#e8c890', stretch: 1, smear: 0 }
    ],
    texture: { amount: 78, size: 1, contrast: 48, opacity: 45, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-right', x: 0.92, y: 0.92, scale: 1.5, rotation: 15, thickness: 4.5, roughness: 72, curvature: 35, zigzag: 18, wobble: 55, color: '#e0d0c8', opacity: 50, strokes: 4 }
    ],
    composition: { focalX: 0.48, focalY: 0.42, vignette: 15, padding: 0, safeArea: false }
  },
  // ── Purple-free variations ─────────────────────────────────────────────
  {
    name: 'Terracotta',
    background: { colors: ['#c4856a', '#d4a078', '#b8a890'], stops: [0, 0.5, 1], direction: 150, saturation: 90, brightness: 100, contrast: 100, blendSoftness: 50 },
    glowFields: [
      { x: 0.2, y: 0.3, width: 0.5, height: 0.5, blur: 150, opacity: 0.5, color: '#d89870', stretch: 1.2, smear: 0 },
      { x: 0.7, y: 0.6, width: 0.45, height: 0.4, blur: 130, opacity: 0.4, color: '#c8a080', stretch: 1, smear: 0 },
      { x: 0.5, y: 0.15, width: 0.35, height: 0.3, blur: 110, opacity: 0.35, color: '#b0a898', stretch: 1.3, smear: 0 }
    ],
    texture: { amount: 72, size: 1, contrast: 44, opacity: 40, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.6, rotation: 5, thickness: 4.5, roughness: 70, curvature: 35, zigzag: 20, wobble: 50, color: '#a06040', opacity: 50, strokes: 4 },
      { anchor: 'top-right', x: 0.92, y: 0.18, scale: 1.2, rotation: -12, thickness: 3.5, roughness: 60, curvature: 40, zigzag: 15, wobble: 40, color: '#c8a880', opacity: 42, strokes: 3 }
    ],
    composition: { focalX: 0.5, focalY: 0.45, vignette: 18, padding: 0, safeArea: false }
  },
  {
    name: 'Seafoam',
    background: { colors: ['#4a8880', '#68a8a0', '#88b8b0'], stops: [0, 0.48, 1], direction: 130, saturation: 85, brightness: 100, contrast: 98, blendSoftness: 52 },
    glowFields: [
      { x: 0.3, y: 0.35, width: 0.5, height: 0.5, blur: 160, opacity: 0.5, color: '#50a098', stretch: 1, smear: 0 },
      { x: 0.7, y: 0.55, width: 0.45, height: 0.4, blur: 130, opacity: 0.4, color: '#78c0b0', stretch: 1.2, smear: 0 },
      { x: 0.15, y: 0.7, width: 0.35, height: 0.35, blur: 110, opacity: 0.35, color: '#408878', stretch: 1.1, smear: 0 }
    ],
    texture: { amount: 65, size: 1, contrast: 40, opacity: 38, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-right', x: 0.92, y: 0.92, scale: 1.5, rotation: 10, thickness: 4, roughness: 65, curvature: 38, zigzag: 18, wobble: 48, color: '#d0e8e0', opacity: 45, strokes: 4 },
      { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.3, rotation: 8, thickness: 3.5, roughness: 58, curvature: 42, zigzag: 14, wobble: 42, color: '#306858', opacity: 40, strokes: 3 }
    ],
    composition: { focalX: 0.5, focalY: 0.48, vignette: 14, padding: 0, safeArea: false }
  },
  {
    name: 'Burnt Gold',
    background: { colors: ['#c87838', '#d8a048', '#e8c870'], stops: [0, 0.5, 1], direction: 140, saturation: 100, brightness: 98, contrast: 105, blendSoftness: 48 },
    glowFields: [
      { x: 0.25, y: 0.3, width: 0.5, height: 0.5, blur: 150, opacity: 0.5, color: '#d09040', stretch: 1.2, smear: 0 },
      { x: 0.7, y: 0.5, width: 0.45, height: 0.45, blur: 140, opacity: 0.45, color: '#e0b858', stretch: 1, smear: 0 },
      { x: 0.4, y: 0.7, width: 0.4, height: 0.35, blur: 110, opacity: 0.35, color: '#b87030', stretch: 1.1, smear: 0 }
    ],
    texture: { amount: 80, size: 1.1, contrast: 50, opacity: 45, colorMode: 'mono', softness: 0 },
    marks: [
      { anchor: 'bottom-left', x: 0.03, y: 0.92, scale: 1.8, rotation: 5, thickness: 5, roughness: 75, curvature: 25, zigzag: 25, wobble: 58, color: '#a05820', opacity: 52, strokes: 5 },
      { anchor: 'top-right', x: 0.92, y: 0.18, scale: 1.4, rotation: -15, thickness: 4, roughness: 68, curvature: 30, zigzag: 20, wobble: 48, color: '#e8d090', opacity: 45, strokes: 3 }
    ],
    composition: { focalX: 0.48, focalY: 0.45, vignette: 22, padding: 0, safeArea: false }
  }
];

// ─── CANVAS SETUP ───────────────────────────────────────────────────────
const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d', { willReadFrequently: true });
let offscreen, offCtx;

function resizeCanvas() {
  const preview = document.querySelector('.preview');
  const pw = preview.clientWidth - 64;
  const ph = preview.clientHeight - 64;
  const ar = state.canvas.width / state.canvas.height;
  let w, h;
  if (pw / ph > ar) { h = ph; w = h * ar; }
  else { w = pw; h = w / ar; }
  mainCanvas.style.width = Math.round(w) + 'px';
  mainCanvas.style.height = Math.round(h) + 'px';
  mainCanvas.width = state.canvas.width;
  mainCanvas.height = state.canvas.height;
  offscreen = new OffscreenCanvas(state.canvas.width, state.canvas.height);
  offCtx = offscreen.getContext('2d');
  needsNoiseRegen = true;
  dirty = true;
}

// ─── RENDERING ──────────────────────────────────────────────────────────
function render() {
  const W = state.canvas.width, H = state.canvas.height;
  const c = offCtx;
  c.clearRect(0, 0, W, H);

  renderBackground(c, W, H);
  renderGlowFields(c, W, H);
  renderVignette(c, W, H);
  renderGrain(c, W, H);
  renderMarks(c, W, H);
  if (state.composition.safeArea) renderSafeArea(c, W, H);

  ctx.clearRect(0, 0, W, H);
  const sat = state.background.saturation;
  const bri = state.background.brightness;
  const con = state.background.contrast;
  ctx.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%)`;
  ctx.drawImage(offscreen, 0, 0);
  ctx.filter = 'none';

  renderMarks(ctx, W, H);
  if (state.composition.safeArea) renderSafeArea(ctx, W, H);
}

function renderBackground(c, W, H) {
  const bg = state.background;
  const rad = bg.direction * Math.PI / 180;
  const cx = W / 2, cy = H / 2;
  const len = Math.max(W, H);
  const x0 = cx - Math.cos(rad) * len / 2;
  const y0 = cy - Math.sin(rad) * len / 2;
  const x1 = cx + Math.cos(rad) * len / 2;
  const y1 = cy + Math.sin(rad) * len / 2;
  const grad = c.createLinearGradient(x0, y0, x1, y1);
  for (let i = 0; i < bg.colors.length; i++) {
    grad.addColorStop(bg.stops[i], bg.colors[i]);
  }
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
}

function renderGlowFields(c, W, H) {
  c.save();
  for (const gf of state.glowFields) {
    const gx = gf.x * W, gy = gf.y * H;
    const gw = gf.width * W, gh = gf.height * H;
    c.save();
    c.filter = `blur(${gf.blur}px)`;
    c.globalAlpha = gf.opacity;
    c.translate(gx, gy);
    c.scale(gf.stretch, 1);
    c.beginPath();
    c.ellipse(0, 0, gw / 2, gh / 2, 0, 0, Math.PI * 2);
    c.fillStyle = gf.color;
    c.fill();
    c.restore();
  }
  c.restore();
}

function renderVignette(c, W, H) {
  const v = state.composition.vignette / 100;
  if (v <= 0) return;
  const grad = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${v * 0.7})`);
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
}

function generateNoise(W, H) {
  const imageData = new ImageData(W, H);
  const d = imageData.data;
  const isMono = state.texture.colorMode === 'mono';
  for (let i = 0; i < d.length; i += 4) {
    if (isMono) {
      const v = Math.random() * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
    } else {
      d[i] = Math.random() * 255;
      d[i + 1] = Math.random() * 255;
      d[i + 2] = Math.random() * 255;
    }
    d[i + 3] = 255;
  }
  noiseImageData = imageData;
  needsNoiseRegen = false;
}

function renderGrain(c, W, H) {
  const t = state.texture;
  if (t.opacity <= 0 || t.amount <= 0) return;
  if (needsNoiseRegen || !noiseImageData || noiseImageData.width !== W || noiseImageData.height !== H) {
    generateNoise(W, H);
  }
  const tmpCanvas = new OffscreenCanvas(W, H);
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.putImageData(noiseImageData, 0, 0);

  c.save();
  c.globalAlpha = (t.opacity / 100) * (t.amount / 100);
  c.globalCompositeOperation = 'overlay';
  if (t.contrast > 50) {
    c.filter = `contrast(${100 + (t.contrast - 50) * 3}%)`;
  }
  c.drawImage(tmpCanvas, 0, 0);
  c.restore();
}

function renderMarks(c, W, H) {
  for (const mark of state.marks) {
    if (mark.opacity <= 0) continue;
    c.save();
    c.globalAlpha = mark.opacity / 100;
    const mx = mark.x * W, my = mark.y * H;
    c.translate(mx, my);
    c.rotate(mark.rotation * Math.PI / 180);
    c.scale(mark.scale, mark.scale);

    const seed = (mark.x * 1000 + mark.y * 777) | 0;
    const rng = mulberry32(seed);
    const strokeW = mark.thickness * 3; // wider, crayon-like

    for (let s = 0; s < mark.strokes; s++) {
      // Each stroke is a near-vertical diagonal scribble line
      const startX = (rng() - 0.5) * 40 + s * 22;
      const startY = (rng() - 0.5) * 20 - 60;
      const baseLen = mark.length || 150;
      const strokeLen = baseLen * 0.7 + rng() * baseLen * 0.6;
      // Slight angle variation per stroke
      const angle = (-75 + (rng() - 0.5) * 30) * Math.PI / 180;
      const endX = startX + Math.cos(angle) * strokeLen;
      const endY = startY + Math.sin(angle) * strokeLen;

      // Draw crayon texture: many small overlapping particles along the path
      const steps = Math.floor(strokeLen * 1.5);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const cx = startX + (endX - startX) * t;
        const cy = startY + (endY - startY) * t;

        // Scatter particles across the stroke width to simulate crayon coverage
        const particles = 6 + Math.floor(mark.roughness / 15);
        for (let p = 0; p < particles; p++) {
          // Skip some particles for gritty, broken coverage
          if (rng() < 0.35) continue;

          const offsetX = (rng() - 0.5) * strokeW;
          const offsetY = (rng() - 0.5) * strokeW * 0.5;
          const px = cx + offsetX + (rng() - 0.5) * 2;
          const py = cy + offsetY + (rng() - 0.5) * 2;
          const size = 0.5 + rng() * 2;
          const alpha = 0.15 + rng() * 0.55;

          c.globalAlpha = (mark.opacity / 100) * alpha;
          c.fillStyle = mark.color;
          c.fillRect(px, py, size, size);
        }
      }

      // Add a few larger gritty chunks along the edges for that waxy feel
      const chunks = 8 + Math.floor(rng() * 8);
      for (let i = 0; i < chunks; i++) {
        const t = rng();
        const cx = startX + (endX - startX) * t;
        const cy = startY + (endY - startY) * t;
        const side = rng() > 0.5 ? 1 : -1;
        const edgeX = cx + side * (strokeW * 0.5 + rng() * 3);
        const edgeY = cy + (rng() - 0.5) * 4;
        const size = 1 + rng() * 2.5;
        c.globalAlpha = (mark.opacity / 100) * (0.2 + rng() * 0.4);
        c.fillStyle = mark.color;
        c.fillRect(edgeX, edgeY, size, size);
      }
    }
    c.restore();
  }
}

function renderSafeArea(c, W, H) {
  c.save();
  c.strokeStyle = 'rgba(255,255,255,0.15)';
  c.lineWidth = 1;
  c.setLineDash([8, 6]);
  const tx = W * 0.1, ty = H * 0.1, tw = W * 0.8, th = H * 0.8;
  c.strokeRect(tx, ty, tw, th);
  c.strokeStyle = 'rgba(255,255,255,0.08)';
  const ax = W * 0.05, ay = H * 0.05, aw = W * 0.9, ah = H * 0.9;
  c.strokeRect(ax, ay, aw, ah);
  c.setLineDash([]);
  c.restore();
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// ─── RENDER LOOP ────────────────────────────────────────────────────────
function scheduleRender() {
  dirty = true;
}

function renderLoop() {
  if (dirty) {
    dirty = false;
    render();
  }
  rafId = requestAnimationFrame(renderLoop);
}

// ─── UI BUILDERS ────────────────────────────────────────────────────────
function slider(label, value, min, max, step, onChange) {
  const ctrl = document.createElement('div');
  ctrl.className = 'control';
  const row = document.createElement('div');
  row.className = 'control-row';
  const lbl = document.createElement('span');
  lbl.className = 'control-label';
  lbl.textContent = label;
  const val = document.createElement('span');
  val.className = 'control-value';
  val.textContent = Number(value).toFixed(step < 1 ? 1 : 0);
  row.append(lbl, val);
  const inp = document.createElement('input');
  inp.type = 'range';
  inp.min = min;
  inp.max = max;
  inp.step = step;
  inp.value = value;
  inp.addEventListener('input', () => {
    val.textContent = Number(inp.value).toFixed(step < 1 ? 1 : 0);
    onChange(parseFloat(inp.value));
    scheduleRender();
  });
  ctrl.append(row, inp);
  ctrl._input = inp;
  ctrl._val = val;
  return ctrl;
}

function colorPicker(label, value, onChange) {
  const ctrl = document.createElement('div');
  ctrl.className = 'control-row';
  const lbl = document.createElement('span');
  lbl.className = 'control-label';
  lbl.textContent = label;
  const wrap = document.createElement('div');
  wrap.className = 'color-input-wrap';
  const inp = document.createElement('input');
  inp.type = 'color';
  inp.value = value;
  inp.addEventListener('input', () => { onChange(inp.value); scheduleRender(); });
  wrap.appendChild(inp);
  ctrl.append(lbl, wrap);
  ctrl._input = inp;
  return ctrl;
}

function selectInput(label, options, value, onChange) {
  const ctrl = document.createElement('div');
  ctrl.className = 'control-row';
  const lbl = document.createElement('span');
  lbl.className = 'control-label';
  lbl.textContent = label;
  const sel = document.createElement('select');
  for (const [v, t] of options) {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = t;
    if (v === value) opt.selected = true;
    sel.appendChild(opt);
  }
  sel.addEventListener('change', () => { onChange(sel.value); scheduleRender(); });
  ctrl.append(lbl, sel);
  return ctrl;
}

function checkbox(label, checked, onChange) {
  const ctrl = document.createElement('label');
  ctrl.className = 'checkbox-row';
  const inp = document.createElement('input');
  inp.type = 'checkbox';
  inp.checked = checked;
  inp.addEventListener('change', () => { onChange(inp.checked); scheduleRender(); });
  const span = document.createElement('span');
  span.textContent = label;
  ctrl.append(inp, span);
  return ctrl;
}

function divider() {
  const d = document.createElement('div');
  d.className = 'divider';
  return d;
}

function lockRow(label, key) {
  const row = document.createElement('div');
  row.className = 'lock-row';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  const tog = document.createElement('div');
  tog.className = 'lock-toggle' + (state.locks[key] ? ' active' : '');
  tog.addEventListener('click', () => {
    state.locks[key] = !state.locks[key];
    tog.classList.toggle('active');
  });
  row.append(lbl, tog);
  return row;
}

// ─── BUILD CONTROLS ─────────────────────────────────────────────────────
function buildPresets() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = '';
  presets.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.addEventListener('click', () => applyPreset(i));
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 160; miniCanvas.height = 100;
    card.appendChild(miniCanvas);
    const name = document.createElement('div');
    name.className = 'preset-name';
    name.textContent = p.name;
    card.appendChild(name);
    grid.appendChild(card);
    renderMiniPreset(miniCanvas, p);
  });
}

function renderMiniPreset(canvas, preset) {
  const c = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const bg = preset.background;
  const rad = bg.direction * Math.PI / 180;
  const cx = W/2, cy = H/2, len = Math.max(W,H);
  const grad = c.createLinearGradient(
    cx - Math.cos(rad)*len/2, cy - Math.sin(rad)*len/2,
    cx + Math.cos(rad)*len/2, cy + Math.sin(rad)*len/2
  );
  bg.colors.forEach((col, i) => grad.addColorStop(bg.stops[i], col));
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
  for (const gf of preset.glowFields) {
    c.save();
    c.filter = `blur(${gf.blur * W / 1920}px)`;
    c.globalAlpha = gf.opacity;
    c.beginPath();
    c.ellipse(gf.x*W, gf.y*H, gf.width*W/2, gf.height*H/2, 0, 0, Math.PI*2);
    c.fillStyle = gf.color;
    c.fill();
    c.restore();
  }
}

// ── Simplified controls (~12 key options) ───────────────────────────────

function buildBackgroundControls() {
  const el = document.getElementById('bgControls');
  el.innerHTML = '';
  const bg = state.background;
  // 3 color pickers in a compact row
  el.appendChild(colorPicker('Left', bg.colors[0], v => { bg.colors[0] = v; }));
  el.appendChild(colorPicker('Mid', bg.colors[1], v => { bg.colors[1] = v; }));
  el.appendChild(colorPicker('Right', bg.colors[2], v => { bg.colors[2] = v; }));
  el.appendChild(slider('Direction', bg.direction, 0, 360, 1, v => { bg.direction = v; }));
}

function buildGlowControls() {
  const el = document.getElementById('glowControls');
  el.innerHTML = '';
  state.glowFields.forEach((gf, i) => {
    const item = document.createElement('div');
    item.className = 'field-item';
    const header = document.createElement('div');
    header.className = 'field-header';
    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = `Field ${i + 1}`;
    const remove = document.createElement('span');
    remove.className = 'field-remove';
    remove.textContent = '✕';
    remove.addEventListener('click', () => { state.glowFields.splice(i, 1); buildGlowControls(); scheduleRender(); });
    header.append(label, remove);
    item.appendChild(header);
    item.appendChild(colorPicker('Color', gf.color, v => { gf.color = v; }));
    item.appendChild(slider('Position X', gf.x * 100, 0, 100, 1, v => { gf.x = v / 100; }));
    item.appendChild(slider('Position Y', gf.y * 100, 0, 100, 1, v => { gf.y = v / 100; }));
    item.appendChild(slider('Size', Math.round((gf.width + gf.height) / 2 * 100), 5, 100, 1, v => { gf.width = v / 100; gf.height = v / 100; }));
    item.appendChild(slider('Softness', gf.blur, 10, 300, 1, v => { gf.blur = v; }));
    el.appendChild(item);
  });
  if (state.glowFields.length < 5) {
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm';
    addBtn.textContent = '+ Add glow field';
    addBtn.addEventListener('click', () => {
      state.glowFields.push({ x: 0.5, y: 0.5, width: 0.3, height: 0.3, blur: 100, opacity: 0.4, color: '#e88888', stretch: 1, smear: 0 });
      buildGlowControls();
      scheduleRender();
    });
    el.appendChild(addBtn);
  }
}

function buildTextureControls() {
  const el = document.getElementById('textureControls');
  el.innerHTML = '';
  const t = state.texture;
  el.appendChild(slider('Grain', t.amount, 0, 100, 1, v => { t.amount = v; t.opacity = Math.round(v * 0.55); }));
}

function buildMarkControls() {
  const el = document.getElementById('markControls');
  el.innerHTML = '';
  state.marks.forEach((mk, i) => {
    const item = document.createElement('div');
    item.className = 'mark-item';
    const header = document.createElement('div');
    header.className = 'field-header';
    const label = document.createElement('span');
    label.className = 'field-label';
    label.textContent = `Mark ${i + 1}`;
    const remove = document.createElement('span');
    remove.className = 'field-remove';
    remove.textContent = '✕';
    remove.addEventListener('click', () => { state.marks.splice(i, 1); buildMarkControls(); scheduleRender(); });
    header.append(label, remove);
    item.appendChild(header);
    item.appendChild(selectInput('Anchor', [
      ['bottom-left','Bottom Left'],['top-right','Top Right'],['bottom-right','Bottom Right'],['free','Free']
    ], mk.anchor, v => { mk.anchor = v; setAnchorPos(mk); buildMarkControls(); scheduleRender(); }));
    item.appendChild(colorPicker('Color', mk.color, v => { mk.color = v; }));
    item.appendChild(slider('X', mk.x * 100, -20, 120, 1, v => { mk.x = v / 100; }));
    item.appendChild(slider('Y', mk.y * 100, -20, 120, 1, v => { mk.y = v / 100; }));
    item.appendChild(slider('Length', mk.length || 150, 40, 300, 1, v => { mk.length = v; }));
    const intensity = Math.round((mk.roughness + mk.wobble + mk.zigzag) / 3);
    item.appendChild(slider('Intensity', intensity, 0, 100, 1, v => {
      mk.roughness = v; mk.wobble = Math.round(v * 0.85); mk.zigzag = Math.round(v * 0.5);
    }));
    item.appendChild(slider('Opacity', mk.opacity, 0, 100, 1, v => { mk.opacity = v; }));
    el.appendChild(item);
  });
  if (state.marks.length < 5) {
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-sm';
    addBtn.textContent = '+ Add mark group';
    addBtn.addEventListener('click', () => {
      state.marks.push({ anchor: 'bottom-right', x: 0.92, y: 0.92, scale: 1.5, rotation: 0, thickness: 4, roughness: 60, curvature: 40, zigzag: 20, wobble: 45, color: '#ffffff', opacity: 45, strokes: 4, length: 150 });
      buildMarkControls();
      scheduleRender();
    });
    el.appendChild(addBtn);
  }
}

function setAnchorPos(mk) {
  const anchors = { 'bottom-left': [0.03, 0.92], 'top-right': [0.92, 0.18], 'bottom-right': [0.92, 0.92], 'free': [0.5, 0.5] };
  const [x, y] = anchors[mk.anchor] || [0.5, 0.5];
  mk.x = x; mk.y = y;
}

function buildCompositionControls() {
  const el = document.getElementById('compControls');
  el.innerHTML = '';
  const comp = state.composition;
  el.appendChild(slider('Vignette', comp.vignette, 0, 100, 1, v => { comp.vignette = v; }));
  el.appendChild(checkbox('Safe area guides', comp.safeArea, v => { comp.safeArea = v; }));
}

function buildRandomizeControls() {
  const el = document.getElementById('randControls');
  el.innerHTML = '';
  // Lock toggles only — shuffle buttons are in the footer
  el.appendChild(lockRow('Lock background', 'background'));
  el.appendChild(lockRow('Lock glow fields', 'glowFields'));
  el.appendChild(lockRow('Lock texture', 'texture'));
  el.appendChild(lockRow('Lock marks', 'marks'));
}

function buildExportControls() {
  const el = document.getElementById('exportControls');
  el.innerHTML = '';
  const ex = state.export;
  el.appendChild(selectInput('Size', [
    ['1920x1080','1920 × 1080'],['1600x900','1600 × 900'],['2560x1440','2560 × 1440']
  ], `${ex.width}x${ex.height}`, v => {
    const [w, h] = v.split('x').map(Number);
    ex.width = w; ex.height = h;
    state.canvas.width = w; state.canvas.height = h;
    document.getElementById('dimLabel').textContent = `${w} × ${h}`;
    resizeCanvas();
  }));
  el.appendChild(selectInput('Format', [['png','PNG'],['jpeg','JPG'],['webp','WebP']], ex.format, v => { ex.format = v; }));
}

// ─── RANDOMIZE ──────────────────────────────────────────────────────────
function randomizeAll() {
  if (!state.locks.background) randomizeLayer('background');
  if (!state.locks.glowFields) randomizeLayer('glowFields');
  if (!state.locks.texture) randomizeLayer('texture');
  if (!state.locks.marks) randomizeLayer('marks');
  rebuildAllControls();
  scheduleRender();
}

function randomizeLayer(layer) {
  if (state.locks[layer]) return;
  const rh = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0');
  const rf = (min, max) => min + Math.random() * (max - min);

  if (layer === 'background') {
    state.background.colors = [rh(), rh(), rh()];
    state.background.direction = Math.floor(rf(0, 360));
    state.background.blendSoftness = Math.floor(rf(30, 70));
    state.background.stops[1] = 0.3 + state.background.blendSoftness / 100 * 0.4;
  } else if (layer === 'glowFields') {
    const count = Math.floor(rf(2, 5));
    state.glowFields = [];
    for (let i = 0; i < count; i++) {
      state.glowFields.push({
        x: rf(0.15, 0.85), y: rf(0.15, 0.85),
        width: rf(0.2, 0.6), height: rf(0.2, 0.5),
        blur: Math.floor(rf(60, 180)), opacity: rf(0.2, 0.6),
        color: rh(), stretch: rf(0.6, 1.8), smear: 0
      });
    }
  } else if (layer === 'texture') {
    state.texture.amount = Math.floor(rf(30, 90));
    state.texture.contrast = Math.floor(rf(20, 70));
    state.texture.opacity = Math.floor(rf(15, 55));
    needsNoiseRegen = true;
  } else if (layer === 'marks') {
    const anchors = ['bottom-left', 'top-right', 'bottom-right'];
    const count = Math.floor(rf(2, 4));
    state.marks = [];
    for (let i = 0; i < count; i++) {
      const anchor = anchors[i % anchors.length];
      const mk = {
        anchor, x: 0, y: 0, scale: rf(0.5, 1.5), rotation: rf(-40, 40),
        thickness: rf(1.5, 5), roughness: Math.floor(rf(30, 80)),
        curvature: Math.floor(rf(20, 70)), zigzag: Math.floor(rf(5, 40)),
        wobble: Math.floor(rf(20, 70)), color: Math.random() > 0.5 ? '#ffffff' : rh(),
        opacity: Math.floor(rf(12, 35)), strokes: Math.floor(rf(2, 6))
      };
      setAnchorPos(mk);
      state.marks.push(mk);
    }
  }
  rebuildAllControls();
  scheduleRender();
}

// ─── PRESETS ────────────────────────────────────────────────────────────
function applyPreset(index) {
  const p = presets[index];
  if (!state.locks.background) state.background = JSON.parse(JSON.stringify(p.background));
  if (!state.locks.glowFields) state.glowFields = JSON.parse(JSON.stringify(p.glowFields));
  if (!state.locks.texture) state.texture = JSON.parse(JSON.stringify(p.texture));
  if (!state.locks.marks) state.marks = JSON.parse(JSON.stringify(p.marks));
  state.composition = JSON.parse(JSON.stringify(p.composition));
  needsNoiseRegen = true;
  rebuildAllControls();
  scheduleRender();
  document.querySelectorAll('.preset-card').forEach((c, i) => c.classList.toggle('active', i === index));
}

// ─── EXPORT ─────────────────────────────────────────────────────────────
function exportImage() {
  const origW = state.canvas.width, origH = state.canvas.height;
  state.canvas.width = state.export.width;
  state.canvas.height = state.export.height;
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.export.width;
  exportCanvas.height = state.export.height;
  const exportCtx = exportCanvas.getContext('2d');

  const tempOff = new OffscreenCanvas(state.export.width, state.export.height);
  const tempOffCtx = tempOff.getContext('2d');

  const savedSafeArea = state.composition.safeArea;
  state.composition.safeArea = false;

  renderBackground(tempOffCtx, state.export.width, state.export.height);
  renderGlowFields(tempOffCtx, state.export.width, state.export.height);
  renderVignette(tempOffCtx, state.export.width, state.export.height);

  const noiseCanvas = new OffscreenCanvas(state.export.width, state.export.height);
  const noiseCtx = noiseCanvas.getContext('2d');
  const noiseData = new ImageData(state.export.width, state.export.height);
  const d = noiseData.data;
  const isMono = state.texture.colorMode === 'mono';
  for (let i = 0; i < d.length; i += 4) {
    if (isMono) { const v = Math.random()*255; d[i]=d[i+1]=d[i+2]=v; }
    else { d[i]=Math.random()*255; d[i+1]=Math.random()*255; d[i+2]=Math.random()*255; }
    d[i+3] = 255;
  }
  noiseCtx.putImageData(noiseData, 0, 0);
  const t = state.texture;
  if (t.opacity > 0 && t.amount > 0) {
    tempOffCtx.save();
    tempOffCtx.globalAlpha = (t.opacity/100)*(t.amount/100);
    tempOffCtx.globalCompositeOperation = 'overlay';
    if (t.contrast > 50) tempOffCtx.filter = `contrast(${100+(t.contrast-50)*3}%)`;
    tempOffCtx.drawImage(noiseCanvas, 0, 0);
    tempOffCtx.restore();
  }

  const sat = state.background.saturation;
  const bri = state.background.brightness;
  const con = state.background.contrast;
  exportCtx.filter = `saturate(${sat}%) brightness(${bri}%) contrast(${con}%)`;
  exportCtx.drawImage(tempOff, 0, 0);
  exportCtx.filter = 'none';

  renderMarks(exportCtx, state.export.width, state.export.height);

  state.composition.safeArea = savedSafeArea;
  state.canvas.width = origW;
  state.canvas.height = origH;

  const fmt = state.export.format;
  const mimeType = fmt === 'png' ? 'image/png' : fmt === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const quality = state.export.quality / 100;
  exportCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camille-bg.${fmt === 'jpeg' ? 'jpg' : fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  }, mimeType, quality);

  needsNoiseRegen = true;
  resizeCanvas();
}

// ─── SECTION TOGGLE ─────────────────────────────────────────────────────
function toggleSection(header) {
  header.closest('.section').classList.toggle('collapsed');
}

// ─── INIT ───────────────────────────────────────────────────────────────
function rebuildAllControls() {
  buildBackgroundControls();
  buildGlowControls();
  buildTextureControls();
  buildMarkControls();
  buildCompositionControls();
  buildRandomizeControls();
  buildExportControls();
}

function init() {
  resizeCanvas();
  buildPresets();
  rebuildAllControls();
  scheduleRender();
  renderLoop();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('dimLabel').textContent = `${state.canvas.width} × ${state.canvas.height}`;
}

init();
