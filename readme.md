### chart-js app for reddit

post and customize chart-js templates on reddit, rendered via quickchart.io. moderator-only customize form; auto-refresh from `wiki:<slug>` every 15 minutes; cached per width for speed.

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source-code](https://github.com/hedcet/quickchart)

---

### quick start

- create a post via “post chart-js template” (mods)
- click customize on the post
- paste either:
  - chart-js config json
  - `wiki:<slug>` (e.g., `wiki:config-js`) — reads subreddit wiki content

### scheduler

- runs every 15 minutes (`*/15 * * * *`)
- reads `scheduler_config` entries: `post_id:wiki:<slug>` (pipe-separated)
- updates `${postId}|chart_config` and clears `${postId}|img_url_<width>`

### cache keys

- `${postId}|chart_config` — chart config string
- `${postId}|img_url_<width>` — image url cache per width
- `scheduler_config` — `post_id:wiki:<slug>` entries joined by `|`

to bust image cache: set `${postId}|img_url_<width>` to empty; it regenerates on view.

### notes

- moderators see the customize button
- keep wiki content in markdown or code fences
- if rendering fails, an error image is returned; validate your config

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### changelog

- 0.9.0 — add scheduler (every 15 minutes)
- 0.1.0 — first preview

### license

see the license file for terms.
