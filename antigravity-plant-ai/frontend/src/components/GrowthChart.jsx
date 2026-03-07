import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

/* ── Custom Tooltip ────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, type }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0]?.value;
    const unit = type === 'height' ? ' cm' : '%';
    const color = type === 'height' ? '#10b981' : '#6366f1';
    return (
        <div style={{
            background: '#fff',
            border: `1px solid ${color}33`,
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            fontFamily: 'inherit',
            minWidth: '130px'
        }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                {label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>
                {val !== undefined ? `${val}${unit}` : '—'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {type === 'height' ? 'Plant Height' : 'Health Score'}
            </div>
        </div>
    );
};

/* ── Main Component ────────────────────────────────────────────── */
const GrowthChart = ({ data = [], type = 'height' }) => {
    const isHeight = type === 'height';
    const dataKey = isHeight ? 'height' : 'health';
    const unit = isHeight ? ' cm' : '%';
    const color = isHeight ? '#10b981' : '#6366f1';
    const gradientId = isHeight ? 'heightGrad' : 'healthGrad';

    // Y-axis domain: give a nice range with padding
    const values = data.map(d => d[dataKey]).filter(v => v !== undefined && v !== null);
    const minVal = values.length ? Math.max(0, Math.floor(Math.min(...values) * 0.88)) : 0;
    const maxVal = values.length ? Math.ceil(Math.max(...values) * 1.12) : isHeight ? 60 : 100;

    // reference average line
    const avg = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : null;

    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart
                data={data}
                margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    vertical={false}
                />

                {/* X axis — shows "Day N" labels */}
                <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    dy={8}
                    interval="preserveStartEnd"
                />

                {/* Y axis — shows values with unit */}
                <YAxis
                    domain={[minVal, maxVal]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(v) => `${v}${unit}`}
                    width={isHeight ? 52 : 44}
                />

                <Tooltip
                    content={<CustomTooltip type={type} />}
                    cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
                />

                {/* Average reference line */}
                {avg !== null && (
                    <ReferenceLine
                        y={avg}
                        stroke={color}
                        strokeDasharray="6 3"
                        strokeOpacity={0.4}
                        label={{
                            value: `Avg: ${avg}${unit}`,
                            position: 'insideTopRight',
                            fill: color,
                            fontSize: 10,
                            fontWeight: 700
                        }}
                    />
                )}

                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#${gradientId})`}
                    dot={(props) => {
                        const isLast = props.index === data.length - 1;
                        return (
                            <circle
                                key={props.index}
                                cx={props.cx}
                                cy={props.cy}
                                r={isLast ? 6 : 3.5}
                                fill={isLast ? color : '#fff'}
                                stroke={color}
                                strokeWidth={isLast ? 0 : 2}
                            />
                        );
                    }}
                    activeDot={{ r: 7, fill: color, stroke: '#fff', strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default GrowthChart;
