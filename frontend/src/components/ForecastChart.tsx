import React, { useMemo } from 'react'
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
} from 'recharts'
import type { ChartPoint } from '../types'
import { formatMW } from '../utils/dataProcessing'
import { format } from 'date-fns'

interface Props {
    data: ChartPoint[]
    horizonHours: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const point: ChartPoint = payload[0]?.payload
    return (
        <div className="p-3 font-mono text-xs border rounded-lg shadow-xl bg-carbon-800 border-white/10">
            <p className="mb-2 text-white/60 font-body">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-white/70">{entry.name}:</span>
                    <span style={{ color: entry.color }} className="font-bold">
                        {entry.value != null ? formatMW(entry.value) : '—'}
                    </span>
                </div>
            ))}
            {point?.forecastPublishTime && (
                <p className="pt-2 mt-2 border-t text-white/40 border-white/10">
                    Published: {format(new Date(point.forecastPublishTime), 'dd MMM HH:mm')}
                    {point.horizonHours !== undefined && (
                        <span className="ml-1 text-wind/60">(+{point.horizonHours}h)</span>
                    )}
                </p>
            )}
        </div>
    )
}

const CustomLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
            <svg width="24" height="3">
                <line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#38bdf8" strokeWidth="2" />
            </svg>
            <span className="text-xs font-body text-white/70">Actual Generation</span>
        </div>
        <div className="flex items-center gap-2">
            <svg width="24" height="3">
                <line x1="0" y1="1.5" x2="24" y2="1.5" stroke="#00e5a0" strokeWidth="2" strokeDasharray="5 3" />
            </svg>
            <span className="text-xs font-body text-white/70">Forecast</span>
        </div>
    </div>
)

// Thin out X-axis labels to avoid crowding
function getXTickFormatter(data: ChartPoint[]) {
    const step = Math.max(1, Math.floor(data.length / 12))
    return (_val: string, index: number) => {
        if (index % step !== 0) return ''
        return data[index]?.label ?? ''
    }
}

export const ForecastChart: React.FC<Props> = ({ data, horizonHours }) => {
    const domain = useMemo(() => {
        const vals = data.flatMap((d) => [d.actual, d.forecast]).filter((v): v is number => v !== null)
        if (vals.length === 0) return [0, 10000]
        const min = Math.floor(Math.min(...vals) / 500) * 500
        const max = Math.ceil(Math.max(...vals) / 500) * 500
        return [Math.max(0, min - 500), max + 500]
    }, [data])


    const tickFormatter = useMemo(() => getXTickFormatter(data), [data])

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width='100%' height='100%' >
                <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                    <defs>
                        <filter id="glow-actual">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glow-forecast">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 6"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="label"
                        tickFormatter={tickFormatter}
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Space Mono' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={false}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={60}
                    />

                    <YAxis
                        domain={domain}
                        tickFormatter={(v) => formatMW(v)}
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Space Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={70}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Horizon label */}
                    <text
                        x="99%"
                        y={24}
                        textAnchor="end"
                        fill="rgba(255,255,255,0.25)"
                        fontSize={10}
                        fontFamily="Space Mono"
                    >
                        horizon ≥ {horizonHours}h
                    </text>

                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual"
                        stroke="#38bdf8"
                        strokeWidth={1.8}
                        dot={false}
                        connectNulls={false}
                        filter="url(#glow-actual)"
                        isAnimationActive={true}
                        animationDuration={600}
                    />

                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Forecast"
                        stroke="#00e5a0"
                        strokeWidth={1.8}
                        strokeDasharray="6 3"
                        dot={false}
                        connectNulls={false}
                        filter="url(#glow-forecast)"
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <CustomLegend />
        </div>
    )
}
