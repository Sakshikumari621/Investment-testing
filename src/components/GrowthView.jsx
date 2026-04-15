import React from 'react';
import { useStore } from '../context/StoreProvider';
import { RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function GrowthView() {
  const { state, generateGrowthData } = useStore();
  
  if (!state.growthData) return null;

  const { month, monthlyGrowthPct, daily } = state.growthData;

  const chartData = {
    labels: daily.map(d => d.day),
    datasets: [
      {
        fill: true,
        label: 'Daily Growth (%)',
        data: daily.map(d => parseFloat(d.pct)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Investment Growth</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Growth for {month} — Total: <span style={{ color: 'var(--success)' }}>+{monthlyGrowthPct}%</span>
          </p>
        </div>
        <button className="btn-secondary" onClick={generateGrowthData} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} /> Simulate New Month
        </button>
      </div>

      <div style={{ height: '300px', marginBottom: '32px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Daily Breakdown (Weekdays Only)</h4>
      <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Growth (%)</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d, i) => (
              <tr key={i}>
                <td>{d.day}</td>
                <td><span className="badge badge-completed">Market Open</span></td>
                <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>+{d.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
