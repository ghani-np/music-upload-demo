import { useState, useRef } from "react";

const GENRES = ["Pop","R&B / Soul","Hip-Hop","Rock","Jazz","Electronic","Folk","Dangdut","Keroncong","Indie","Alternative","Classical","Gospel / Rohani","Instrumental","Lainnya"];
const LANGUAGES = ["Bahasa Indonesia","English","Javanese","Sundanese","Balinese","Minang","Mandarin","Lainnya"];
const SONGWRITER_ROLES = ["Pencipta Lagu & Komponis (Lirik + Musik)","Pencipta Lagu (Lirik saja)","Komponis (Musik saja)"];

function emptyTrack(index) {
  return { title: "", artist: "", featuredArtist: "", audioFile: null, language: "", order: index + 1, songwriters: [{ name: "", role: "" }], isrc: "" };
}
function emptyRightsHolder() {
  return { name: "", email: "", percentage: "" };
}

// Steps — track order step only shown for EP/Album
function getSteps(type) {
  const base = [
    { id: 1, label: "Rilis" },
    { id: 2, label: "Lagu" },
  ];
  if (type === "ep" || type === "album") {
    base.push({ id: 3, label: "Urutan" });
  }
  base.push({ id: type === "single" ? 3 : 4, label: "Hak" });
  base.push({ id: type === "single" ? 4 : 5, label: "Konfirmasi" });
  return base;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F5F2EC;
    --surface: #FFFFFF;
    --surface2: #FAF8F4;
    --border: #E8E2D8;
    --border-focus: #C47B12;
    --amber: #C47B12;
    --amber-light: #FDF3E3;
    --amber-mid: rgba(196,123,18,0.12);
    --terra: #A8501E;
    --text: #1C1916;
    --text-muted: #7A7066;
    --text-light: #B0A89E;
    --success: #2D7A50;
    --success-light: #EBF5EF;
    --danger: #C0392B;
    --danger-light: #FDECEA;
    --warning: #C47B12;
    --warning-light: #FDF3E3;
    --font-display: 'Lora', serif;
    --font-body: 'DM Sans', sans-serif;
    --radius: 12px;
    --radius-sm: 8px;
    --shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }

  .app { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px)); }

  .app-header { width: 100%; background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 20px 0; position: sticky; top: 0; z-index: 50; box-shadow: var(--shadow-sm); }
  .header-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .brand-logo { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; }
  .brand-logo span { color: var(--amber); }
  .header-title { font-size: 13px; color: var(--text-muted); font-weight: 400; margin-left: auto; }

  .step-bar { display: flex; align-items: flex-start; gap: 0; width: 100%; }
  .step-item { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; padding-bottom: 12px; }
  .step-item::after { content: ''; position: absolute; top: 13px; left: 50%; right: -50%; height: 2px; background: var(--border); z-index: 0; }
  .step-item:last-child::after { display: none; }
  .step-item.done::after { background: var(--amber); }
  .step-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text-light); z-index: 1; transition: all 0.25s; position: relative; }
  .step-item.active .step-dot { border-color: var(--amber); background: var(--amber); color: #fff; }
  .step-item.done .step-dot { border-color: var(--success); background: var(--success); color: #fff; font-size: 12px; }
  .step-label { font-size: 10px; font-weight: 500; color: var(--text-light); margin-top: 5px; letter-spacing: 0.3px; }
  .step-item.active .step-label { color: var(--amber); font-weight: 600; }
  .step-item.done .step-label { color: var(--success); }

  .main { width: 100%; max-width: 480px; padding: 20px 16px 0; }

  .section-head { margin-bottom: 20px; }
  .section-number { font-size: 11px; font-weight: 600; color: var(--amber); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .section-title { font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--text); line-height: 1.2; margin-bottom: 6px; }
  .section-desc { font-size: 13px; color: var(--text-muted); font-weight: 400; line-height: 1.5; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 12px; box-shadow: var(--shadow-sm); }
  .card-title { font-size: 12px; font-weight: 600; color: var(--amber); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }

  .field { margin-bottom: 16px; }
  .field:last-child { margin-bottom: 0; }
  .field-label { display: block; font-size: 12px; font-weight: 600; color: var(--text); letter-spacing: 0.3px; margin-bottom: 7px; }
  .field-label .req { color: var(--amber); margin-left: 2px; }
  .field-label .opt { font-size: 10px; font-weight: 400; color: var(--text-light); margin-left: 6px; letter-spacing: 0; }
  .field-hint { font-size: 11px; color: var(--text-muted); margin-top: 5px; line-height: 1.4; }

  input[type="text"], input[type="email"], input[type="number"], input[type="date"], select, textarea {
    width: 100%; background: var(--surface2); border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text); font-family: var(--font-body);
    font-size: 16px; font-weight: 400; padding: 13px 14px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; appearance: none; -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
  input::placeholder, textarea::placeholder { color: var(--text-light); }
  input:focus, select:focus, textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(196,123,18,0.1); background: var(--surface); }
  select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7'%3E%3Cpath d='M0 0l6 7 6-7z' fill='%23C47B12' opacity='.7'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 40px; }
  select option { background: #fff; }
  textarea { resize: vertical; min-height: 80px; line-height: 1.5; }
  input[type="number"] { -moz-appearance: textfield; }
  input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }

  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .field-row .field { margin-bottom: 0; }

  .release-type-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 4px; }
  .rt-card { border: 2px solid var(--border); border-radius: var(--radius-sm); padding: 16px 10px; text-align: center; cursor: pointer; background: var(--surface2); transition: all 0.15s; -webkit-tap-highlight-color: transparent; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .rt-card:active { transform: scale(0.97); }
  .rt-card.selected { border-color: var(--amber); background: var(--amber-light); }
  .rt-icon { font-size: 22px; }
  .rt-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .rt-desc { font-size: 11px; color: var(--text-muted); }
  .rt-card.selected .rt-name { color: var(--amber); }

  .artwork-upload { border: 2px dashed var(--border); border-radius: var(--radius-sm); padding: 24px 16px; text-align: center; cursor: pointer; background: var(--surface2); transition: all 0.15s; -webkit-tap-highlight-color: transparent; }
  .artwork-upload:active { background: var(--amber-light); border-color: var(--amber); }
  .artwork-upload.has-art { border-style: solid; border-color: var(--success); background: var(--success-light); padding: 12px; }
  .artwork-preview-img { width: 100%; max-width: 180px; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); display: block; margin: 0 auto; }
  .artwork-icon { font-size: 32px; margin-bottom: 8px; }
  .artwork-label { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
  .artwork-sub { font-size: 12px; color: var(--text-muted); }
  .artwork-name { font-size: 13px; color: var(--success); font-weight: 500; margin-top: 8px; }

  .track-tabs-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 16px; padding-bottom: 4px; }
  .track-tabs { display: flex; gap: 8px; min-width: max-content; }
  .track-tab { padding: 8px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
  .track-tab.active { border-color: var(--amber); background: var(--amber-light); color: var(--amber); }
  .track-tab:active { transform: scale(0.96); }

  .audio-upload { border: 1.5px dashed var(--border); border-radius: var(--radius-sm); padding: 20px 16px; text-align: center; cursor: pointer; background: var(--surface2); transition: all 0.15s; -webkit-tap-highlight-color: transparent; }
  .audio-upload:active { background: var(--amber-light); border-color: var(--amber); }
  .audio-upload.has-file { border-style: solid; border-color: var(--success); background: var(--success-light); }
  .audio-icon { font-size: 24px; margin-bottom: 6px; display: block; }
  .audio-label { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
  .audio-sub { font-size: 11px; color: var(--text-muted); }
  .audio-filename { font-size: 13px; color: var(--success); font-weight: 500; }

  .songwriter-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; position: relative; }
  .songwriter-num { font-size: 10px; font-weight: 600; color: var(--amber); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .remove-sw { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 18px; color: var(--text-light); cursor: pointer; padding: 4px; line-height: 1; -webkit-tap-highlight-color: transparent; }
  .remove-sw:active { color: var(--danger); }
  .add-row-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border: 1.5px dashed var(--border); border-radius: var(--radius-sm); background: none; color: var(--text-muted); font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; }
  .add-row-btn:active { border-color: var(--amber); color: var(--amber); background: var(--amber-light); }

  /* ── DRAG & DROP TRACK ORDER ── */
  .order-list { display: flex; flex-direction: column; gap: 10px; }

  .order-item {
    display: flex; align-items: center; gap: 14px;
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); padding: 14px 16px;
    cursor: grab; user-select: none; touch-action: none;
    transition: box-shadow 0.15s, border-color 0.15s, opacity 0.15s, background 0.15s;
    position: relative;
  }
  .order-item:active { cursor: grabbing; }
  .order-item.dragging {
    opacity: 0.4; border-color: var(--amber);
    box-shadow: 0 8px 24px rgba(196,123,18,0.2);
  }
  .order-item.drag-over {
    border-color: var(--amber); background: var(--amber-light);
    box-shadow: 0 0 0 3px rgba(196,123,18,0.15);
  }

  .order-num {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--amber-light); border: 1.5px solid rgba(196,123,18,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: var(--amber);
    flex-shrink: 0; transition: all 0.2s;
  }
  .order-item.drag-over .order-num { background: var(--amber); color: #fff; border-color: var(--amber); }

  .order-info { flex: 1; min-width: 0; }
  .order-title { font-size: 15px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .order-artist { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .order-handle {
    display: flex; flex-direction: column; gap: 4px;
    padding: 4px; flex-shrink: 0; color: var(--text-light);
  }
  .order-handle span { display: block; width: 18px; height: 2px; background: currentColor; border-radius: 2px; }

  .order-hint {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-size: 12px; color: var(--text-muted); margin-bottom: 16px;
    padding: 10px; background: var(--amber-light);
    border-radius: var(--radius-sm); border: 1px solid rgba(196,123,18,0.2);
  }

  /* Touch drag ghost */
  .touch-ghost {
    position: fixed; pointer-events: none; z-index: 9999;
    background: var(--surface); border: 2px solid var(--amber);
    border-radius: var(--radius-sm); padding: 14px 16px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    display: flex; align-items: center; gap: 14px;
    opacity: 0.95; transform: rotate(1.5deg) scale(1.02);
    min-width: 280px; max-width: 360px;
  }

  .rights-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; position: relative; }
  .rights-num { font-size: 10px; font-weight: 600; color: var(--terra); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .pct-input-wrap { position: relative; }
  .pct-input-wrap input { padding-right: 36px; }
  .pct-symbol { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--text-muted); font-weight: 500; pointer-events: none; }

  .rights-total-bar { margin-bottom: 12px; }
  .rights-total-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
  .rights-total-num { font-weight: 600; }
  .rights-total-num.ok { color: var(--success); }
  .rights-total-num.warn { color: var(--danger); }
  .bar-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease, background 0.3s ease; }
  .bar-fill.ok { background: var(--success); }
  .bar-fill.warn { background: var(--danger); }
  .bar-fill.partial { background: var(--amber); }

  .track-rights-selector { display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; margin-bottom: 16px; }
  .trs-tab { padding: 8px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--surface2); color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; -webkit-tap-highlight-color: transparent; transition: all 0.15s; }
  .trs-tab.active { border-color: var(--terra); background: rgba(168,80,30,0.1); color: var(--terra); }
  .trs-tab.complete { border-color: var(--success); color: var(--success); background: var(--success-light); }

  .note { background: var(--warning-light); border: 1px solid rgba(196,123,18,0.25); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 12px; color: var(--text); line-height: 1.6; margin-bottom: 14px; display: flex; gap: 10px; }

  .check-row { display: flex; align-items: flex-start; gap: 14px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; -webkit-tap-highlight-color: transparent; }
  .check-row.checked { border-color: var(--success); background: var(--success-light); }
  .custom-cb { width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); background: var(--surface); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-top: 1px; }
  .check-row.checked .custom-cb { background: var(--success); border-color: var(--success); color: #fff; font-size: 12px; }
  .check-text { font-size: 14px; color: var(--text); line-height: 1.5; font-weight: 400; }

  .tnc-box { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; max-height: 160px; overflow-y: auto; font-size: 12px; color: var(--text-muted); line-height: 1.7; margin-bottom: 14px; }

  .review-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); gap: 12px; }
  .review-row:last-child { border-bottom: none; }
  .review-key { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
  .review-val { font-size: 13px; color: var(--text); text-align: right; font-weight: 500; word-break: break-word; }

  .success-screen { text-align: center; padding: 40px 20px 20px; }
  .success-emoji { font-size: 64px; display: block; margin-bottom: 16px; animation: pop 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes pop { 0%{transform:scale(0.4);opacity:0} 100%{transform:scale(1);opacity:1} }
  .success-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .success-sub { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; }

  .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)); display: flex; gap: 10px; justify-content: flex-end; z-index: 100; box-shadow: 0 -4px 16px rgba(0,0,0,0.06); }
  .btn-back { background: none; border: 1.5px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-family: var(--font-body); font-size: 14px; font-weight: 500; padding: 13px 22px; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; min-height: 48px; }
  .btn-back:active { border-color: var(--amber); color: var(--text); }
  .btn-next { background: var(--amber); border: none; border-radius: var(--radius-sm); color: #fff; font-family: var(--font-body); font-size: 14px; font-weight: 600; padding: 13px 28px; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; min-height: 48px; box-shadow: 0 2px 8px rgba(196,123,18,0.3); }
  .btn-next:active { background: #A8660E; transform: scale(0.98); }
  .btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-publish { background: var(--text); border: none; border-radius: var(--radius-sm); color: #fff; font-family: var(--font-body); font-size: 14px; font-weight: 600; padding: 13px 28px; cursor: pointer; transition: all 0.15s; -webkit-tap-highlight-color: transparent; min-height: 48px; }
  .btn-publish:active { background: #3A3530; transform: scale(0.98); }
  .btn-publish:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .subsection { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 1.5px; text-transform: uppercase; margin: 18px 0 12px; padding-top: 18px; border-top: 1px solid var(--border); }
  .subsection:first-child { border-top: none; padding-top: 0; margin-top: 0; }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
`;

function Field({ label, required, optional, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="req"> *</span>}
        {optional && <span className="opt">opsional</span>}
      </label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

// ── DRAG & DROP TRACK ORDER COMPONENT ──
function TrackOrderStep({ tracks, onReorder }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  // Touch drag state
  const touchRef = useRef({ startIndex: null, ghostEl: null, lastOver: null });

  // ── MOUSE/DESKTOP DRAG ──
  function onDragStart(e, i) {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
    // Transparent drag image — we rely on CSS opacity
    const ghost = document.createElement("div");
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }

  function onDragOver(e, i) {
    e.preventDefault();
    if (i !== dragIndex) setOverIndex(i);
  }

  function onDrop(e, i) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    reorder(dragIndex, i);
    setDragIndex(null);
    setOverIndex(null);
  }

  function onDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  // ── TOUCH / MOBILE DRAG ──
  function onTouchStart(e, i) {
    const t = e.touches[0];
    touchRef.current.startIndex = i;

    // Create ghost element
    const source = e.currentTarget;
    const rect = source.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "touch-ghost";
    ghost.innerHTML = `
      <div class="order-num">${i + 1}</div>
      <div class="order-info">
        <div class="order-title">${tracks[i].title || `Lagu ${i + 1}`}</div>
        <div class="order-artist">${tracks[i].artist || ""}</div>
      </div>
    `;
    ghost.style.width = rect.width + "px";
    ghost.style.left = t.clientX - rect.width / 2 + "px";
    ghost.style.top = t.clientY - rect.height / 2 + "px";
    document.body.appendChild(ghost);
    touchRef.current.ghostEl = ghost;

    setDragIndex(i);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    const { ghostEl } = touchRef.current;

    if (ghostEl) {
      ghostEl.style.left = t.clientX - ghostEl.offsetWidth / 2 + "px";
      ghostEl.style.top = t.clientY - ghostEl.offsetHeight / 2 + "px";
    }

    // Find which item we're hovering over
    const els = document.querySelectorAll(".order-item");
    let found = null;
    els.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (t.clientY >= rect.top && t.clientY <= rect.bottom) found = idx;
    });
    if (found !== null && found !== touchRef.current.startIndex) {
      setOverIndex(found);
      touchRef.current.lastOver = found;
    }
  }

  function onTouchEnd() {
    const { startIndex, ghostEl, lastOver } = touchRef.current;
    if (ghostEl) { ghostEl.remove(); touchRef.current.ghostEl = null; }
    if (startIndex !== null && lastOver !== null && startIndex !== lastOver) {
      reorder(startIndex, lastOver);
    }
    touchRef.current.startIndex = null;
    touchRef.current.lastOver = null;
    setDragIndex(null);
    setOverIndex(null);
  }

  function reorder(fromIndex, toIndex) {
    const updated = [...tracks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // Reassign order numbers
    const reordered = updated.map((t, i) => ({ ...t, order: i + 1 }));
    onReorder(reordered);
  }

  return (
    <div>
      <div className="order-hint">
        <span>☰</span>
        <span>Seret lagu untuk mengatur urutan. Lagu paling atas akan menjadi Track 1.</span>
      </div>

      <div className="order-list">
        {tracks.map((track, i) => (
          <div
            key={track.title + i}
            className={`order-item ${dragIndex === i ? "dragging" : ""} ${overIndex === i ? "drag-over" : ""}`}
            draggable
            onDragStart={e => onDragStart(e, i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={e => onDrop(e, i)}
            onDragEnd={onDragEnd}
            onTouchStart={e => onTouchStart(e, i)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="order-num">{i + 1}</div>
            <div className="order-info">
              <div className="order-title">{track.title || `Lagu ${i + 1} (belum ada judul)`}</div>
              {track.artist && <div className="order-artist">{track.artist}</div>}
            </div>
            <div className="order-handle">
              <span /><span /><span />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackForm({ track, onChange, index, total, artistName }) {
  const audioRef = useRef();
  const set = (k, v) => onChange({ ...track, [k]: v });
  const addSw = () => set("songwriters", [...track.songwriters, { name: "", role: "" }]);
  const removeSw = i => set("songwriters", track.songwriters.filter((_, idx) => idx !== i));
  const updateSw = (i, k, v) => { const sw = [...track.songwriters]; sw[i] = { ...sw[i], [k]: v }; set("songwriters", sw); };

  return (
    <div>
      <div className="card">
        <div className="subsection">Detail Lagu</div>
        <Field label="Judul Lagu / Track" required>
          <input type="text" placeholder="cth. Pulang ke Kotamu" value={track.title} onChange={e => set("title", e.target.value)} />
        </Field>
        <div className="field-row">
          <Field label="Track Artist" required>
            <input type="text" value={track.artist || artistName} onChange={e => set("artist", e.target.value)} placeholder={artistName} />
          </Field>
          <Field label="Featured Artist" optional>
            <input type="text" placeholder="cth. Raisa" value={track.featuredArtist} onChange={e => set("featuredArtist", e.target.value)} />
          </Field>
        </div>
        <Field label="Bahasa" required>
          <select value={track.language} onChange={e => set("language", e.target.value)}>
            <option value="">Pilih…</option>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="ISRC" optional hint="Kosongkan jika tidak punya — SoundCore akan assign otomatis">
          <input type="text" placeholder="cth. ID-SC1-26-00001" value={track.isrc} onChange={e => set("isrc", e.target.value)} />
        </Field>
      </div>

      <div className="card">
        <div className="subsection">File Audio</div>
        <div className={`audio-upload ${track.audioFile ? "has-file" : ""}`} onClick={() => audioRef.current.click()}>
          <span className="audio-icon">{track.audioFile ? "✓" : "♪"}</span>
          {track.audioFile
            ? <div className="audio-filename">{track.audioFile.name}</div>
            : <>
                <div className="audio-label">Upload file audio</div>
                <div className="audio-sub">WAV / FLAC / MP3 · Stereo · 44.1kHz</div>
              </>
          }
        </div>
        <input ref={audioRef} type="file" accept=".wav,.flac,.mp3,.aiff" style={{display:"none"}} onChange={e => { if(e.target.files[0]) set("audioFile", e.target.files[0]); }} />
      </div>

      <div className="card">
        <div className="subsection">Pencipta Lagu</div>
        {track.songwriters.map((sw, i) => (
          <div className="songwriter-card" key={i}>
            <div className="songwriter-num">Pencipta {i + 1}</div>
            {track.songwriters.length > 1 && <button className="remove-sw" onClick={() => removeSw(i)}>×</button>}
            <Field label="Nama Lengkap Legal" required>
              <input type="text" placeholder="cth. Baskara Putra" value={sw.name} onChange={e => updateSw(i, "name", e.target.value)} />
            </Field>
            <Field label="Peran" required>
              <select value={sw.role} onChange={e => updateSw(i, "role", e.target.value)}>
                <option value="">Pilih peran…</option>
                {SONGWRITER_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        ))}
        <button className="add-row-btn" onClick={addSw}>+ Tambah Pencipta Lagu</button>
      </div>
    </div>
  );
}

function RightsForm({ track, rights, onChangeRights }) {
  const total = rights.reduce((sum, r) => sum + (parseFloat(r.percentage) || 0), 0);
  const isOk = Math.abs(total - 100) < 0.01;
  const fillWidth = Math.min(100, total);
  const add = () => onChangeRights([...rights, emptyRightsHolder()]);
  const remove = i => onChangeRights(rights.filter((_, idx) => idx !== i));
  const update = (i, k, v) => { const r = [...rights]; r[i] = { ...r[i], [k]: v }; onChangeRights(r); };

  return (
    <div>
      <div className="rights-total-bar">
        <div className="rights-total-label">
          <span style={{fontSize:12,color:"var(--text-muted)"}}>Total hak dialokasikan</span>
          <span className={`rights-total-num ${isOk ? "ok" : total > 0 ? "warn" : ""}`}>
            {total.toFixed(total % 1 === 0 ? 0 : 1)}% / 100%
          </span>
        </div>
        <div className="bar-track">
          <div className={`bar-fill ${isOk ? "ok" : total > 100 ? "warn" : "partial"}`} style={{width:`${fillWidth}%`}} />
        </div>
        {total > 100 && <div style={{fontSize:11,color:"var(--danger)",marginTop:5}}>⚠ Melebihi 100% — kurangi persentase salah satu pihak</div>}
        {isOk && <div style={{fontSize:11,color:"var(--success)",marginTop:5}}>✓ Alokasi hak sudah lengkap</div>}
      </div>

      {rights.map((r, i) => (
        <div className="rights-card" key={i}>
          <div className="rights-num">Pemegang Hak {i + 1}</div>
          {rights.length > 1 && <button className="remove-sw" onClick={() => remove(i)}>×</button>}
          <Field label="Nama Lengkap Legal" required>
            <input type="text" placeholder="cth. Baskara Putra" value={r.name} onChange={e => update(i, "name", e.target.value)} />
          </Field>
          <Field label="Alamat Email" required>
            <input type="email" placeholder="cth. baskara@email.com" value={r.email} onChange={e => update(i, "email", e.target.value)} />
          </Field>
          <Field label="Persentase Hak" required>
            <div className="pct-input-wrap">
              <input type="number" min={1} max={100} step={0.1} placeholder="cth. 50" value={r.percentage} onChange={e => update(i, "percentage", e.target.value)} />
              <span className="pct-symbol">%</span>
            </div>
          </Field>
        </div>
      ))}
      <button className="add-row-btn" onClick={add}>+ Tambah Pemegang Hak</button>
    </div>
  );
}

export default function SoundCoreUpload() {
  const [step, setStep] = useState(1);
  const [activeTrack, setActiveTrack] = useState(0);
  const [activeRightsTrack, setActiveRightsTrack] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const artRef = useRef();

  const [rel, setRel] = useState({
    type: "", count: 2, title: "", artist: "",
    artwork: null, artworkPreview: null,
    genrePrimary: "", genreSecondary: "",
    originalDate: "", releaseDate: ""
  });
  const setR = (k, v) => setRel(r => ({ ...r, [k]: v }));

  const [tracks, setTracks] = useState([emptyTrack(0)]);
  const updateTrack = (i, updated) => { const t = [...tracks]; t[i] = updated; setTracks(t); };

  const [allRights, setAllRights] = useState([[emptyRightsHolder()]]);
  const updateRights = (i, r) => { const a = [...allRights]; a[i] = r; setAllRights(a); };

  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false });
  const toggleCheck = k => setChecks(c => ({ ...c, [k]: !c[k] }));

  const isMulti = rel.type === "ep" || rel.type === "album";

  // Step IDs: single = 1,2,3,4 / multi = 1,2,3(order),4,5
  const STEP_COUNT = isMulti ? 5 : 4;
  const ORDER_STEP = 3;   // always step 3 for multi
  const RIGHTS_STEP = isMulti ? 4 : 3;
  const CONFIRM_STEP = isMulti ? 5 : 4;

  const steps = getSteps(rel.type || "single");

  function applyType(type, count) {
    const n = type === "single" ? 1 : count;
    const newTracks = Array.from({ length: n }, (_, i) => tracks[i] ? { ...tracks[i], order: i+1 } : emptyTrack(i));
    const newRights = Array.from({ length: n }, (_, i) => allRights[i] || [emptyRightsHolder()]);
    setTracks(newTracks);
    setAllRights(newRights);
    setActiveTrack(0);
    setActiveRightsTrack(0);
  }

  function handleTypeSelect(type) {
    const count = type === "single" ? 1 : rel.count;
    setR("type", type);
    applyType(type, count);
  }

  function handleCountChange(val) {
    const min = rel.type === "ep" ? 2 : 7;
    const max = rel.type === "ep" ? 6 : 30;
    const n = Math.max(min, Math.min(max, parseInt(val) || min));
    setR("count", n);
    applyType(rel.type, n);
  }

  function handleReorder(reordered) {
    setTracks(reordered);
    // Keep allRights in sync with the new order
    const oldTitles = tracks.map(t => t.title + t.isrc);
    const newOrder = reordered.map(t => oldTitles.indexOf(t.title + t.isrc));
    setAllRights(newOrder.map(i => allRights[i] || [emptyRightsHolder()]));
  }

  const rightsTotal = i => allRights[i]?.reduce((s, r) => s + (parseFloat(r.percentage) || 0), 0) || 0;
  const rightsOk = i => Math.abs(rightsTotal(i) - 100) < 0.01;

  function goNext() { setStep(s => s + 1); setActiveTrack(0); setActiveRightsTrack(0); window.scrollTo(0,0); }
  function goBack() { setStep(s => s - 1); setActiveTrack(0); setActiveRightsTrack(0); window.scrollTo(0,0); }

  function reset() {
    setStep(1); setActiveTrack(0); setActiveRightsTrack(0); setSubmitted(false);
    setRel({ type:"", count:2, title:"", artist:"", artwork:null, artworkPreview:null, genrePrimary:"", genreSecondary:"", originalDate:"", releaseDate:"" });
    setTracks([emptyTrack(0)]);
    setAllRights([[emptyRightsHolder()]]);
    setChecks({ c1:false, c2:false, c3:false });
  }

  if (submitted) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div style={{width:"100%",maxWidth:480,padding:"20px 16px"}}>
            <div className="success-screen">
              <span className="success-emoji">🎵</span>
              <div className="success-title">Berhasil diupload!</div>
              <div className="success-sub">"{rel.type === "single" ? tracks[0].title || "Lagumu" : rel.title || "Rilisanmu"}" sedang diproses dan akan segera tersedia di SoundCore.</div>
              <div className="card" style={{textAlign:"left"}}>
                <div className="card-title">Urutan Track</div>
                {tracks.map((t, i) => (
                  <div className="review-row" key={i}>
                    <span className="review-key">Track {t.order}</span>
                    <span className="review-val">{t.title || "—"}</span>
                  </div>
                ))}
              </div>
              <button className="btn-publish" style={{width:"100%",marginTop:8}} onClick={reset}>Upload Rilis Lain</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">

        <div className="app-header">
          <div className="header-brand">
            <div className="brand-logo">Sound<span>Core</span></div>
            <div className="header-title">Upload Musik</div>
          </div>
          <div className="step-bar">
            {steps.map((s, idx) => (
              <div key={s.id} className={`step-item ${step === idx+1 ? "active" : step > idx+1 ? "done" : ""}`}>
                <div className="step-dot">{step > idx+1 ? "✓" : idx+1}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="main">

          {/* ── STEP 1: RELEASE ── */}
          {step === 1 && (
            <>
              <div className="section-head">
                <div className="section-number">Langkah 1</div>
                <div className="section-title">Info Rilis</div>
                <div className="section-desc">Mulai dengan memilih tipe rilis — ini menentukan berapa lagu yang perlu kamu isi.</div>
              </div>

              <div className="card">
                <div className="card-title">Tipe Rilis *</div>
                <div className="release-type-grid">
                  {[
                    { id:"single", icon:"♩", name:"Single", desc:"1 lagu" },
                    { id:"ep",     icon:"♫", name:"EP",     desc:"2–6 lagu" },
                    { id:"album",  icon:"◈", name:"Album",  desc:"7+ lagu" },
                  ].map(rt => (
                    <div key={rt.id} className={`rt-card ${rel.type===rt.id?"selected":""}`} onClick={() => handleTypeSelect(rt.id)}>
                      <span className="rt-icon">{rt.icon}</span>
                      <div className="rt-name">{rt.name}</div>
                      <div className="rt-desc">{rt.desc}</div>
                    </div>
                  ))}
                </div>

                {isMulti && (
                  <Field label={`Jumlah lagu dalam ${rel.type==="ep"?"EP":"album"} ini`} required hint={rel.type==="ep"?"Minimum 2, maksimum 6 lagu":"Minimum 7 lagu"}>
                    <input type="number" min={rel.type==="ep"?2:7} max={rel.type==="ep"?6:30} value={rel.count} onChange={e=>handleCountChange(e.target.value)} style={{maxWidth:100}} />
                  </Field>
                )}
              </div>

              {rel.type && (
                <>
                  <div className="card">
                    <div className="subsection">Info Artis</div>
                    {isMulti && (
                      <Field label="Judul Rilis" required>
                        <input type="text" placeholder={rel.type==="ep"?"cth. Sore Tugu Pancoran EP":"cth. Sore Tugu Pancoran"} value={rel.title} onChange={e=>setR("title",e.target.value)} />
                      </Field>
                    )}
                    <Field label="Nama Artis" required hint="Nama yang tampil di semua platform">
                      <input type="text" placeholder="cth. Hindia" value={rel.artist} onChange={e=>setR("artist",e.target.value)} />
                    </Field>
                    <div className="subsection">Genre</div>
                    <div className="field-row">
                      <Field label="Genre Utama" required>
                        <select value={rel.genrePrimary} onChange={e=>setR("genrePrimary",e.target.value)}>
                          <option value="">Pilih…</option>
                          {GENRES.map(g=><option key={g}>{g}</option>)}
                        </select>
                      </Field>
                      <Field label="Genre Sekunder" optional>
                        <select value={rel.genreSecondary} onChange={e=>setR("genreSecondary",e.target.value)}>
                          <option value="">Pilih…</option>
                          {GENRES.map(g=><option key={g}>{g}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="subsection">Tanggal</div>
                    <Field label="Tanggal Rilis di Platform" required hint="Kapan lagu ini live di SoundCore">
                      <input type="date" value={rel.releaseDate} onChange={e=>setR("releaseDate",e.target.value)} />
                    </Field>
                    <Field label="Tanggal Rilis Asli" optional hint="Hanya jika pernah dirilis di platform lain sebelumnya">
                      <input type="date" value={rel.originalDate} onChange={e=>setR("originalDate",e.target.value)} />
                    </Field>
                  </div>

                  <div className="card">
                    <div className="card-title">Cover Artwork *</div>
                    <div className={`artwork-upload ${rel.artworkPreview?"has-art":""}`} onClick={()=>artRef.current.click()}>
                      {rel.artworkPreview
                        ? <><img src={rel.artworkPreview} className="artwork-preview-img" alt="cover" /><div className="artwork-name">✓ {rel.artwork?.name}</div></>
                        : <><div className="artwork-icon">🖼</div><div className="artwork-label">Upload cover art</div><div className="artwork-sub">JPG atau PNG · min. 1600×1600px · Persegi</div></>
                      }
                    </div>
                    <input ref={artRef} type="file" accept="image/jpeg,image/png" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setR("artwork",f);setR("artworkPreview",URL.createObjectURL(f));}}} />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── STEP 2: SONG DETAILS ── */}
          {step === 2 && (
            <>
              <div className="section-head">
                <div className="section-number">Langkah 2</div>
                <div className="section-title">Detail Lagu</div>
                <div className="section-desc">
                  {tracks.length === 1 ? "Isi detail untuk lagumu." : `Isi detail untuk setiap lagu. Kamu punya ${tracks.length} lagu.`}
                </div>
              </div>

              {tracks.length > 1 && (
                <div className="track-tabs-wrap">
                  <div className="track-tabs">
                    {tracks.map((t, i) => (
                      <div key={i} className={`track-tab ${activeTrack===i?"active":""}`} onClick={()=>setActiveTrack(i)}>
                        {t.title?(t.title.length>14?t.title.slice(0,14)+"…":t.title):`Lagu ${i+1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <TrackForm
                track={tracks[activeTrack]}
                onChange={u=>updateTrack(activeTrack,u)}
                index={activeTrack}
                total={tracks.length}
                artistName={rel.artist}
              />

              {tracks.length > 1 && (
                <div style={{display:"flex",gap:10,marginTop:8,marginBottom:8}}>
                  {activeTrack>0 && <button className="btn-back" style={{flex:1}} onClick={()=>setActiveTrack(i=>i-1)}>← Lagu {activeTrack}</button>}
                  {activeTrack<tracks.length-1 && <button className="btn-next" style={{flex:2}} onClick={()=>setActiveTrack(i=>i+1)}>Lagu {activeTrack+2} →</button>}
                </div>
              )}
            </>
          )}

          {/* ── STEP 3: TRACK ORDER (EP/Album only) ── */}
          {step === ORDER_STEP && isMulti && (
            <>
              <div className="section-head">
                <div className="section-number">Langkah 3</div>
                <div className="section-title">Urutan Lagu</div>
                <div className="section-desc">Seret lagu untuk mengatur urutan sesuai yang kamu inginkan. Posisi teratas akan menjadi Track 1.</div>
              </div>

              <div className="card">
                <TrackOrderStep tracks={tracks} onReorder={handleReorder} />
              </div>
            </>
          )}

          {/* ── RIGHTS STEP ── */}
          {step === RIGHTS_STEP && (
            <>
              <div className="section-head">
                <div className="section-number">Langkah {RIGHTS_STEP}</div>
                <div className="section-title">Hak & Royalti</div>
                <div className="section-desc">Siapa saja yang memiliki hak atas lagu ini? Total persentase harus 100%.</div>
              </div>

              <div className="note">
                <span>ℹ</span>
                <span>Informasi ini digunakan untuk menghitung dan mendistribusikan royalti dari setiap stream.</span>
              </div>

              {tracks.length > 1 && (
                <div className="track-rights-selector">
                  {tracks.map((t, i) => (
                    <div key={i}
                      className={`trs-tab ${activeRightsTrack===i?"active":rightsOk(i)?"complete":""}`}
                      onClick={()=>setActiveRightsTrack(i)}>
                      {t.title?(t.title.length>12?t.title.slice(0,12)+"…":t.title):`Lagu ${i+1}`}
                      {rightsOk(i)&&" ✓"}
                    </div>
                  ))}
                </div>
              )}

              <div className="card">
                <div className="card-title">
                  {tracks.length>1
                    ? `Track ${tracks[activeRightsTrack].order} — ${tracks[activeRightsTrack].title||`Lagu ${activeRightsTrack+1}`}`
                    : "Pemegang Hak"
                  }
                </div>
                <RightsForm
                  track={tracks[activeRightsTrack]}
                  rights={allRights[activeRightsTrack]||[emptyRightsHolder()]}
                  onChangeRights={r=>updateRights(activeRightsTrack,r)}
                />
              </div>

              {tracks.length > 1 && (
                <div style={{display:"flex",gap:10,marginTop:8,marginBottom:8}}>
                  {activeRightsTrack>0 && <button className="btn-back" style={{flex:1}} onClick={()=>setActiveRightsTrack(i=>i-1)}>←</button>}
                  {activeRightsTrack<tracks.length-1 && <button className="btn-next" style={{flex:2}} onClick={()=>setActiveRightsTrack(i=>i+1)}>Lagu berikutnya →</button>}
                </div>
              )}
            </>
          )}

          {/* ── CONFIRM STEP ── */}
          {step === CONFIRM_STEP && (
            <>
              <div className="section-head">
                <div className="section-number">Langkah {CONFIRM_STEP}</div>
                <div className="section-title">Konfirmasi & Persetujuan</div>
                <div className="section-desc">Baca dan setujui pernyataan di bawah sebelum mempublikasikan.</div>
              </div>

              <div className="card">
                <div className="card-title">Syarat & Ketentuan</div>
                <div className="tnc-box">
                  <p style={{marginBottom:8,fontWeight:600,color:"var(--text)"}}>Perjanjian Distribusi SoundCore</p>
                  Dengan mengupload musik ke SoundCore, kamu menyetujui bahwa: (1) kamu memiliki atau mengontrol semua hak atas rekaman yang diupload, termasuk Hak Cipta dan Hak Terkait berdasarkan UU No. 28 Tahun 2014 tentang Hak Cipta; (2) SoundCore berwenang untuk mendistribusikan, melakukan streaming, dan melaporkan penggunaan lagu kepada LMKN sesuai PP No. 56/2021; (3) SoundCore akan memotong PPh 23 dari setiap pembayaran royalti sesuai ketentuan perpajakan Indonesia yang berlaku; (4) rekaman ini tidak mengandung sample yang belum mendapat clearance dari pemegang hak asli; (5) kamu bertanggung jawab penuh atas kebenaran semua informasi yang diinput; (6) SoundCore berhak menangguhkan distribusi jika ditemukan pelanggaran hak kekayaan intelektual pihak ketiga.
                </div>
                {[
                  ["c1","Saya adalah pemilik atau pemegang lisensi sah dari semua rekaman dalam rilis ini, dan memiliki hak penuh untuk mendistribusikannya secara komersial."],
                  ["c2","Rekaman ini tidak mengandung sample yang belum di-cleared. Saya memahami bahwa SoundCore akan melaporkan penggunaan ke LMKN dan memotong PPh 23 dari setiap pembayaran royalti."],
                  ["c3","Saya telah membaca, memahami, dan menyetujui Syarat & Ketentuan SoundCore di atas, termasuk seluruh ketentuan distribusi, royalti, dan hak kekayaan intelektual."],
                ].map(([key,text]) => (
                  <div key={key} className={`check-row ${checks[key]?"checked":""}`} onClick={()=>toggleCheck(key)}>
                    <div className="custom-cb">{checks[key]?"✓":""}</div>
                    <div className="check-text">{text}</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="card-title">Ringkasan</div>
                {[
                  ["Tipe", rel.type?.toUpperCase()||"—"],
                  ["Judul", rel.type==="single"?(tracks[0]?.title||"—"):(rel.title||"—")],
                  ["Artis", rel.artist||"—"],
                  ["Genre", rel.genrePrimary||"—"],
                  ["Jumlah Lagu", tracks.length],
                  ["Tanggal Rilis", rel.releaseDate||"—"],
                ].map(([k,v]) => (
                  <div className="review-row" key={k}>
                    <span className="review-key">{k}</span>
                    <span className="review-val">{v}</span>
                  </div>
                ))}
                {tracks.length > 1 && (
                  <>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",letterSpacing:"1.5px",textTransform:"uppercase",margin:"14px 0 8px",paddingTop:14,borderTop:"1px solid var(--border)"}}>Urutan Track</div>
                    {tracks.map((t,i) => (
                      <div className="review-row" key={i}>
                        <span className="review-key">Track {t.order}</span>
                        <span className="review-val">{t.title||"—"}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          <div style={{height:8}} />
        </div>

        {/* Bottom nav */}
        <div className="bottom-nav">
          {step > 1 && <button className="btn-back" onClick={goBack}>← Kembali</button>}
          {step < (isMulti ? 5 : 4) && (
            <button className="btn-next" disabled={step===1 && !rel.type} onClick={goNext}>
              Lanjut →
            </button>
          )}
          {step === (isMulti ? 5 : 4) && (
            <button className="btn-publish" disabled={!checks.c1||!checks.c2||!checks.c3} onClick={()=>setSubmitted(true)}>
              ✦ Publikasikan
            </button>
          )}
        </div>

      </div>
    </>
  );
}