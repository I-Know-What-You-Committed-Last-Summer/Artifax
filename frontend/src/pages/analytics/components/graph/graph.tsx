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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

const graphLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const graphValues = [28, 42, 58, 47, 52, 49, 58, 68];

// helper: convert #rrggbb to rgba(r,g,b,a)
function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return hex;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const GraphCard: React.FC = () => {
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick((t) => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const themeVars = useMemo(() => {
    // Tie recomputation to theme toggles observed via themeTick.
    void themeTick;
    const vars = getComputedStyle(document.documentElement);
    return {
      chartAccent: vars.getPropertyValue('--chart-accent')?.trim() || '#3c63ff',
      tooltipBg: vars.getPropertyValue('--chart-tooltip-bg')?.trim() || '#ffffff',
      textColor: vars.getPropertyValue('--text')?.trim() || '#0f172a',
      bodyColor: vars.getPropertyValue('--muted')?.trim() || '#334155',
      gridColor: vars.getPropertyValue('--chart-grid')?.trim() || 'rgba(226,232,240,0.75)',
      tickColor: vars.getPropertyValue('--chart-tick')?.trim() || '#64748b',
      surfaceColor: vars.getPropertyValue('--surface')?.trim() || '#ffffff',
      borderColor: vars.getPropertyValue('--border')?.trim() || '#e2e8f0',
    };
  }, [themeTick]);

  const data = useMemo<ChartData<'line'>>(() => ({
    labels: graphLabels,
    datasets: [
      {
        label: 'Crafted items',
        data: graphValues,
        fill: true,
        backgroundColor: hexToRgba(themeVars.chartAccent, 0.16),
        borderColor: themeVars.chartAccent,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: themeVars.surfaceColor,
        pointBorderColor: themeVars.chartAccent,
        tension: 0.35,
      },
    ],
  }), [themeVars.chartAccent, themeVars.surfaceColor]);

  const options = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: themeVars.tooltipBg,
        titleColor: themeVars.textColor,
        bodyColor: themeVars.bodyColor,
        borderColor: themeVars.borderColor,
        borderWidth: 1,
        boxPadding: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: themeVars.tickColor },
      },
      y: {
        beginAtZero: true,
        grid: { color: themeVars.gridColor },
        ticks: { color: themeVars.tickColor },
      },
    },
  }), [
    themeVars.tooltipBg,
    themeVars.textColor,
    themeVars.bodyColor,
    themeVars.gridColor,
    themeVars.tickColor,
    themeVars.borderColor,
  ]);

  return (
    <section className="graph-card">
      <div className="graph-card-header">
        <div>
          <h3>Crafted item each month</h3>
          <p>Monthly craft volume by warehouse and blueprint.</p>
        </div>
        <select className="graph-select" defaultValue="month">
          <option value="month">Last 8 months</option>
          <option value="quarter">This quarter</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="graph-figure">
        <Line data={data} options={options} />
      </div>
    </section>
  );
};

export default GraphCard;
