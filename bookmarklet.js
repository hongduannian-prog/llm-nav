javascript:(() => {
  const SITE_CONFIG = {
    'claude.ai': { userMessage: '[data-testid="user-message"]', scrollContainer: '[data-autoscroll-container]' },
    'chatgpt.com': { userMessage: '[data-message-author-role="user"]', scrollContainer: 'main' },
    'gemini.google.com': { userMessage: 'user-query', scrollContainer: '.conversation-container' },
    'perplexity.ai': { userMessage: '[data-testid="user-message"]', scrollContainer: 'main' }
  };

  const host = location.hostname;
  const entry = Object.entries(SITE_CONFIG).find(([k]) => host.includes(k));
  if (!entry) return alert('[LLM Nav] Unsupported site');
  const config = entry[1];

  const existing = document.getElementById('llm-nav-sidebar');
  if (existing) { existing.remove(); return; }

  const style = document.createElement('style');
  style.textContent = `
    #llm-nav-sidebar { position:fixed; top:60px; right:10px; width:200px; max-height:80vh; background:#1e1e1e; border-radius:8px; z-index:9999; box-shadow:0 2px 12px rgba(0,0,0,0.4); overflow:hidden; font-family:sans-serif; }
    #llm-nav-toggle { color:#888; font-size:11px; padding:8px 10px; cursor:pointer; user-select:none; }
    #llm-nav-toggle:hover { color:#fff; }
    #llm-nav-list { max-height:calc(80vh - 32px); overflow-y:auto; padding:0 6px 6px; }
    .llm-nav-item { color:#ccc; font-size:12px; padding:6px 8px; cursor:pointer; border-radius:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .llm-nav-item:hover { background:#333; color:#fff; }
    .llm-nav-item.active { background:#2a4a7f; color:#fff; }
  `;
  document.head.appendChild(style);

  const sidebar = document.createElement('div');
  sidebar.id = 'llm-nav-sidebar';

  const toggle = document.createElement('div');
  toggle.id = 'llm-nav-toggle';
  toggle.textContent = '▼ Nav';
  toggle.onclick = () => {
    const list = document.getElementById('llm-nav-list');
    const collapsed = list.style.display === 'none';
    list.style.display = collapsed ? 'block' : 'none';
    toggle.textContent = collapsed ? '▼ Nav' : '▶ Nav';
  };

  const list = document.createElement('div');
  list.id = 'llm-nav-list';
  sidebar.appendChild(toggle);
  sidebar.appendChild(list);
  document.body.appendChild(sidebar);

  let activeItem = null;

  function build() {
    const messages = document.querySelectorAll(config.userMessage);
    if (!messages.length) return;
    list.innerHTML = '';
    activeItem = null;
    messages.forEach((el, i) => {
      const text = el.innerText.trim().slice(0, 40) || `消息 ${i + 1}`;
      const item = document.createElement('div');
      item.className = 'llm-nav-item';
      item.textContent = `${i + 1}. ${text}`;
      item.onclick = () => {
        el.scrollIntoView({ behavior: 'smooth' });
        if (activeItem) activeItem.classList.remove('active');
        item.classList.add('active');
        activeItem = item;
      };
      list.appendChild(item);
    });
  }

  window.addEventListener('scroll', () => {
    const messages = document.querySelectorAll(config.userMessage);
    const items = document.querySelectorAll('.llm-nav-item');
    if (!messages.length || !items.length) return;
    let idx = 0, minDist = Infinity;
    messages.forEach((el, i) => {
      const d = Math.abs(el.getBoundingClientRect().top);
      if (d < minDist) { minDist = d; idx = i; }
    });
    items.forEach((item, i) => item.classList.toggle('active', i === idx));
  }, true);

  build();
  setTimeout(build, 1500);
})();
