import os

css = """
/* ── Login Page ─────────────────────────────────────── */
.login-overlay { position:fixed;inset:0;background:#0f172a;z-index:10000;display:flex;align-items:center;justify-content:center;animation:fadeIn .4s ease; }
.login-card { background:rgba(30,41,59,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;width:min(480px,90vw);box-shadow:0 32px 80px rgba(0,0,0,0.6);animation:slideUp .5s cubic-bezier(.22,1,.36,1); }
.login-logo { text-align:center;margin-bottom:28px; }
.login-globe { font-size:4rem;display:block;margin-bottom:8px;animation:spin 8s linear infinite; }
@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
.login-title { font-size:2rem;font-weight:800;color:#f8fafc;margin-bottom:4px; }
.login-subtitle { color:#94a3b8;font-size:0.95rem; }
.avatar-section { margin-bottom:24px; }
.avatar-label { color:#94a3b8;font-size:0.85rem;margin-bottom:10px;text-align:center; }
.avatar-grid { display:grid;grid-template-columns:repeat(6,1fr);gap:8px;justify-items:center; }
.avatar-btn { background:rgba(15,23,42,0.6);border:2px solid transparent;border-radius:12px;cursor:pointer;font-size:1.6rem;padding:8px;transition:all .2s;width:100%;aspect-ratio:1; }
.avatar-btn:hover { background:rgba(59,130,246,0.2);border-color:rgba(59,130,246,0.5); }
.avatar-btn.selected { background:rgba(255,87,34,0.2);border-color:#ff5722;transform:scale(1.1); }
.login-form { display:flex;flex-direction:column;gap:16px;margin-bottom:24px; }
.input-group label { display:block;color:#94a3b8;font-size:0.85rem;margin-bottom:6px; }
.input-group input { width:100%;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#f8fafc;font-size:1rem;padding:10px 14px;outline:none;transition:border-color .2s; }
.input-group input:focus { border-color:#ff5722; }
.login-btn { width:100%;background:linear-gradient(135deg,#ff5722,#f59e0b);border:none;border-radius:12px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-size:1.05rem;font-weight:700;padding:14px;transition:all .2s; }
.login-btn:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,87,34,0.4); }
.login-note { color:#475569;font-size:0.78rem;text-align:center;margin-top:12px; }
/* ── Profile View ──────────────────────────────────── */
.profile-overlay { position:fixed;inset:0;background:#0f172a;z-index:9999;display:flex;flex-direction:column;overflow:hidden; }
.profile-topbar { display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0; }
.profile-back-btn { background:rgba(255,255,255,0.08);border:none;border-radius:10px;color:#94a3b8;cursor:pointer;font-size:0.9rem;padding:8px 16px;transition:all .2s; }
.profile-back-btn:hover { background:rgba(255,255,255,0.15);color:#f8fafc; }
.profile-tabs { display:flex;gap:4px;background:rgba(15,23,42,0.6);border-radius:12px;padding:4px; }
.ptab { background:transparent;border:none;border-radius:9px;color:#94a3b8;cursor:pointer;font-size:0.9rem;padding:8px 20px;transition:all .2s; }
.ptab.active { background:rgba(255,87,34,0.2);color:#ff5722;font-weight:600; }
.profile-content { flex:1;overflow-y:auto;padding:24px; }
.profile-main { max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:24px; }
.profile-card { background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;position:relative; }
.profile-card-label { position:absolute;top:16px;right:16px;background:rgba(255,87,34,0.2);border:1px solid rgba(255,87,34,0.3);border-radius:8px;color:#ff5722;font-size:0.75rem;font-weight:600;padding:4px 10px; }
.profile-header { display:flex;align-items:center;gap:20px;margin-bottom:20px; }
.profile-avatar { font-size:3.5rem;line-height:1; }
.profile-username { font-size:1.6rem;font-weight:700;color:#f8fafc; }
.profile-bio { color:#94a3b8;font-size:0.9rem;margin-top:4px; }
.profile-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px; }
.pstat { background:rgba(15,23,42,0.6);border-radius:12px;padding:14px 10px;text-align:center; }
.pstat-num { display:block;font-size:1.5rem;font-weight:800;line-height:1; }
.pstat-lbl { display:block;color:#94a3b8;font-size:0.75rem;margin-top:4px; }
.profile-badges { display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px; }
.badge-icon { cursor:default;display:inline-block;font-size:1.5rem; }
.minimap-container { background:rgba(15,23,42,0.8);border-radius:12px;height:150px;overflow:hidden; }
.share-section { background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px; }
.share-section h3 { color:#f8fafc;font-size:1.1rem;margin-bottom:8px; }
.share-section p { color:#94a3b8;font-size:0.85rem;margin-bottom:16px; }
.share-code-row { display:flex;gap:10px; }
.share-code-input { background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#64748b;flex:1;font-family:monospace;font-size:0.8rem;padding:10px 14px;outline:none; }
.share-copy-btn { background:rgba(255,87,34,0.2);border:1px solid rgba(255,87,34,0.4);border-radius:10px;color:#ff5722;cursor:pointer;font-size:0.9rem;font-weight:600;padding:10px 18px;transition:all .2s;white-space:nowrap; }
.share-copy-btn:hover { background:rgba(255,87,34,0.35); }
/* Achievements */
.achievements-view { max-width:900px;margin:0 auto; }
.ach-header { align-items:center;display:flex;flex-direction:column;gap:8px;margin-bottom:32px; }
.ach-progress-bar-wrap { background:rgba(255,255,255,0.08);border-radius:99px;height:8px;overflow:hidden;width:100%;max-width:400px; }
.ach-progress-bar { background:linear-gradient(90deg,#ff5722,#f59e0b);border-radius:99px;height:100%;transition:width .6s ease; }
.ach-progress-text { color:#94a3b8;font-size:0.9rem; }
.ach-category { margin-bottom:32px; }
.ach-cat-title { font-size:1.1rem;font-weight:700;margin-bottom:16px; }
.ach-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px; }
.ach-card { background:rgba(30,41,59,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 14px;position:relative;text-align:center;transition:all .2s; }
.ach-card.earned { border-color:rgba(255,87,34,0.3);background:rgba(255,87,34,0.08); }
.ach-card.locked { opacity:0.45; }
.ach-icon { font-size:2rem;margin-bottom:8px; }
.ach-name { color:#f8fafc;font-size:0.85rem;font-weight:600;margin-bottom:4px; }
.ach-desc { color:#64748b;font-size:0.75rem;line-height:1.4; }
.ach-check { background:#10b981;border-radius:99px;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 6px;position:absolute;top:10px;right:10px; }
.ach-lock { font-size:0.8rem;position:absolute;top:10px;right:10px; }
/* Compare */
.compare-view { display:flex;flex-direction:column;gap:24px;max-width:1100px;margin:0 auto; }
.compare-top { display:flex;align-items:flex-start;gap:24px; }
.compare-mine,.compare-other { flex:1; }
.compare-vs { align-self:center;background:rgba(255,87,34,0.15);border-radius:99px;color:#ff5722;font-size:1.2rem;font-weight:800;padding:12px 16px;flex-shrink:0; }
.compare-empty { background:rgba(30,41,59,0.8);border:1px dashed rgba(255,255,255,0.2);border-radius:20px;padding:28px;text-align:center; }
.compare-empty p { color:#94a3b8;margin-bottom:16px; }
.compare-code-input { background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#94a3b8;font-family:monospace;font-size:0.8rem;padding:10px 14px;resize:none;width:100%;margin-bottom:12px; }
.compare-load-btn { background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:none;border-radius:10px;color:#fff;cursor:pointer;font-size:0.9rem;font-weight:600;padding:10px 24px;transition:all .2s; }
.compare-load-btn:hover { transform:translateY(-2px); }
@keyframes fadeIn { from{opacity:0}to{opacity:1} }
@keyframes slideUp { from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1} }
"""

css_path = r"c:\Users\90536\Desktop\PROJELERİM\Gittiğim Yerler\src\styles\main.css"
with open(css_path, "a", encoding="utf-8") as f:
    f.write("\n" + css)
