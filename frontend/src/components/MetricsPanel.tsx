import React from 'react'
import type { Metrics } from '../types'
import { formatMW } from '../utils/dataProcessing'
import { Activity, Target, TrendingUp, BarChart2 } from 'lucide-react'

interface Props {
    metrics: Metrics
    dataPoints: number
    forecastPoints: number
}

interface MetricCardProps {
    label: string
    value: string | null
    unit?: string
    icon: React.ReactNode
    color: 'wind' | 'actual' | 'amber' | 'neutral'
    description: string
}

const colors = {
    wind: { text: 'text-wind', border: 'border-wind/20', bg: 'bg-wind/5' },
    actual: { text: 'text-actual', border: 'border-actual/20', bg: 'bg-actual/5' },
    amber: { text: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5' },
    neutral: { text: 'text-white/60', border: 'border-white/10', bg: 'bg-white/5' },
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, unit, icon, color, description }) => {
    const c = colors[color]
    return (
        <div className={`relative flex flex-col gap-1.5 p-3 rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
            <div className="flex items-center gap-1.5 text-[9px] font-display tracking-[0.15em] uppercase text-white/35">
                <span className={c.text}>{icon}</span>
                {label}
            </div>
            <div className="flex items-baseline gap-1.5">
                {value !== null ? (
                    <>
                        <span className={`font-mono text-lg font-bold ${c.text}`}>{value}</span>
                        {unit && <span className="font-mono text-xs text-white/35">{unit}</span>}
                    </>
                ) : (
                    <span className="font-mono text-sm text-white/25">—</span>
                )}
            </div>
            <p className="text-[9px] font-body text-white/25 leading-snug">{description}</p>
        </div>
    )
}

function formatCorrelation(v: number | null): string | null {
    if (v === null) return null
    return v.toFixed(3)
}

function mbeLabel(mbe: number | null): 'wind' | 'actual' | 'amber' {
    if (mbe === null) return 'neutral' as never
    return mbe > 0 ? 'wind' : 'actual'
}

export const MetricsPanel: React.FC<Props> = ({ metrics, dataPoints, forecastPoints }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-display tracking-[0.2em] uppercase text-white/40">
                    Accuracy Metrics
                </h3>
                <span className="text-[9px] font-mono text-white/25">
                    {forecastPoints}/{dataPoints} matched
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <MetricCard
                    label="RMSE"
                    value={metrics.rmse !== null ? formatMW(metrics.rmse) : null}
                    icon={<Activity size={9} />}
                    color="actual"
                    description="Root mean square error — penalises large deviations"
                />
                <MetricCard
                    label="MAE"
                    value={metrics.mae !== null ? formatMW(metrics.mae) : null}
                    icon={<Target size={9} />}
                    color="actual"
                    description="Mean absolute error — average magnitude of errors"
                />
                <MetricCard
                    label="Bias (MBE)"
                    value={metrics.mbe !== null ? (metrics.mbe >= 0 ? '+' : '') + formatMW(metrics.mbe) : null}
                    icon={<TrendingUp size={9} />}
                    color={mbeLabel(metrics.mbe)}
                    description={`Systematic ${metrics.mbe !== null && metrics.mbe > 0 ? 'over-forecast' : 'under-forecast'} tendency`}
                />
                <MetricCard
                    label="Correlation"
                    value={formatCorrelation(metrics.correlation)}
                    icon={<BarChart2 size={9} />}
                    color={
                        metrics.correlation !== null
                            ? metrics.correlation > 0.9 ? 'wind' : metrics.correlation > 0.7 ? 'amber' : 'actual'
                            : 'neutral'
                    }
                    description="Pearson r — forecast-actual linear agreement"
                />
            </div>

            {/* Coverage bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-[9px]">
                    <span className="font-display tracking-widest uppercase text-white/35">Forecast Coverage</span>
                    <span className="font-mono text-wind">{metrics.coverage}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-wind/60 rounded-full transition-all duration-700"
                        style={{ width: `${metrics.coverage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
