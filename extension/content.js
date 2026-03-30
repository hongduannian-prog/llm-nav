const SITE_CONFIG = {
  'claude.ai': {
    userMessage: '[data-testid="user-message"]',
    scrollContainer: '[data-autoscroll-container]'
  },
  'chatgpt.com': {
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

function buildSidebar() {
  const messages = document.querySelectorAll(config.userMessage);
  console.log('[nav] buildSidebar, messages:', messages.length);
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

  const list = document.getElementById('claude-nav-list');
  list.innerHTML = '';
  activeItem = null;

  messages.forEach((el, i) => {
    const text = el.innerText.trim().slice(0, 40) || `information ${i + 1}`;
    const item = document.createElement('div');
    item.className = 'claude-nav-item';
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

function updateActiveOnScroll() {
  const messages = document.querySelectorAll(config.userMessage);
  const items = document.querySelectorAll('.claude-nav-item');
  if (!messages.length || !items.length) return;

  let closestIndex = 0;
  let closestDist = Infinity;
  messages.forEach((el, i) => {
    const dist = Math.abs(el.getBoundingClientRect().top);
    if (dist < closestDist) { closestDist = dist; closestIndex = i; }
  });
  items.forEach((item, i) => item.classList.toggle('active', i === closestIndex));
}

window.addEventListener('scroll', updateActiveOnScroll, true);

function init(retries = 30) {
  const container = document.querySelector(config.scrollContainer);
  console.log('[nav] init, container:', container, 'retries:', retries);
  if (container) {
    if (!observer) {
      observer = new MutationObserver(() => {
        console.log('[nav] MutationObserver fired');
        buildSidebar();
      });
      observer.observe(container, { childList: true, subtree: true });
      console.log('[nav] observer attached');
    }
    buildSidebar();
  } else if (retries > 0) {
    setTimeout(() => init(retries - 1), 300);
  }
}

setInterval(() => {
  if (location.href !== currentUrl) {
    console.log('[nav] URL changed:', currentUrl, '->', location.href);
    currentUrl = location.href;
    const old = document.getElementById('claude-nav-sidebar');
    if (old) old.remove();
    activeItem = null;
    observer = null;
    init();
  }
}, 500);

init();