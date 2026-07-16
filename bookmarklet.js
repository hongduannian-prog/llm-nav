javascript:(() => {
  const SITE_CONFIG = {
    'claude.ai': { userMessage: '[data-testid="user-message"]', scrollContainer: '[data-autoscroll-container]' },
    'chatgpt.com': { userMessage: '[data-message-author-role="user"]', scrollContainer: 'main' },
    'chat.openai.com': { userMessage: '[data-message-author-role="user"]', scrollContainer: 'main' },
    'gemini.google.com': { userMessage: 'user-query', scrollContainer: '.conversation-container' },
    'perplexity.ai': { userMessage: '[data-testid="user-message"]', scrollContainer: 'main' }
  };

  const host = location.hostname;
  const entry = Object.entries(SITE_CONFIG).find(([k]) => host.includes(k));
  if (!entry) return alert('[LLM Nav] Unsupported site');
  const config = entry[1];

  /* 再次点击 = 关闭：清掉 sidebar、scroll 监听器和定时器（style 复用，不重复插入） */
  if (window.__llmNavCleanup) { window.__llmNavCleanup(); return; }

  if (!document.getElementById('llm-nav-style')) {
    const style = document.createElement('style');
    style.id = 'llm-nav-style';
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
  }

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
  let scrollLockUntil = 0;
  let rafPending = false;

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
        scrollLockUntil = Date.now() + 800;
        if (activeItem) activeItem.classList.remove('active');
        item.classList.add('active');
        activeItem = item;
      };
      list.appendChild(item);
    });
  }

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      if (Date.now() < scrollLockUntil) return;
      const messages = document.querySelectorAll(config.userMessage);
      const items = document.querySelectorAll('.llm-nav-item');
      if (!messages.length || !items.length) return;
      let idx = 0, minDist = Infinity;
      messages.forEach((el, i) => {
        const d = Math.abs(el.getBoundingClientRect().top);
        if (d < minDist) { minDist = d; idx = i; }
      });
      items.forEach((item, i) => item.classList.toggle('active', i === idx));
    });
  }

  window.addEventListener('scroll', onScroll, true);
  const buildTimer = setTimeout(build, 1500);

  window.__llmNavCleanup = () => {
    window.removeEventListener('scroll', onScroll, true);
    clearTimeout(buildTimer);
    sidebar.remove();
    window.__llmNavCleanup = null;
  };

  build();
})();
