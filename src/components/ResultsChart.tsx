import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { Candidate } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsChartProps {
  data: {
    candidate: Candidate;
    votes: number;
  }[];
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.candidate.name),
    datasets: [
      {
        label: 'Votes',
        data: data.map((item) => item.votes),
        backgroundColor: '#2ba6ff',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div>
      <Bar data={chartData} options={options} />
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.candidate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="font-medium">{item.candidate.name}</span>
            <span className="text-primary font-bold">{item.votes} votes</span>
          </div>
        ))}
      </div>
    </div>
  );
};