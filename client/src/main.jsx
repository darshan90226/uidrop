import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Code2, Copy, Heart, Layers3, Menu, Moon, Plus, Search, Sparkles, SlidersHorizontal, Sun, X, Zap } from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '';
const typeByCategory = { Buttons: 'button', Cards: 'card', Forms: 'form', Badges: 'badge', Navigation: 'nav', Avatars: 'profile' };
const readFavorites = () => { try { const v = JSON.parse(localStorage.getItem('uidrop-favorites') || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

const initialComponents = [
  { id: 'aurora-button', name: 'Aurora Button', category: 'Buttons', tag: 'Popular', description: 'A bright gradient button with a soft glow.', type: 'button', accent: '#a78bfa', radius: 13, downloads: '2.4k', author: 'uidrop' },
  { id: 'glass-card', name: 'Glass Card', category: 'Cards', tag: 'Trending', description: 'A translucent card for modern dashboards.', type: 'card', accent: '#8b5cf6', radius: 20, downloads: '1.8k', author: 'pixelcraft' },
  { id: 'waitlist-form', name: 'Waitlist Form', category: 'Forms', tag: 'New', description: 'A clean email capture form with a strong CTA.', type: 'form', accent: '#a3e635', radius: 12, downloads: '980', author: 'uidrop' },
  { id: 'status-pill', name: 'Status Pill', category: 'Badges', tag: 'Tiny but useful', description: 'A compact status indicator with a live dot.', type: 'badge', accent: '#34d399', radius: 99, downloads: '760', author: 'mika-ui' },
  { id: 'pricing-card', name: 'Pricing Card', category: 'Cards', tag: 'Featured', description: 'A focused pricing block for your next launch.', type: 'pricing', accent: '#f0abfc', radius: 18, downloads: '1.2k', author: 'uidrop' },
  { id: 'nav-link', name: 'Active Nav Link', category: 'Navigation', tag: 'Minimal', description: 'A tidy navigation item with an active state.', type: 'nav', accent: '#60a5fa', radius: 10, downloads: '640', author: 'devfoundry' },
  { id: 'profile-chip', name: 'Profile Chip', category: 'Avatars', tag: 'Community', description: 'A compact profile block for activity feeds.', type: 'profile', accent: '#fb7185', radius: 15, downloads: '510', author: 'mika-ui' },
  { id: 'icon-action', name: 'Icon Action', category: 'Buttons', tag: 'Micro UI', description: 'A compact icon-first action with a hover lift.', type: 'icon', accent: '#fbbf24', radius: 14, downloads: '420', author: 'pixelcraft' },
];
const categories = ['All components', 'Buttons', 'Cards', 'Forms', 'Badges', 'Navigation', 'Avatars'];

function ComponentPreview({ item, accent, radius, large = false }) {
  const style = { '--accent': accent || item.accent, '--radius': `${radius ?? item.radius}px` };
  return <div className={`preview-canvas ${large ? 'preview-large' : ''}`} style={style}>
    {item.type === 'button' && <button className="demo-button"><Sparkles size={15} /> Get started <ArrowUpRight size={15} /></button>}
    {item.type === 'card' && <div className="demo-glass-card"><div className="orb"/><span className="demo-eyebrow">YOUR NEXT IDEA</span><strong>Make something<br/>remarkable.</strong><p>Good design makes things feel simple.</p><button className="demo-text-button">Explore components <ArrowRight size={14}/></button></div>}
    {item.type === 'form' && <div className="demo-form"><span className="demo-eyebrow">EARLY ACCESS</span><strong>Be first in line.</strong><p>Get the good stuff before everyone else.</p><div className="fake-input">you@example.com</div><button className="demo-submit">Join the waitlist <ArrowRight size={14}/></button></div>}
    {item.type === 'badge' && <div className="status-badge"><span/> All systems operational</div>}
    {item.type === 'pricing' && <div className="demo-price"><span className="demo-eyebrow">FOR BUILDERS</span><strong>Starter</strong><div className="price"><b>$0</b><span>/ forever</span></div><p>Everything you need to get moving.</p><div className="price-line"><Check size={14}/> Unlimited components</div><div className="price-line"><Check size={14}/> Community updates</div><button className="demo-submit">Start building <ArrowRight size={14}/></button></div>}
    {item.type === 'nav' && <div className="demo-nav"><span className="mini-logo"><Layers3 size={15}/></span><span className="demo-nav-item">Overview</span><span className="demo-nav-item active">Components</span><span className="demo-nav-item">Docs</span></div>}
    {item.type === 'profile' && <div className="profile-chip"><div className="avatar">MK</div><div><strong>Mika K.</strong><span>Product designer</span></div><span className="follow-pill">Follow +</span></div>}
    {item.type === 'icon' && <button className="icon-action"><ArrowUpRight size={22}/></button>}
  </div>;
}

function AdminPanel({ onClose, notify }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('uidrop-admin') || '');
  const [status, setStatus] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const headers = { 'Content-Type': 'application/json', 'x-admin-token': token };

  const load = async (nextStatus = status) => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/admin/components?status=${nextStatus}`, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Request failed');
      sessionStorage.setItem('uidrop-admin', token);
      setItems(data.components);
    } catch (e) { setItems([]); setError(e.message === 'Failed to fetch' ? 'API is not reachable. Is the server running?' : e.message); }
    setLoading(false);
  };
  const setItemStatus = async (id, next) => {
    const r = await fetch(`${API}/api/admin/components/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: next }) });
    if (r.ok) { setItems(old => old.filter(i => i.id !== id)); notify(`Marked ${next}`); } else notify('Update failed');
  };
  const remove = async (id) => {
    const r = await fetch(`${API}/api/admin/components/${id}`, { method: 'DELETE', headers });
    if (r.ok) { setItems(old => old.filter(i => i.id !== id)); notify('Deleted'); } else notify('Delete failed');
  };
  useEffect(() => { if (token) load(); /* eslint-disable-next-line */ }, []);

  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="submit-modal admin-modal">
    <div className="modal-head"><div><span className="section-kicker">MODERATION</span><h2>Review <span>queue.</span></h2><p>Approve submissions to publish them in the public gallery.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
    <div className="admin-body">
      <div className="admin-auth"><input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="ADMIN_TOKEN from server/.env"/><button className="primary-btn" onClick={() => load()}>Load</button></div>
      <div className="admin-tabs">{['pending', 'approved', 'rejected'].map(s => <button key={s} className={status === s ? 'active' : ''} onClick={() => { setStatus(s); load(s); }}>{s}</button>)}</div>
      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-empty">Loading…</div>}
      {!loading && !error && items.length === 0 && <div className="admin-empty">Nothing here.</div>}
      {items.map(item => <div className="admin-item" key={item.id}>
        <div><span className="card-category">{item.category.toUpperCase()}</span><h3>{item.name}</h3><p>{item.description}</p>{item.code && <pre>{item.code.slice(0, 400)}</pre>}</div>
        <div className="admin-actions">
          {status !== 'approved' && <button className="customize-btn" onClick={() => setItemStatus(item.id, 'approved')}>Approve</button>}
          {status !== 'rejected' && <button className="copy-card-btn" onClick={() => setItemStatus(item.id, 'rejected')}>Reject</button>}
          <button className="copy-card-btn" onClick={() => remove(item.id)}>Delete</button>
        </div>
      </div>)}
    </div>
  </section></div>;
}

function App() {
  const [components, setComponents] = useState(initialComponents);
  const [activeCategory, setActiveCategory] = useState('All components');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialComponents[0]);
  const [accent, setAccent] = useState(initialComponents[0].accent);
  const [radius, setRadius] = useState(initialComponents[0].radius);
  const [favorites, setFavorites] = useState(readFavorites);
  const [showFavorites, setShowFavorites] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [submission, setSubmission] = useState({ name: '', category: 'Buttons', description: '', code: '' });
  const [apiStatus, setApiStatus] = useState('demo');
  const [adminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');

  useEffect(() => { localStorage.setItem('uidrop-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.ok ? r.json() : Promise.reject()).then(d => setApiStatus(d.database === 'connected' ? 'connected' : 'demo')).catch(() => setApiStatus('demo'));
  }, []);
  useEffect(() => {
    fetch(`${API}/api/components`).then(r => r.ok ? r.json() : Promise.reject()).then(data => {
      const palette = ['#a78bfa', '#60a5fa', '#34d399', '#fb7185', '#fbbf24'];
      const remote = (data.components || []).map((item, i) => ({ ...item, type: typeByCategory[item.category] || 'button', accent: palette[i % palette.length], radius: 13, tag: 'Community', downloads: 'New', author: item.authorName || 'community' }));
      if (remote.length) setComponents(old => [...remote, ...old.filter(local => !remote.some(r => r.name === local.name))]);
    }).catch(() => {});
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2300); return () => clearTimeout(timer); }, [toast]);

  const filtered = useMemo(() => components.filter(item => {
    const matchesCategory = activeCategory === 'All components' || item.category === activeCategory;
    const matchesQuery = `${item.name} ${item.description} ${item.category} ${item.author}`.toLowerCase().includes(query.toLowerCase());
    const matchesFavorites = !showFavorites || favorites.includes(item.id);
    return matchesCategory && matchesQuery && matchesFavorites;
  }), [components, activeCategory, query, showFavorites, favorites]);

  const choose = (item) => { setSelected(item); setAccent(item.accent); setRadius(item.radius); };
  const toggleFavorite = (id) => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
  const codeFor = (item = selected, color = accent, corner = radius) => {
    const markup = {
      button: `<button class="uidrop-${item.id}">✦ Get started ↗</button>`,
      card: `<article class="uidrop-${item.id}"><small>YOUR NEXT IDEA</small><h2>Make something remarkable.</h2><p>Good design makes things feel simple.</p><a href="#">Explore components ↗</a></article>`,
      form: `<form class="uidrop-${item.id}"><small>EARLY ACCESS</small><h2>Be first in line.</h2><p>Get the good stuff before everyone else.</p><input type="email" placeholder="you@example.com" /><button>Join the waitlist ↗</button></form>`,
      badge: `<span class="uidrop-${item.id}"><i></i> All systems operational</span>`,
      pricing: `<article class="uidrop-${item.id}"><small>FOR BUILDERS</small><h2>Starter</h2><strong>$0 <small>/ forever</small></strong><p>✓ Unlimited components</p><p>✓ Community updates</p><button>Start building ↗</button></article>`,
      nav: `<nav class="uidrop-${item.id}"><b>◈</b><a>Overview</a><a class="active">Components</a><a>Docs</a></nav>`,
      profile: `<div class="uidrop-${item.id}"><b class="avatar">MK</b><span><strong>Mika K.</strong><small>Product designer</small></span><button>Follow +</button></div>`,
      icon: `<button class="uidrop-${item.id}" aria-label="Open">↗</button>`
    }[item.type] || `<button class="uidrop-${item.id}">Get started ↗</button>`;
    const css = `.uidrop-${item.id} {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  background: ${color};\n  border: 1px solid ${color};\n  border-radius: ${corner}px;\n  color: #171122;\n  padding: 12px 18px;\n  font: 600 14px/1.4 system-ui, sans-serif;\n  text-decoration: none;\n  cursor: pointer;\n  transition: transform .2s ease, box-shadow .2s ease;\n}\n.uidrop-${item.id}:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 28px ${color}55;\n}\n.uidrop-${item.id} small { display: block; opacity: .7; font-size: 10px; }\n.uidrop-${item.id} p { color: #777; }`;
    return `${markup}\n\n<style>\n${css}\n</style>`;
  };
  const copyCode = async () => { try { await navigator.clipboard.writeText(codeFor()); setToast('Code copied to clipboard'); } catch { setToast('Clipboard blocked — select and copy from the editor'); setEditorOpen(true); } };
  const submitComponent = async (e) => {
    e.preventDefault();
    const payload = { ...submission, name: submission.name.trim(), description: submission.description.trim() };
    if (payload.name.length < 2) { setToast('Name must be at least 2 characters'); return; }
    if (payload.description.length < 8) { setToast('Description must be at least 8 characters'); return; }
    let response;
    try {
      response = await fetch(`${API}/api/components`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch {
      response = null; // network error: API is offline, fall back to local demo mode
    }
    if (response && response.ok) {
      const data = await response.json();
      const pending = { id: data.component.id, name: payload.name, category: payload.category, tag: 'Pending review', description: payload.description, type: typeByCategory[payload.category] || 'button', accent, radius, downloads: '0', author: 'you' };
      setComponents(old => [pending, ...old]); setApiStatus('connected');
      setToast('Submitted! It goes public after review');
    } else if (response && response.status >= 400 && response.status < 500) {
      let msg = 'Submission rejected';
      try { msg = (await response.json()).error || msg; } catch { /* ignore */ }
      setToast(msg); return; // keep the form open so the user can fix it
    } else {
      const localItem = { id: `community-${Date.now()}`, name: payload.name, category: payload.category, tag: 'Local draft', description: payload.description, type: typeByCategory[payload.category] || 'button', accent, radius, downloads: '0', author: 'you' };
      setComponents(old => [localItem, ...old]); setToast('API offline: saved as a local demo component');
    }
    setSubmission({ name: '', category: 'Buttons', description: '', code: '' }); setSubmitOpen(false);
  };

  return <div className={`app ${theme}`}>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="UIDrop home"><span className="brand-mark"><Layers3 size={19}/></span><span>ui<span className="brand-accent">drop</span><i>.</i></span><span className="open-source">OPEN SOURCE</span></a>
      <nav className={`topnav ${mobileMenu ? 'mobile-open' : ''}`}><a href="#explore" onClick={() => setMobileMenu(false)}>Explore</a><a href="#how-it-works">How it works</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a></nav>
      <div className="top-actions"><button className="icon-btn theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="submit-top" onClick={() => setSubmitOpen(true)}><Plus size={16}/> Submit component</button><button className="icon-btn mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu">{mobileMenu ? <X size={19}/> : <Menu size={19}/>}</button></div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> THE COMMUNITY UI TOOLKIT <span className="eyebrow-line"/></div><h1>Good UI.<br/><span>Ready to drop in.</span></h1><p className="hero-sub">A growing collection of beautiful, customizable UI components. Grab the code, make it yours, ship something great.</p><div className="hero-actions"><a className="primary-btn" href="#explore">Explore components <ArrowDownRight size={17}/></a><a className="secondary-btn" href="https://github.com" target="_blank" rel="noreferrer"><Code2 size={16}/> Contribute on GitHub <ArrowUpRight size={14}/></a></div><div className="hero-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><div><strong>Built by developers, for developers</strong><small>Free forever · Open source · No nonsense</small></div></div></div>
        <div className="hero-art"><div className="art-grid"/><div className="art-label label-top"><span className="tiny-dot purple"/> LIVE PREVIEW <span className="mono">001</span></div><div className="floating-code"><div className="window-top"><span/><span/><span/><small>button.component.css</small><Copy size={13}/></div><div className="code-lines"><p><i>01</i> <b>.button</b> <em>{'{'}</em></p><p><i>02</i> &nbsp; background: <strong>#A78BFA</strong>;</p><p><i>03</i> &nbsp; border-radius: <strong>12px</strong>;</p><p><i>04</i> &nbsp; transition: <strong>all .2s</strong>;</p><p><i>05</i> <em>{'}'}</em></p></div></div><div className="hero-component"><span className="component-tag"><Sparkles size={12}/> YOUR NEXT FAVORITE UI</span><button className="hero-demo-button" onClick={() => { setSelected(initialComponents[0]); setEditorOpen(true); }}>Make it happen <ArrowUpRight size={17}/></button><div className="hero-component-foot"><span><span className="pulse-dot"/> Hover interaction</span><span>CSS · 4.2 KB</span></div></div><div className="art-label label-bottom"><span className="tiny-dot green"/> COPY-PASTE READY <span className="mono">{'< / >'}</span></div><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div>
      </section>

      <section className="stats-strip"><div><strong>08<span>+</span></strong><small>Starter components</small></div><div><strong>100<span>%</span></strong><small>Free & open source</small></div><div><strong>01</strong><small>Click to copy code</small></div><div className="status-block"><span className={`status-light ${apiStatus === 'connected' ? 'connected' : ''}`}/><div><strong>{apiStatus === 'connected' ? 'API connected' : 'Demo mode active'}</strong><small>{apiStatus === 'connected' ? 'PostgreSQL backend detected' : 'Frontend works without setup'}</small></div></div></section>

      <section className="explore-section" id="explore"><div className="section-heading"><div><div className="section-kicker">THE LIBRARY <span>01 / 03</span></div><h2>Find your next <span>building block.</span></h2><p>Small details. Better interfaces. Copy a component and get back to building.</p></div><button className={`favorites-filter ${showFavorites ? 'active' : ''}`} onClick={() => setShowFavorites(!showFavorites)}><Heart size={15} fill={showFavorites ? 'currentColor' : 'none'}/> Favorites <span>{favorites.length}</span></button></div>
        <div className="library-controls"><div className="category-tabs">{categories.map(cat => <button key={cat} className={activeCategory === cat ? 'active' : ''} onClick={() => setActiveCategory(cat)}>{cat}</button>)}</div><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components..."/><kbd>⌘ K</kbd></label></div>
        <div className="component-grid">{filtered.map((item, index) => <article className={`component-card ${selected.id === item.id ? 'selected-card' : ''}`} key={item.id} style={{ animationDelay: `${index * 45}ms` }}><div className="card-preview-wrap"><ComponentPreview item={item}/><span className="card-tag">{item.tag}</span><button className={`favorite-btn ${favorites.includes(item.id) ? 'favorited' : ''}`} onClick={() => toggleFavorite(item.id)} aria-label="Toggle favorite"><Heart size={16} fill={favorites.includes(item.id) ? 'currentColor' : 'none'}/></button></div><div className="card-info"><div className="card-title-row"><div><span className="card-category">{item.category.toUpperCase()}</span><h3>{item.name}</h3></div><button className="arrow-card" onClick={() => { choose(item); setEditorOpen(true); }} aria-label={`Customize ${item.name}`}><ArrowUpRight size={17}/></button></div><p>{item.description}</p><div className="card-footer"><span className="author-avatar">{item.author.slice(0,1).toUpperCase()}</span><span>by <b>{item.author}</b></span><span className="card-spacer"/><span className="download-count"><Code2 size={13}/>{item.downloads}</span></div><div className="card-actions"><button className="customize-btn" onClick={() => { choose(item); setEditorOpen(true); }}><SlidersHorizontal size={14}/> Customize</button><button className="copy-card-btn" onClick={() => { choose(item); setAccent(item.accent); setRadius(item.radius); setTimeout(() => { navigator.clipboard?.writeText(codeFor(item, item.accent, item.radius)).then(() => setToast('Component code copied')).catch(() => { setToast('Open Customize to copy the code'); setEditorOpen(true); }); }, 0); }}><Copy size={14}/> Copy code</button></div></div></article>)}</div>
        {filtered.length === 0 && <div className="empty-state"><Search size={25}/><h3>No components found</h3><p>Try another search or category.</p><button className="secondary-btn" onClick={() => { setQuery(''); setActiveCategory('All components'); setShowFavorites(false); }}>Clear filters</button></div>}
        <div className="load-more"><span>SHOWING {filtered.length.toString().padStart(2, '0')} OF {components.length.toString().padStart(2, '0')} COMPONENTS</span><button onClick={() => setSubmitOpen(true)}>Have something to add? <b>Submit a component <ArrowUpRight size={14}/></b></button></div>
      </section>

      <section className="editor-promo" id="how-it-works"><div className="editor-promo-copy"><div className="section-kicker">THE PLAYGROUND <span>02 / 03</span></div><h2>Your style.<br/><span>Your rules.</span></h2><p>Adjust the details, watch your component change in real time, then take the code with you. No setup, no fuss.</p><button className="primary-btn" onClick={() => { choose(selected); setEditorOpen(true); }}>Open visual editor <ArrowRight size={16}/></button><div className="promo-foot"><span><Check size={14}/> Live preview</span><span><Check size={14}/> Clean CSS</span><span><Check size={14}/> Yours to use</span></div></div><div className="editor-mini"><div className="editor-mini-top"><span><span className="tiny-dot purple"/> LIVE EDITOR</span><span className="mono">UID / 001</span></div><div className="editor-mini-preview"><button style={{ background: accent, borderRadius: `${radius}px` }} onClick={() => setEditorOpen(true)}>Get started <ArrowUpRight size={15}/></button><span className="preview-caption">Preview updates as you edit</span></div><div className="editor-mini-controls"><div><span>Accent color</span><div className="swatches">{['#a78bfa','#60a5fa','#34d399','#fb7185','#fbbf24'].map(c => <button key={c} style={{ background: c, outline: accent === c ? '2px solid var(--text)' : 'none' }} onClick={() => setAccent(c)}/>)}</div></div><div className="radius-mini"><span>Corner radius <b>{radius}px</b></span><input type="range" min="0" max="30" value={radius} onChange={e => setRadius(Number(e.target.value))}/></div></div><button className="mini-copy" onClick={copyCode}><Copy size={14}/> Copy CSS <span>↗</span></button></div></section>

      <section className="contribute-section"><div className="contribute-icon"><Code2 size={25}/><span>+</span></div><div><div className="section-kicker">MADE BETTER TOGETHER <span>03 / 03</span></div><h2>Good ideas deserve<br/><span>to be shared.</span></h2><p>UIDrop is open source. Add a component, improve the docs, report a bug, or help shape what comes next.</p></div><div className="contribute-actions"><button className="primary-btn" onClick={() => setSubmitOpen(true)}><Plus size={16}/> Submit a component</button><a className="secondary-btn" href="https://github.com" target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight size={14}/></a><small>MIT licensed · Community powered</small></div></section>
    </main>

    <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Layers3 size={17}/></span><span>ui<span className="brand-accent">drop</span><i>.</i></span></a><span>Made for people who make things.</span><div><a href="#explore">Explore</a><a href="https://github.com" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={12}/></a><button className="admin-link" onClick={() => setAdminOpen(true)}>Admin</button><span>© 2026 UIDrop</span></div></footer>

    {editorOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setEditorOpen(false); }}><section className="editor-modal"><div className="modal-head"><div><span className="section-kicker">COMPONENT PLAYGROUND</span><h2>Make it <span>yours.</span></h2></div><button className="icon-btn" onClick={() => setEditorOpen(false)} aria-label="Close editor"><X size={20}/></button></div><div className="editor-modal-body"><div className="editor-live"><div className="editor-live-head"><span><span className="pulse-dot"/> LIVE PREVIEW</span><span className="mono">{selected.name}</span></div><ComponentPreview item={selected} accent={accent} radius={radius} large/><p>Preview is illustrative. Exported CSS is generated from your settings.</p></div><div className="editor-settings"><label className="setting-label">Component<select value={selected.id} onChange={e => { const item = components.find(c => c.id === e.target.value); if (item) choose(item); }}>{components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><div className="setting-block"><div className="setting-title"><label>Accent color</label><span className="mono">{accent.toUpperCase()}</span></div><div className="color-options">{['#a78bfa','#8b5cf6','#60a5fa','#34d399','#a3e635','#fb7185','#fbbf24','#f0abfc'].map(c => <button key={c} className={accent === c ? 'active' : ''} style={{ background: c }} onClick={() => setAccent(c)} aria-label={`Set accent ${c}`} />)}</div><label className="custom-color">Custom hex<input type="color" value={accent} onChange={e => setAccent(e.target.value)}/></label></div><div className="setting-block"><div className="setting-title"><label>Corner radius</label><span className="mono">{radius}px</span></div><input className="range-input" type="range" min="0" max="32" value={radius} onChange={e => setRadius(Number(e.target.value))}/><div className="range-labels"><span>Sharp</span><span>Rounded</span></div></div><div className="editor-tip"><Sparkles size={15}/><span>Tip: use a consistent radius and accent color across components for a more cohesive interface.</span></div></div></div><div className="code-export"><div className="code-export-head"><span><Code2 size={15}/> HTML + CSS</span><button onClick={copyCode}><Copy size={14}/> Copy code</button></div><pre>{codeFor()}</pre></div></section></div>}

    {submitOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSubmitOpen(false); }}><section className="submit-modal"><div className="modal-head"><div><span className="section-kicker">COMMUNITY CONTRIBUTION</span><h2>Drop something <span>good.</span></h2><p>Share a component for the community to review.</p></div><button className="icon-btn" onClick={() => setSubmitOpen(false)} aria-label="Close form"><X size={20}/></button></div><form onSubmit={submitComponent} className="submit-form"><label>Component name<input required maxLength="60" value={submission.name} onChange={e => setSubmission({ ...submission, name: e.target.value })} placeholder="e.g. Soft Glow Button"/></label><label>Category<select value={submission.category} onChange={e => setSubmission({ ...submission, category: e.target.value })}>{categories.filter(c => c !== 'All components').map(c => <option key={c}>{c}</option>)}</select></label><label>Description<textarea required maxLength="180" value={submission.description} onChange={e => setSubmission({ ...submission, description: e.target.value })} placeholder="What makes this component useful?" rows="3"/></label><label>Code or repository URL <span className="optional">(optional for this MVP)</span><textarea value={submission.code} onChange={e => setSubmission({ ...submission, code: e.target.value })} placeholder="Paste a code snippet or link" rows="3"/></label><div className="form-note"><Sparkles size={15}/> Submissions should be original or properly licensed. In full-stack mode, submissions enter the review queue.</div><button className="primary-btn form-submit" type="submit">Submit for review <ArrowRight size={16}/></button></form></section></div>}
    {adminOpen && <AdminPanel onClose={() => { setAdminOpen(false); if (window.location.hash === '#admin') history.replaceState(null, '', window.location.pathname); }} notify={setToast}/>}
    {toast && <div className="toast"><Check size={16}/>{toast}</div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
