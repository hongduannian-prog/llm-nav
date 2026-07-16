const SITE_CONFIG = {
  'claude.ai': {
    userMessage: '[data-testid="user-message"]',
    scrollContainer: '[data-autoscroll-container]'
  },
  'chatgpt.com': {
    userMessage: '[data-message-author-role="user"]',
    scrollContainer: 'main'
  },
  'chat.openai.com': {
    userMessage: '[data-message-author-role="user"]',
    scrollContainer: 'main'
  },
  'gemini.google.com': {
    userMessage: 'user-query',
    scrollContainer: '.conversation-container'
  },
  'perplexity.ai': {
    userMessage: '[data-testid="user-message"]',
    scrollContainer: 'main'
  }
};

const host = location.hostname;
const configEntry = Object.entries(SITE_CONFIG).find(([key]) => host.includes(key));
if (!configEntry) throw new Error('[nav] unsupported site');
const config = configEntry[1];

let activeItem = null;
let observer = null;
let currentUrl = location.href;
let rebuildTimer = null;
let scrollRafPending = false;
let scrollLockUntil = 0; // 点击跳转后短暂屏蔽 scroll 高亮更新

function buildSidebar() {
  const messages = document.querySelectorAll(config.userMessage);
  if (messages.length === 0) return;

  let sidebar = document.getElementById('claude-nav-sidebar');
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'claude-nav-sidebar';

    const toggle = document.createElement('div');
    toggle.id = 'claude-nav-toggle';
    toggle.textContent = '▼ Nav';
    toggle.onclick = () => {
      const list = document.getElementById('claude-nav-list');
      const collapsed = list.style.display === 'none';
      list.style.display = collapsed ? 'block' : 'none';
      toggle.textContent = collapsed ? '▼ Nav' : '▶ Nav';
    };

    const list = document.createElement('div');
    list.id = 'claude-nav-list';
    sidebar.appendChild(toggle);
    sidebar.appendChild(list);
    document.body.appendChild(sidebar);
  }

  // 保留当前高亮位置，重建后恢复
  const prevActiveIndex = activeItem
    ? Array.prototype.indexOf.call(
        document.querySelectorAll('.claude-nav-item'), activeItem)
    : -1;

  const list = document.getElementById('claude-nav-list');
  list.innerHTML = '';
  activeItem = null;

  messages.forEach((el, i) => {
    const text = el.innerText.trim().slice(0, 40) || `消息 ${i + 1}`;
    const item = document.createElement('div');
    item.className = 'claude-nav-item';
    item.textContent = `${i + 1}. ${text}`;
    item.onclick = () => {
      el.scrollIntoView({ behavior: 'smooth' });
      scrollLockUntil = Date.now() + 800; // smooth scroll 期间不让高亮乱跳
      if (activeItem) activeItem.classList.remove('active');
      item.classList.add('active');
      activeItem = item;
    };
    if (i === prevActiveIndex) {
      item.classList.add('active');
      activeItem = item;
    }
    list.appendChild(item);
  });
}

// debounce：流式输出期间 mutation 高频触发，合并成 300ms 一次重建
function scheduleRebuild() {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(buildSidebar, 300);
}

function updateActiveOnScroll() {
  if (Date.now() < scrollLockUntil) return;
  const messages = document.querySelectorAll(config.userMessage);
  const items = document.querySelectorAll('.claude-nav-item');
  if (!messages.length || !items.length) return;

  let closestIndex = 0;
  let closestDist = Infinity;
  messages.forEach((el, i) => {
    const dist = Math.abs(el.getBoundingClientRect().top);
    if (dist < closestDist) { closestDist = dist; closestIndex = i; }
  });
  items.forEach((item, i) => {
    const isActive = i === closestIndex;
    item.classList.toggle('active', isActive);
    if (isActive) activeItem = item;
  });
}

// rAF 节流：scroll 事件每秒可触发上百次，压到每帧最多一次
window.addEventListener('scroll', () => {
  if (scrollRafPending) return;
  scrollRafPending = true;
  requestAnimationFrame(() => {
    scrollRafPending = false;
    updateActiveOnScroll();
  });
}, true);

function attachObserver(target) {
  if (observer) observer.disconnect();
  observer = new MutationObserver(scheduleRebuild);
  observer.observe(target, { childList: true, subtree: true });
}

function init(retries = 30) {
  const container = document.querySelector(config.scrollContainer);
  if (container) {
    attachObserver(container);
    buildSidebar();
  } else if (retries > 0) {
    setTimeout(() => init(retries - 1), 300);
  } else {
    // 选择器失效（网站改版）时的兜底：观察 body，功能降级但不静默失败
    console.warn('[LLM Nav] scroll container not found, falling back to body. Selectors may be outdated — please report an issue.');
    attachObserver(document.body);
    buildSidebar();
  }
}

setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    const old = document.getElementById('claude-nav-sidebar');
    if (old) old.remove();
    activeItem = null;
    if (observer) { observer.disconnect(); observer = null; } // 修复泄漏：先断开再置空
    clearTimeout(rebuildTimer);
    init();
  }
}, 500);

init();
