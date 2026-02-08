### chart-js app for reddit

post and customize chart-js templates on reddit, rendered via [quickchart.io](https://quickchart.io). moderator-only customize form; auto-refresh from `wiki:<slug>` every 15 minutes; cached per width for speed.

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source-code](https://github.com/hedcet/quickchart)

---

### quick start

- create a post via “post chart-js template” (mods)
- click customize on the post
- paste either chart-js config json or `wiki:<slug>` (e.g., `wiki:config-js`)

### auto-refresh

- checks every 15 minutes and updates the chart when your linked wiki page changes
- you can also open customize and re-save to refresh immediately

### refreshing

- if the image looks outdated, wait up to 15 minutes or re-save via customize

### notes

- only moderators see the customize button
- keep wiki content in plain markdown or inside code fences
- if rendering fails, an error image appears (e.g., `error.png`); fix your config and re-save

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### changelog

- 0.14.0 — add scheduler (every 15 minutes)
- 0.1.0 — first preview

### license

see the license file for terms.
