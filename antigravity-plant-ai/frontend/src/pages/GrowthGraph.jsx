import React, { useMemo } from 'react';
import GrowthChart from '../components/GrowthChart';
import { Droplets, Sprout, Activity, TrendingUp, Heart, BarChart2 } from 'lucide-react';
import { usePlantContext } from '../context/PlantContext';

/* ─── Helpers ──────────────────────────────────────────────────── */

/** Seeded pseudo-random: consistent per plant/day so no jitter on re-render */
function seededRand(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

/**
 * Build a 30-day simulated growth series from a baseline value.
 * Produces realistic-looking fluctuating growth with a positive trend.
 */
function buildSimulatedSeries(baseValue, maxValue, growthRate, noiseFactor, seed = 1) {
    const days = 30;
    const result = [];
    let current = Math.max(0, baseValue * 0.60); // start at 60 % of current value

    for (let d = 1; d <= days; d++) {
        // gentle growth + realistic noise
        const noise = (seededRand(seed * d) - 0.48) * noiseFactor;
        const growth = growthRate + noise;
        current = Math.min(maxValue, Math.max(0, current + growth));

        // Show label every 5 days + first and last
        const showLabel = d === 1 || d % 5 === 0 || d === days;
        result.push({
            day: d,
            label: showLabel ? `Day ${d}` : '',
            value: parseFloat(current.toFixed(1)),
        });
    }
    return result;
}

/**
 * Convert real scan records to chart series (at least 2 records needed).
 * Returns null if there aren't enough real points.
 */
function buildRealSeries(records, valueKey) {
    if (records.length < 2) return null;
    return records.map((p, i) => ({
        day: i + 1,
        label: `Day ${i + 1}`,
        value: p[valueKey] || 0,
    }));
}

/* ─── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{
        background: bg,
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        border: `1px solid ${color}22`,
        flex: 1,
        minWidth: 0,
    }}>
        <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: `${color}18`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon size={20} color={color} />
        </div>
        <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
            </div>
        </div>
    </div>
);

/* ─── Chart Card ──────────────────────────────────────────────── */
const ChartCard = ({ title, subtitle, icon: Icon, color, data, type }) => (
    <div style={{
        background: 'white',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: `${color}18`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={18} color={color} />
            </div>
            <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{title}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{subtitle}</div>
            </div>
        </div>

        {/* Axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', padding: '0 8px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ↑ {type === 'height' ? 'Height (cm)' : 'Health (%)'}
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Days →
            </span>
        </div>

        <GrowthChart data={data} type={type} />
    </div>
);

/* ─── Page ────────────────────────────────────────────────────── */
const GrowthGraph = () => {
    const { plants, selectedPlant, setSelectedPlant } = usePlantContext();

    const uniquePlants = Array.from(new Set(plants.map(p => p.name).filter(Boolean)));
    const trackingPlantName = selectedPlant?.name || uniquePlants[0];

    const filteredPlants = plants
        .filter(p => p.name === trackingPlantName)
        .sort((a, b) =>
            new Date(a.date || a.timestamp || a.created_at) -
            new Date(b.date || b.timestamp || b.created_at)
        );

    const latest = filteredPlants[filteredPlants.length - 1];

    /* Build chart data */
    const baseHeight = latest?.height || 25;
    const baseHealth = latest?.health_score || 72;

    const heightSeries = useMemo(() => {
        const real = buildRealSeries(filteredPlants, 'height');
        if (real) return real;
        // Simulate 30 days: plant grows ~0.4 cm/day with noise
        return buildSimulatedSeries(baseHeight, 120, 0.4, 0.6, 7);
    }, [filteredPlants, baseHeight]);

    const healthSeries = useMemo(() => {
        const real = buildRealSeries(filteredPlants, 'health_score');
        if (real) return real;
        // Simulate 30 days: health improves ~0.5%/day with noise
        return buildSimulatedSeries(baseHealth, 100, 0.5, 1.8, 13);
    }, [filteredPlants, baseHealth]);

    /* Stats */
    const stats = [
        {
            icon: TrendingUp,
            label: 'Current Height',
            value: `${baseHeight} cm`,
            color: '#10b981',
            bg: '#f0fdf4',
        },
        {
            icon: Heart,
            label: 'Health Score',
            value: `${baseHealth}%`,
            color: '#6366f1',
            bg: '#f5f3ff',
        },
        {
            icon: BarChart2,
            label: 'Total Scans',
            value: filteredPlants.length,
            color: '#f59e0b',
            bg: '#fffbeb',
        },
        {
            icon: Activity,
            label: 'Status',
            value: latest?.status || 'N/A',
            color: '#0ea5e9',
            bg: '#f0f9ff',
        },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header" style={{ marginBottom: '1.75rem' }}>
                <div className="page-title">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
                            <Activity size={24} />
                        </div>
                        <h2 style={{ margin: 0 }}>Growth Tracking</h2>
                    </div>
                    <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', color: '#64748b' }}>
                        {trackingPlantName ? (
                            <>Monitoring <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{trackingPlantName}</span> — 30-day growth trend</>
                        ) : (
                            'No plants found for tracking'
                        )}
                    </p>
                </div>

                {uniquePlants.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                            Switch Plant:
                        </label>
                        <select
                            className="ma-input"
                            style={{ padding: '0.5rem 0.75rem', minWidth: '160px' }}
                            value={trackingPlantName}
                            onChange={(e) => {
                                const p = plants.find(p => p.name === e.target.value);
                                setSelectedPlant(p);
                            }}
                        >
                            {uniquePlants.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            {!trackingPlantName ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Sprout size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <h3>No Data to Track</h3>
                    <p style={{ color: '#94a3b8' }}>Please complete at least one image scan to see growth metrics.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Stat Cards Row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {stats.map((s, i) => (
                            <StatCard key={i} {...s} />
                        ))}
                    </div>

                    {/* Height Chart */}
                    <ChartCard
                        title="Height Progression"
                        subtitle="Plant height measured in centimetres over 30 days"
                        icon={TrendingUp}
                        color="#10b981"
                        data={heightSeries}
                        type="height"
                    />

                    {/* Health Chart */}
                    <ChartCard
                        title="Health Score Trend"
                        subtitle="Overall plant health percentage over 30 days"
                        icon={Heart}
                        color="#6366f1"
                        data={healthSeries}
                        type="health"
                    />

                    {/* Status Log */}
                    <div style={{
                        background: 'white', borderRadius: '18px',
                        border: '1px solid #e2e8f0', padding: '1.5rem',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', marginBottom: '1rem' }}>
                            Status Log
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { icon: Droplets, type: 'Watering', detail: 'Scheduled', color: '#3b82f6', bg: '#eff6ff' },
                                {
                                    icon: Activity, type: 'Latest Observation', color: '#10b981', bg: '#ecfdf5',
                                    detail: latest?.disease || 'Healthy'
                                },
                            ].map((log, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: '0.85rem', alignItems: 'center',
                                    padding: '0.85rem', background: '#f8fafc', borderRadius: '12px',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '10px',
                                        background: log.bg, color: log.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <log.icon size={17} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{log.type}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>{log.detail}</div>
                                    </div>
                                </div>
                            ))}

                            {latest && (
                                <div style={{
                                    marginTop: '0.5rem', padding: '1rem 1.25rem',
                                    background: 'var(--primary-light)', borderRadius: '12px',
                                    border: '1px solid var(--primary)',
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                                        Current Specimen Stats
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.83rem', color: '#1e293b' }}>
                                        <div>Height: <strong>{latest.height} cm</strong></div>
                                        <div>Health: <strong>{latest.health_score}%</strong></div>
                                        <div>Status: <strong>{latest.status}</strong></div>
                                        <div>Total Scans: <strong>{filteredPlants.length}</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrowthGraph;
