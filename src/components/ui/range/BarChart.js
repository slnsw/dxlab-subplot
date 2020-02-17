import React, { Component } from "react";
import { Bar, HorizontalBar } from "react-chartjs-2";

export class BarChart extends Component {
  render() {
    const { data, highlight, domain } = this.props;

    // calculate frequency of data
    var counts = {};
    for (var i = 0; i < data.length; i++)
      counts[data[i]] = counts[data[i]] + 1 || 1;

    // generate data
    const barDataValues = [];
    for (let i = 0; i < domain[1]; i++) {
      barDataValues.push(counts[i] || 0);
    }
    const barData = {
      labels: barDataValues.map((val, i) => i),
      datasets: [
        {
          backgroundColor: barDataValues.map((val, i) =>
            i >= highlight[0] && i <= highlight[1]
              ? "rgba(255, 255, 255, .8)" // "rgba(135, 206, 235, 1)"
              : "rgba(255, 255, 255, .3)" // "rgba(255, 99, 132, 0.2)"
          ),
          hoverBackgroundColor: "rgba(255,255,255,0.4)", // "rgba(255,99,132,0.4)",
          data: barDataValues
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            display: false,
            ticks: {
              min: 0,
              beginAtZero: false
            }
          }
        ],
        yAxes: [
          {
            display: false,
            ticks: {
              min: domain[0],
              beginAtZero: false
            }
          }
        ]
      }
    };
    return (
      <HorizontalBar data={barData} options={options}
      />
    )
  }
}

