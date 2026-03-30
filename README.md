# LLM Nav

A lightweight navigation sidebar for LLM chat interfaces. Lists your messages as a clickable outline so you can jump to any point in a long conversation.

**Supported sites:** Claude · ChatGPT · Gemini · Perplexity

---

## Chrome Extension (Desktop)

### Install

1. Download or clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `extension/` folder
5. Open any supported site — the sidebar appears automatically

### Features

- Auto-updates as you send new messages
- Highlights the message closest to your current scroll position
- Collapses/expands with the toggle button
- Survives conversation switching (SPA routing)

---

## Bookmarklet (Mobile + Desktop)

Works on any browser including Safari and Chrome on iOS/Android. No install required.

### Setup

1. Copy the entire contents of `bookmarklet.js`
2. Create a new browser bookmark (any URL)
3. Edit the bookmark and paste the code as the URL
4. Name it something like `LLM Nav`

### Use

Open any supported LLM site, open your bookmarks, tap **LLM Nav**. Tap again to close.

---

## Supported Sites & Selectors

| Site | User message selector | Scroll container |
|---|---|---|
| claude.ai | `[data-testid="user-message"]` | `[data-autoscroll-container]` |
| chatgpt.com | `[data-message-author-role="user"]` | `main` |
| gemini.google.com | `user-query` | `.conversation-container` |
| perplexity.ai | `[data-testid="user-message"]` | `main` |

### Adding a new site

In `extension/content.js` and `bookmarklet.js`, add an entry to `SITE_CONFIG`:

```js
'your-llm-site.com': {
  userMessage: 'YOUR_SELECTOR',
  scrollContainer: 'YOUR_CONTAINER'
}
```

Then add the URL pattern to `extension/manifest.json` under `matches`.

Pull requests welcome.

---

## File Structure

```
llm-nav/
├── extension/
│   ├── manifest.json
│   ├── content.js
│   └── sidebar.css
├── bookmarklet.js
└── README.md
```

---

## License

MIT
