import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './graph.css';
import FilterSelect from '../../../../components/common/FilterSelect';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

const graphLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const graphValues = [28, 42, 58, 47, 52, 49, 58, 68];

const data: ChartData<'line'> = {
  labels: graphLabels,
  datasets: [
    {
      label: 'Crafted items',
      data: graphValues,
      fill: true,
      backgroundColor: 'rgba(60, 99, 255, 0.16)',
      borderColor: '#3c63ff',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3c63ff',
      tension: 0.35,
    },
  ],
};

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      boxPadding: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(226,232,240,0.75)' },
      ticks: { color: '#64748b' },
    },
  },
};

const GraphCard: React.FC = () => {
  return (
    <section className="graph-card">
      <div className="graph-card-header">
        <div>
          <h3>Crafted item each month</h3>
          <p>Monthly craft volume by warehouse and blueprint.</p>
        </div>
        <FilterSelect
          value="month"
          onChange={() => undefined}
          ariaLabel="Graph time range"
          options={[
            { label: 'Last 8 months', value: 'month' },
            { label: 'This quarter', value: 'quarter' },
            { label: 'This year', value: 'year' },
          ]}
          className="graph-select-shell"
        />
      </div>

      <div className="graph-figure">
        <Line data={data} options={options} />
      </div>
    </section>
  );
};

export default GraphCard;
