import React, { useEffect, useMemo, useState } from 'react';
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

type ThemeChartTokens = {
  border: string;
  text: string;
  muted: string;
  grid: string;
  tooltipBg: string;
  primary: string;
  surface: string;
  fill: string;
};

function getThemeChartTokens(): ThemeChartTokens {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;

  return {
    border: read('--border', '#dfe3e8'),
    text: read('--text', '#1e293b'),
    muted: read('--muted', '#64748b'),
    grid: read('--chart-grid', 'rgba(226,232,240,0.75)'),
    tooltipBg: read('--chart-tooltip-bg', 'rgba(30,41,59,0.95)'),
    primary: read('--primary', '#3c63ff'),
    surface: read('--surface', '#ffffff'),
    fill: read('--chart-fill', 'rgba(60, 99, 255, 0.16)'),
  };
}

const GraphCard: React.FC = () => {
  const [themeTokens, setThemeTokens] = useState<ThemeChartTokens>(() => getThemeChartTokens());

  useEffect(() => {
    const updateTokens = () => setThemeTokens(getThemeChartTokens());

    updateTokens();

    const observer = new MutationObserver(updateTokens);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const data: ChartData<'line'> = useMemo(() => ({
    labels: graphLabels,
    datasets: [
      {
        label: 'Crafted items',
        data: graphValues,
        fill: true,
        backgroundColor: themeTokens.fill,
        borderColor: themeTokens.primary,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: themeTokens.surface,
        pointBorderColor: themeTokens.primary,
        tension: 0.35,
      },
    ],
  }), [themeTokens.fill, themeTokens.primary, themeTokens.surface]);

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: themeTokens.tooltipBg,
        titleColor: themeTokens.text,
        bodyColor: themeTokens.muted,
        borderColor: themeTokens.border,
        borderWidth: 1,
        boxPadding: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: themeTokens.muted },
      },
      y: {
        beginAtZero: true,
        grid: { color: themeTokens.grid },
        ticks: { color: themeTokens.muted },
      },
    },
  }), [themeTokens.border, themeTokens.grid, themeTokens.muted, themeTokens.text, themeTokens.tooltipBg]);

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
