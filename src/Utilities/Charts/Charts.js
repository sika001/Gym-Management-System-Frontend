import React from "react";
import { Bar } from "react-chartjs-2";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto"; //DO NOT REMOVE THIS, IT WILL BREAK THE CHART

export function BarChart(props) {
    const [options] = useState({
        responsive: true,
        maintainAspectRatio: false,
        barPercentage: props.barPercentage, //bar width
        scales: {
            x: {
                title: {
                    display: true,
                    text: props.labelX, // X-axis label
                    color: props.color, // X-axis label color
                    font: {
                        size: props.font.size,
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: props.labelY, // Y-axis label
                    color: props.color, // Y-axis label color
                    font: {
                        size: props.font.size,
                    },
                },
            },
        },
    });
    return <Bar data={props.chartData} options={options} />;
}

export function LineChart(props) {
    return <Line data={props.data} options={props.options} />;
}
