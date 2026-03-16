import React, { useState } from 'react'
import type { DateRange, LoadState } from '../types'
import { formatDateTimeLocal } from '../api/elexon'
import { CalendarDays, Wind, SlidersHorizontal, Zap } from 'lucide-react'

// Jan 2024 bounds
const JAN_MIN = '2024-01-01T00:00'
const JAN_MAX = '2024-01-31T23:30'
const JAN_DEFAULT_START = new Date('2024-01-07T00:00:00Z')
const JAN_DEFAULT_END = new Date('2024-01-14T00:00:00Z')

interface Props {
    onFetch: (range: DateRange, horizonHours: number) => void
    loadState: LoadState
}

export const ControlPanel: React.FC<Props> = ({ onFetch, loadState }) => {
    const [startStr, setStartStr] = useState(formatDateTimeLocal(JAN_DEFAULT_START))
    const [endStr, setEndStr] = useState(formatDateTimeLocal(JAN_DEFAULT_END))
    const [horizon, setHorizon] = useState(4)

    const handleSubmit = () => {
        const start = new Date(startStr)
        const end = new Date(endStr)
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return
        onFetch({ start, end }, horizon)
    }

    const isLoading = loadState === 'loading'

    return (
        <div className="flex flex-col gap-4">
            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.15em] uppercase text-white/40">
                        <CalendarDays size={11} />
                        Start Time
                    </label>
                    <input
                        type="datetime-local"
                        value={startStr}
                        min={JAN_MIN}
                        max={JAN_MAX}
                        onChange={(e) => setStartStr(e.target.value)}
                        className="
              bg-carbon-700 border border-white/10 rounded-lg px-3 py-2
              text-white/80 text-xs font-mono
              focus:outline-none focus:border-actual/50 focus:ring-1 focus:ring-actual/20
              transition-colors
              [color-scheme:dark]
            "
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.15em] uppercase text-white/40">
                        <CalendarDays size={11} />
                        End Time
                    </label>
                    <input
                        type="datetime-local"
                        value={endStr}
                        min={JAN_MIN}
                        max={JAN_MAX}
                        onChange={(e) => setEndStr(e.target.value)}
                        className="
              bg-carbon-700 border border-white/10 rounded-lg px-3 py-2
              text-white/80 text-xs font-mono
              focus:outline-none focus:border-actual/50 focus:ring-1 focus:ring-actual/20
              transition-colors
              [color-scheme:dark]
            "
                    />
                </div>
            </div>

            {/* Horizon slider */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] font-display tracking-[0.15em] uppercase text-white/40">
                        <SlidersHorizontal size={11} />
                        Forecast Horizon
                    </label>
                    <div className="flex items-center gap-1">
                        <span className="font-mono text-sm font-bold text-wind">{horizon}</span>
                        <span className="text-xs text-white/40 font-body">hrs</span>
                    </div>
                </div>

                <div className="relative">
                    <input
                        type="range"
                        min={0}
                        max={48}
                        step={1}
                        value={horizon}
                        onChange={(e) => setHorizon(Number(e.target.value))}
                        className="horizon-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #00e5a0 0%, #00e5a0 ${(horizon / 48) * 100}%, rgba(255,255,255,0.1) ${(horizon / 48) * 100}%, rgba(255,255,255,0.1) 100%)`
                        }}
                    />
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] font-mono text-white/25">0h</span>
                        <span className="text-[9px] font-mono text-white/25">12h</span>
                        <span className="text-[9px] font-mono text-white/25">24h</span>
                        <span className="text-[9px] font-mono text-white/25">36h</span>
                        <span className="text-[9px] font-mono text-white/25">48h</span>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="
          relative mt-1 flex items-center justify-center gap-2
          bg-wind/10 hover:bg-wind/20 border border-wind/30 hover:border-wind/50
          text-wind font-display tracking-widest uppercase text-sm
          rounded-lg px-4 py-2.5
          transition-all duration-200
          disabled:opacity-40 disabled:cursor-not-allowed
          group
        "
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        Fetching Data…
                    </>
                ) : (
                    <>
                        <Wind size={14} className="group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                        Load Forecast Data
                    </>
                )}
            </button>

            {/* Jan 2024 note */}
            <p className="text-[9px] text-white/25 font-mono text-center">
                ⚡ Dataset scope: January 2024 · UK National Grid
            </p>
        </div>
    )
}

const LoadingSpinner = () => (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round" />
    </svg>
)
