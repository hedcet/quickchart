### chart-js app for reddit

this will help you to post/config one/multiple highlight/normal chart-js template

![highlights](https://github.com/hedcet/quickchart/blob/main/assets/highlights.jpg?raw=true)

[demo](https://www.reddit.com/r/chart_js_dev/comments/1qy9w1w) | [source-code](https://github.com/hedcet/quickchart)

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

### changelog

- 0.1.0
  - first preview
