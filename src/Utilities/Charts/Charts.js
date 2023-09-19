import React from "react";
import { Bar } from "react-chartjs-2";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto"; //NE DIRAJ OVO, PUCA GRAFIK AKO SE OVO MAKNE

export function BarChart(props) {
    const [options] = useState({
        responsive: true,
        maintainAspectRatio: false,
        barPercentage: props.barPercentage, //širina barova
        scales: {
            x: {
                title: {
                    display: true,
                    text: props.labelX, // X-osa labela
                    color: props.color, // X-osa boja labele
                    font: {
                        size: props.font.size,
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: props.labelY, // Y-osa labela
                    color: props.color, // Y-osa boja labele
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
