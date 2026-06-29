import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const baseOptions: ChartOptions<'line' | 'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        color: '#071b3a',
        font: { size: 13, weight: 700 },
        padding: 18,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(7, 27, 58, 0.92)',
      bodyFont: { size: 13, weight: 700 },
      borderColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      cornerRadius: 14,
      padding: 12,
      titleFont: { size: 13, weight: 800 }
    }
  },
  scales: {
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: 'rgba(7, 27, 58, 0.55)', font: { size: 12, weight: 800 } }
    },
    y: {
      border: { display: false },
      grid: { color: 'rgba(0, 127, 255, 0.10)' },
      ticks: {
        color: 'rgba(7, 27, 58, 0.48)',
        font: { size: 12, weight: 800 },
        callback: (value) => `${value}%`
      },
      suggestedMax: 100,
      suggestedMin: 0
    }
  }
};

export const PremiumLineChart = ({ labels, values, label = 'Évolution', color = '#007fff', fillColor = 'rgba(0,127,255,0.16)' }: { labels: string[]; values: Array<number | null>; label?: string; color?: string; fillColor?: string }) => {
  return (
    <div className="premium-chart h-72 p-4">
      <Line
        data={{
          labels,
          datasets: [
            {
              label,
              data: values,
              borderColor: color,
              backgroundColor: fillColor,
              borderWidth: 4,
              fill: true,
              pointBackgroundColor: '#f7d618',
              pointBorderColor: color,
              pointBorderWidth: 3,
              pointHoverRadius: 7,
              pointRadius: 5,
              tension: 0.42
            }
          ]
        }}
        options={baseOptions as ChartOptions<'line'>}
      />
    </div>
  );
};

export const PremiumGroupedBarChart = ({ labels, datasets }: { labels: string[]; datasets: Array<{ label: string; values: number[]; color: string }> }) => {
  return (
    <div className="premium-chart h-72 p-4">
      <Bar
        data={{
          labels,
          datasets: datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.values,
            backgroundColor: dataset.color,
            borderRadius: 12,
            borderSkipped: false,
            maxBarThickness: 30
          }))
        }}
        options={baseOptions as ChartOptions<'bar'>}
      />
    </div>
  );
};
