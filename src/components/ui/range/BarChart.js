import React from 'react'
import PropTypes from 'prop-types'

import { Bar } from 'react-chartjs-2'

export const BarChart = ({ data, highlight, domain, ...props }) => {
  // calculate frequency of data
  var counts = {}
  for (var i = 0; i < data.length; i++) { counts[data[i]] = counts[data[i]] + 1 || 1 }

  // generate data
  const barDataValues = []
  for (let i = 0; i < domain[1]; i++) {
    barDataValues.push(counts[i] || 0)
  }

  const barData = {
    labels: barDataValues.map((val, i) => i),
    datasets: [
      {
        backgroundColor: barDataValues.map((val, i) =>
          i >= highlight[0] && i <= highlight[1]
            ? 'rgba(255, 255, 255, .8)' // "rgba(135, 206, 235, 1)"
            : 'rgba(255, 255, 255, .3)' // "rgba(255, 99, 132, 0.2)"
        ),
        hoverBackgroundColor: 'rgba(255,255,255,0.4)', // "rgba(255,99,132,0.4)",
        data: barDataValues
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    scales: {
      yAxes: [
        {
          display: false,
          ticks: {
            min: 0,
            beginAtZero: false
          }
        }
      ],
      xAxes: [
        {
          display: false,
          ticks: {
            min: domain[0],
            beginAtZero: false
            // reverse: true
          }
        }
      ]
    }
  }

  return (
    <Bar
      data={barData} options={options}
    />
  )
}

BarChart.propTypes = {
  data: PropTypes.array,
  highlight: PropTypes.any,
  domain: PropTypes.any
}
