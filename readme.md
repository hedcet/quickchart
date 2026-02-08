### chart-js app for reddit

this app lets you post and configure one or more chart-js templates (highlight or normal) on reddit. images are rendered via quickchart.io and cached per width for fast loads. moderators can customize configs inline, and the app can auto-refresh from a wiki/post/comment source every 15 minutes.

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) · [source-code](https://github.com/hedcet/quickchart)

---

### features

- post chart-js templates and render images via quickchart
- responsive image generation for multiple widths
- moderator-only customize form on the post
- auto-refresh from `wiki/post/comment:<slug>` every 15 minutes
- redis-backed caching to avoid redundant generation

### how it works

- when you create a post, the app stores a default chart config under `${postId}|chart_config`
- when the app renders, it generates image urls per width and caches them as `${postId}|img_url_<width>`
- the customize form accepts either:
  - a direct chart-js config json (string)
  - a source reference like `wiki:<slug>`, `post:<id>`, `comment:<id>`
- if you choose a wiki source, the app records the mapping in `scheduler_config` so the scheduler can refresh it periodically

### usage

1) create a post
- from your subreddit, use the menu item “post chart-js template” (moderators)
- the app creates a post and stores an initial config

2) customize the config
- open the customize button on the post
- paste either a full chart-js config json, or a source string
- example direct json:

```
{
  data: {
    datasets: [
      {
        backgroundColor: pattern.draw('plus', '#FFCCBC'),
        borderColor: '#BF360C',
        borderWidth: 1,
        data: [256, 512],
        fill: true,
        label: 'Value',
        pointStyle: 'circle',
        tension: 0.25
      }
    ],
    labels: ['Q1', 'Q10']
  },
  options: {
    layout: { padding: { bottom: 24, left: 16, right: 32, top: 48 } },
    plugins: { legend: { labels: { usePointStyle: true } } },
    scales: { y: { beginAtZero: false } }
  },
  type: 'line'
}
```

- example source: use the subreddit wiki page “chart-js” as `wiki:config-js`
  - page: [chart-js](https://www.reddit.com/r/kerala_boxoffice/wiki/chart-js)
  - input: `wiki:config-js`

### scheduler (auto-refresh)

- cadence: every 15 minutes (`*/15 * * * *`)
- job name: `chart-js`
- where mappings live: redis key `scheduler_config`
- format: pipe-separated entries `post_id:type:ref`
  - example: `abc123:wiki:config-js|def456:wiki:another-page`
- on each run:
  - reads `scheduler_config`
  - fetches the source content for each entry
  - writes the latest config to `${postId}|chart_config`
  - clears `${postId}|img_url_<width>` so the next view regenerates fresh images

### cache keys

- `${postId}|chart_config` — current chart-js config (string)
- `${postId}|img_url_<width>` — cached image url for a specific width
- `scheduler_config` — list of `post_id:type:ref` entries joined by `|`

to manually bust image caches, set `${postId}|img_url_<width>` to an empty string. it will regenerate on next render.

### error handling

- if quickchart upload fails, the app logs the error and falls back to a placeholder image sized to the requested width

### tips

- moderators see the customize button; regular users may not
- keep wiki content in markdown or code fences to avoid escape issues
- if using html in wiki, the app attempts to normalize common escapes

### screenshot

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

### changelog

- 0.9.0
  - add scheduler to auto-refresh chart config from wiki/post/comment (every 15 minutes)
- 0.1.0
  - first preview

### license

see the license file in this repository for terms.
