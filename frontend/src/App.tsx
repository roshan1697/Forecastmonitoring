import React from 'react'
import { Wind, AlertTriangle, Database } from 'lucide-react'
import { ControlPanel } from './components/ControlPanel'
import { ForecastChart } from './components/ForecastChart'
import { MetricsPanel } from './components/MetricsPanel'
import { useWindData } from './hooks/useWindData'
import type { DateRange } from './types'

export default function App() {
  const { chartData, metrics, loadState, error, fetch } = useWindData()

  const handleFetch = (range: DateRange, horizonHours: number) => {
    fetch(range, horizonHours)
  }

  const [currentHorizon, setCurrentHorizon] = React.useState(4)

  const handleFetchWithHorizon = (range: DateRange, horizonHours: number) => {
    setCurrentHorizon(horizonHours)
    fetch(range, horizonHours)
  }

  const withActual   = chartData.filter((d) => d.actual   !== null).length
  const withForecast = chartData.filter((d) => d.forecast !== null).length
// console.log(chartData)
  return (
    <div className="flex flex-col min-h-screen overflow-hidden text-white bg-carbon-950">
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,160,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56,189,248,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 border-b border-white/5 bg-carbon-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-screen-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-wind/10 border-wind/20">
                <Wind size={16} className="text-wind" />
              </div>
              <span className="absolute w-2 h-2 rounded-full -top-1 -right-1 bg-wind animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl tracking-[0.05em] uppercase text-white leading-none">
                Wind<span className="text-wind">Cast</span> Monitor
              </h1>
              <p className="text-[9px] font-mono text-white/30 tracking-[0.1em] mt-0.5">
                UK National Grid · Elexon BMRS · Jan 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-actual" />
              <span className="text-white/40">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-wind" />
              <span className="text-white/40">Forecast</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-white/25">
              <Database size={10} />
              <span>FUELHH · WINDFOR</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className="relative z-10 flex flex-1 w-full gap-5 px-4 py-5 mx-auto overflow-hidden max-w-screen-2xl md:px-6">

        {/* ── Sidebar ── */}
        <aside className="flex flex-col flex-shrink-0 gap-4 w-72">
          {/* Controls */}
          <div className="p-4 border bg-carbon-800/70 border-white/6 rounded-2xl backdrop-blur-sm shadow-inner-panel">
            <h2 className="text-[10px] font-display tracking-[0.2em] uppercase text-white/40 mb-4">
              Query Parameters
            </h2>
            <ControlPanel onFetch={handleFetchWithHorizon} loadState={loadState} />
          </div>

          {/* Metrics */}
          {metrics && loadState === 'success' && (
            <div className="p-4 border bg-carbon-800/70 border-white/6 rounded-2xl backdrop-blur-sm shadow-inner-panel">
              <MetricsPanel
                metrics={metrics}
                dataPoints={withActual}
                forecastPoints={withForecast}
              />
            </div>
          )}

          {/* Legend info */}
          {loadState === 'success' && chartData.length > 0 && (
            <div className="p-3 space-y-2 border bg-carbon-800/40 border-white/5 rounded-xl">
              <p className="text-[9px] font-display tracking-widest uppercase text-white/25">
                Reading the Chart
              </p>
              <div className="space-y-1.5 text-[9px] font-body text-white/35 leading-relaxed">
                <p>
                  <span className="font-bold text-actual">Blue solid</span> — measured wind power (FUELHH)
                </p>
                <p>
                  <span className="font-bold text-wind">Green dashed</span> — latest forecast published ≥ <span className="font-mono text-wind">{currentHorizon}h</span> before each target
                </p>
                <p>Gaps in forecast line indicate no valid forecast was available for that horizon.</p>
              </div>
            </div>
          )}
        </aside>

        {/* ── Chart area ── */}
        <section className="flex flex-col flex-1 min-w-0 gap-4">
          {/* Chart panel */}
          <div className="relative flex-1 p-4 pb-2 border bg-carbon-800/70 border-white/6 rounded-2xl backdrop-blur-sm shadow-inner-panel">

            {/* Chart header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-base tracking-[0.1em] uppercase text-white/80">
                  Generation vs Forecast
                </h2>
                <p className="text-[10px] font-mono text-white/30 mt-0.5">
                  National-level wind power · MW
                </p>
              </div>
              {loadState === 'success' && chartData.length > 0 && (
                <div className="flex items-center gap-3 text-[10px] font-mono text-white/35">
                  <span>{withActual} actual pts</span>
                  <span className="text-white/15">·</span>
                  <span>{withForecast} forecast pts</span>
                </div>
              )}
            </div>

            {/* States */}
            {loadState === 'idle' && (
              <EmptyState
                icon={<Wind size={32} className="text-wind/30" />}
                title="Select a time range"
                subtitle="Choose start & end dates and click Load Forecast Data to begin"
              />
            )}

            {loadState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl">
                <div className="relative">
                  <div className="w-12 h-12 border-2 rounded-full border-wind/20 animate-spin border-t-wind" />
                  <Wind size={20} className="absolute -translate-x-1/2 -translate-y-1/2 text-wind/60 top-1/2 left-1/2" />
                </div>
                <p className="font-mono text-xs tracking-widest text-white/40">FETCHING GRID DATA…</p>
              </div>
            )}

            {loadState === 'error' && (
              <EmptyState
                icon={<AlertTriangle size={32} className="text-amber-400/60" />}
                title="Could not load data"
                subtitle={error ?? 'Check your network connection and try again'}
                variant="error"
              />
            )}

            {loadState === 'success' && chartData.length === 0 && (
              <EmptyState
                icon={<Database size={32} className="text-white/20" />}
                title="No data found"
                subtitle="Try a different date range within January 2024"
              />
            )}
          
            {loadState === 'success' && chartData.length > 0 && (
              <div className="h-[calc(100%-3rem)]" style={{ minHeight: 320 }}>
                <ForecastChart data={chartData} horizonHours={currentHorizon} />
              
                
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  variant?: 'default' | 'error'
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, variant = 'default' }) => (
  <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
    {icon}
    <div className="space-y-1 text-center">
      <p className={`font-display text-sm tracking-wider uppercase ${variant === 'error' ? 'text-amber-400/70' : 'text-white/40'}`}>
        {title}
      </p>
      <p className="max-w-xs text-xs font-body text-white/25">{subtitle}</p>
    </div>
  </div>
)
