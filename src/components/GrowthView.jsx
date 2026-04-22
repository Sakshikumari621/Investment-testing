import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreProvider';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function GrowthView() {
  const { state } = useStore();

  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Derive available years from growthHistory (always include current year)
  const availableYears = useMemo(() => {
    const years = new Set([now.getFullYear()]);
    (state.growthHistory || []).forEach(g => {
      years.add(new Date(g.date).getFullYear());
    });
    return [...years].sort((a, b) => a - b);
  }, [state.growthHistory]);

  // Navigate month backward
  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      const prevYear = selectedYear - 1;
      if (availableYears.includes(prevYear) || prevYear >= availableYears[0]) {
        setSelectedMonth(11);
        setSelectedYear(prevYear);
      }
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  // Navigate month forward — cannot go past current month
  const goToNextMonth = () => {
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
    if (isCurrentMonth) return;

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const isAtCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  // Filter growth data for the selected month/year
  const monthData = useMemo(() => {
    return [...(state.growthHistory || [])]
      .filter(g => {
        const d = new Date(g.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [state.growthHistory, selectedMonth, selectedYear]);

  const monthlyTotalPct = monthData.reduce((acc, curr) => acc + curr.percentage, 0);
  const monthlyTotalAmount = monthData.reduce((acc, curr) => acc + curr.amount, 0);
  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;
  const hasData = monthData.length > 0;

  const chartData = {
    labels: monthData.map(d =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        fill: true,
        label: 'Daily Growth (%)',
        data: monthData.map(d => d.percentage),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
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
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y.toFixed(3)}%`
        }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          callback: (v) => v.toFixed(2) + '%'
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="animate-fade-in">

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Portfolio Performance</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {hasData
              ? <>Growth for <strong style={{ color: 'var(--text-primary)' }}>{monthLabel}</strong> — Total Earned: <span style={{ color: 'var(--success)' }}>+${monthlyTotalAmount.toFixed(2)}</span> (<span style={{ color: 'var(--success)' }}>+{monthlyTotalPct.toFixed(3)}%</span>)</>
              : <>Showing data for <strong style={{ color: 'var(--text-primary)' }}>{monthLabel}</strong></>
            }
          </p>
        </div>

        {/* ── Filter Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CalendarDays size={15} color="var(--text-secondary)" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{
                width: 'auto',
                padding: '6px 10px',
                fontSize: '0.875rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month Navigator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '2px',
          }}>
            <button
              onClick={goToPrevMonth}
              style={{
                background: 'none',
                padding: '5px 8px',
                borderRadius: '7px',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center',
              }}
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              minWidth: '90px',
              textAlign: 'center',
              userSelect: 'none'
            }}>
              {MONTHS[selectedMonth].slice(0, 3)} {selectedYear}
            </span>

            <button
              onClick={goToNextMonth}
              disabled={isAtCurrentMonth}
              style={{
                background: 'none',
                padding: '5px 8px',
                borderRadius: '7px',
                color: isAtCurrentMonth ? 'rgba(255,255,255,0.15)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center',
                cursor: isAtCurrentMonth ? 'not-allowed' : 'pointer',
              }}
              title={isAtCurrentMonth ? 'Cannot go to future month' : 'Next month'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div style={{ height: '300px', marginBottom: '32px', position: 'relative' }}>
        {hasData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '12px',
            border: '1px dashed rgba(255,255,255,0.08)'
          }}>
            <CalendarDays size={36} color="rgba(255,255,255,0.15)" />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
              No growth data available for <strong style={{ color: 'var(--text-primary)' }}>{monthLabel}</strong>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
              Growth is recorded on weekdays once a deposit is active
            </p>
          </div>
        )}
      </div>

      {/* ── Daily Breakdown Table ── */}
      <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
        Daily Breakdown (Weekdays Only)
        {hasData && (
          <span style={{
            marginLeft: '12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: 'var(--success)',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '2px 8px',
            borderRadius: '99px'
          }}>
            {monthData.length} trading days
          </span>
        )}
      </h4>

      <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
        <table style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Base ($)</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Amount</th>
              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Growth (%)</th>
            </tr>
          </thead>
          <tbody>
            {hasData ? (
              monthData.map((d, i) => (
                <tr key={i} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-completed">Market Open</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    ${d.baseAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold', padding: '12px 16px', fontFamily: 'monospace' }}>
                    +${d.amount.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold', padding: '12px 16px', fontFamily: 'monospace' }}>
                    +{d.percentage.toFixed(3)}%
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px 32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <CalendarDays size={28} color="rgba(255,255,255,0.15)" />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      No trading data for <strong style={{ color: 'var(--text-primary)' }}>{monthLabel}</strong>
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
                      {selectedYear > now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth > now.getMonth())
                        ? 'This is a future period — data has not been recorded yet.'
                        : 'No active deposit was present during this period.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
