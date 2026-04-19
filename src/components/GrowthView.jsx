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
  const { state } = useStore();
  
  if (!state.growthHistory) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get current month's data
  const monthData = [...state.growthHistory]
    .filter(g => {
      const d = new Date(g.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const monthlyTotalPct = monthData.reduce((acc, curr) => acc + curr.percentage, 0);
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const chartData = {
    labels: monthData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        fill: true,
        label: 'Daily Growth (%)',
        data: monthData.map(d => d.percentage),
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
          <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Portfolio Performance</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Growth for {monthName} — Total Earned: <span style={{ color: 'var(--success)' }}>+{monthlyTotalPct.toFixed(2)}%</span>
          </p>
        </div>
      </div>

      <div style={{ height: '300px', marginBottom: '32px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Daily Breakdown (Weekdays Only)</h4>
      <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
        <table style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Growth (%)</th>
            </tr>
          </thead>
          <tbody>
            {monthData.map((d, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 16px' }}>
                  {new Date(d.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="badge badge-completed">Market Open</span>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold', padding: '12px 16px' }}>
                  +{d.percentage.toFixed(3)}%
                </td>
              </tr>
            ))}
            {monthData.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No portfolio data yet. Make a deposit to start tracking your growth.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
