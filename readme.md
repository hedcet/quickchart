### chart-js app for reddit

this will help you to post/config one/multiple highlight/normal chart-js template & auto-refresh

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1qytznm) | [source-code](https://github.com/hedcet/quickchart)

you can customize it like this

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
        tension: 0.25,
      },
    ],
    labels: ['Q1', 'Q10'],
  },
  options: {
    layout: {
      padding: {
        bottom: 24,
        left: 16,
        right: 32,
        top: 48,
      },
    },
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  },
  type: 'line',
}
```

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

to auto-refresh the chart config every `*/15 * * * *`, save the source as `wiki/post/comment:<slug>`. example: use the wiki page [chart-js](https://www.reddit.com/r/kerala_boxoffice/wiki/chart-js) as `wiki:config-js`.

### changelog

- 0.9.0
  - add scheduler to refresh chart config from wiki/post/comment
- 0.1.0
  - first preview
