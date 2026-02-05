### chart-js app for reddit

this will help you to post/config one/multiple highlight/normal chart-js template with movie rating feature like letterboxd

[demo](https://www.reddit.com/r/kerala_boxoffice/comments/1j6zuyz) | [source-code](https://github.com/hedcet/quickchart)

this will use [quickchart.io](https://quickchart.io) service to convert user given chart-js config to image & keep under `config.refs`

you can modify it like this

```
{
  "mods": [
    <user_id>
  ],
  "charts": [
    {
      data: {
        datasets: [
          {
            backgroundColor: '#FFCCBC',
            borderColor: '#BF360C',
            borderWidth: 1,
            data: [256, 512],
            fill: true,
            label: 'Value',
            tension: 0.25,
          },
        ],
        labels: ['Q1', 'Q10'],
      },
      options: {
        layout: {
          padding: {
            bottom: 24,
            left: 24,
            right: 48,
            top: 48,
          },
        },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
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
  ],
  "refs": {
    "fddf6f877f8498a1edd621d38a42e87d": "placeholder.png"
  }
}
```

### changelog

- 0.0.26
  - first preview
