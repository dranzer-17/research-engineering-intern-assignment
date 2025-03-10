'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Define TypeScript interfaces for chart components
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  [key: string]: any;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartProps {
  data: ChartData;
  options?: Record<string, any>;
  width?: string;
  height?: string;
}

// BarChart component
export const BarChart = ({ 
  data, 
  options = {}, 
  width = '100%', 
  height = '300px' 
}: ChartProps) => {
  return (
    <div style={{ width, height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

// LineChart component
export const LineChart = ({ 
  data, 
  options = {}, 
  width = '100%', 
  height = '300px' 
}: ChartProps) => {
  return (
    <div style={{ width, height }}>
      <Line data={data} options={options} />
    </div>
  );
};

// PieChart component
export const PieChart = ({ 
  data, 
  options = {}, 
  width = '100%', 
  height = '300px' 
}: ChartProps) => {
  return (
    <div style={{ width, height }}>
      <Pie data={data} options={options} />
    </div>
  );
};