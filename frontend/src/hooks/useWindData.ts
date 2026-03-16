import { useState, useCallback } from 'react'
import { fetchActuals, fetchForecasts } from '../api/elexon'
import { buildChartData, computeMetrics } from '../utils/dataProcessing'
import type { ChartPoint, DateRange, LoadState, Metrics } from '../types'

interface UseWindDataResult {
    chartData: ChartPoint[]
    metrics: Metrics | null
    loadState: LoadState
    error: string | null
    fetch: (range: DateRange, horizonHours: number) => Promise<void>
}

export function useWindData(): UseWindDataResult {
    const [chartData, setChartData] = useState<ChartPoint[]>([])
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loadState, setLoadState] = useState<LoadState>('idle')
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async (range: DateRange, horizonHours: number) => {
        setLoadState('loading')
        setError(null)
        try {
            const [actuals, forecasts] = await Promise.all([
                fetchActuals(range.start, range.end),
                fetchForecasts(range.start, range.end),
            ])
            const points = buildChartData(actuals, forecasts, horizonHours)

            // console.log(points)
            const m = computeMetrics(points)

            setChartData(points)
            setMetrics(m)
            setLoadState('success')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            setError(msg)
            setLoadState('error')
        }
    }, [])

    return { chartData, metrics, loadState, error, fetch: fetchData }
}
