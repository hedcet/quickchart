### Chart.js app for Reddit

Create interactive Chart.js visualizations on Reddit, powered by [quickchart.io](https://quickchart.io).

**Features:** moderator customization · auto-sync from wiki · smart caching · responsive mobile rendering

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source](https://github.com/hedcet/quickchart)

---

### Quick start

1. Create a post (moderators: use "post chart-js template" menu)
2. Click customize on your post
3. Paste Chart.js config or link to wiki: `wiki:my-chart`

### Auto-sync

Link charts to wiki pages for automatic updates:
- Config changes sync every 15 minutes
- Manual refresh: re-save via customize

### How it works

**Dynamic rendering** — adapts to any screen size (mobile-optimized)  
**Smart caching** — Redis hashes for efficient storage  
**Auto-invalidation** — clears cache when config updates

### Notes

- Only moderators see the customize button
- Wiki pages should contain plain Chart.js config (no code blocks)
- Errors show a placeholder—verify config and re-save

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### Changelog

- 0.15.0 — scheduler (15-minute sync)
- 0.1.0 — initial release

### License

See LICENSE file.
