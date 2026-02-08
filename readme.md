### Chart.js app for Reddit

Create interactive Chart.js visualizations on Reddit using [quickchart.io](https://quickchart.io) for rendering.

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source](https://github.com/hedcet/quickchart)

---

### Quick start

1. Create a chart post via 'post chart-js template' menu (moderators only)
2. Click customize on your post
3. Enter Chart.js config JSON or reference a wiki page (`wiki:page-name`)

### Auto-sync

Link charts to wiki pages for automatic updates:
- Config changes are synced regularly
- Manual refresh: re-save via customize

### How it works

- **Dynamic rendering** — scales to any screen size without distortion
- **Smart caching** — stores images efficiently with Redis hashes
- **Auto-invalidation** — removes stale cached images when configs change

### Notes

- Customize button is moderator-only
- Wiki config must be plain JSON (no formatting)
- If rendering fails, check config syntax and re-save

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### Changelog

- 0.15.0 — auto-sync scheduler
- 0.1.0 — initial release
