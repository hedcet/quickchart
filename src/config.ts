export const defaultChart = {
  data: {
    datasets: [
      {
        backgroundColor: "#FFCCBC",
        borderColor: "#BF360C",
        borderWidth: 1,
        data: [256, 512],
        fill: true,
        label: "Value",
        tension: 0.25,
      },
    ],
    labels: ["Q1", "Q10"],
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
          pointStyle: "circle",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  },
  type: "line",
};
