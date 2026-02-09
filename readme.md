## Chart.js for Reddit

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source](https://github.com/hedcet/quickchart)

Build interactive Chart.js visualizations on Reddit using [quickchart.io](https://quickchart.io).

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### Getting Started

1. Create a chart post using the **'post chart-js template'** menu (mods only)
2. Click **customize** on your post
3. Paste your Chart.js config as JSON, or link to a wiki page with `wiki:page-name`

### Features

**Auto-sync with wiki pages** — Link your chart to a wiki page and it'll update automatically when you edit the config. Re-save via customize to refresh manually.

**Responsive rendering** — Charts adapt to any screen size without losing quality.

**Smart caching** — Images are cached efficiently and auto-refresh when configs change.

### Tips

- Only moderators can see the customize button
- Wiki configs should be plain JSON (no markdown formatting)
- If your chart doesn't render, double-check your JSON syntax and re-save

### Changelog

- **0.15.0** — Auto-sync scheduler
- **0.1.0** — Initial release
