import type { ActualRecord, ForecastRecord, ChartPoint, Metrics } from '../types'
import { format, parseISO } from 'date-fns'

/**
 * For each target time T in the actuals:
 *   find the latest forecast where:
 *     forecast.startTime === T
 *     forecast.publishTime <= T - horizonHours
 *     (T - forecast.publishTime) <= 48 hours
 */
export function buildChartData(
    actuals: ActualRecord[],
    forecasts: ForecastRecord[],
    horizonHours: number
): ChartPoint[] {
    // Group forecasts by startTime
    const forecastsByTarget = new Map<string, ForecastRecord[]>()
    for (const f of forecasts) {
        const key = normaliseTime(f.startTime)
        if (!forecastsByTarget.has(key)) forecastsByTarget.set(key, [])
        forecastsByTarget.get(key)!.push(f)
    }

    const points: ChartPoint[] = []

    for (const actual of actuals) {
        const targetMs = new Date(actual.startTime).getTime()
        const targetKey = normaliseTime(actual.startTime)

        // const candidates = (forecastsByTarget.get(targetKey) ?? []).filter((f) => {
        //   const pubMs = new Date(f.publishTime).getTime()
        //   const horizonMs = horizonHours * 60 * 60 * 1000

        //   const maxHorizonMs = 48 * 60 * 60 * 1000
        //   const diff = targetMs - pubMs
        //   return diff >= horizonMs && diff <= maxHorizonMs
        // })

        let candidates: ForecastRecord[] = []
        let currentHour = horizonHours
        const maxAllowedHorizon = 48

        while (candidates.length === 0 && currentHour <= maxAllowedHorizon) {
            const horizonMs = currentHour * 60 * 60 * 1000
            const maxHorizonMs = (currentHour + 44) * 60 * 60 * 1000
            candidates = (forecastsByTarget.get(targetKey) ?? []).filter((f) => {
                const pubMs = new Date(f.publishTime).getTime()

                const diff = targetMs - pubMs
                return diff >= horizonMs && diff <= maxHorizonMs
            })
            if (candidates.length === 0) {
                currentHour++
            }
        }



        console.log(candidates)

        // Pick latest publishTime among candidates
        const best =
            candidates.length > 0
                ? candidates.reduce((a, b) =>
                    new Date(a.publishTime) > new Date(b.publishTime) ? a : b
                )
                : null

        const horizonHrs = best
            ? (targetMs - new Date(best.publishTime).getTime()) / 3_600_000
            : undefined

        points.push({
            timestamp: targetMs,
            label: format(new Date(actual.startTime), 'dd MMM HH:mm'),
            actual: actual.generation ?? null,
            forecast: best ? best.generation : null,
            forecastPublishTime: best?.publishTime,
            horizonHours: horizonHrs !== undefined ? Math.round(horizonHrs * 10) / 10 : undefined,
        })
    }

    return points.sort((a, b) => a.timestamp - b.timestamp)
}

function normaliseTime(iso: string): string {
    // Normalise to minute precision for matching
    return new Date(iso).toISOString().slice(0, 16)
}

export function computeMetrics(points: ChartPoint[]): Metrics {
    const paired = points.filter((p) => p.actual !== null && p.forecast !== null)

    if (paired.length === 0) {
        return { rmse: null, mae: null, mbe: null, correlation: null, coverage: 0 }
    }

    const n = paired.length
    let sumSqErr = 0
    let sumAbsErr = 0
    let sumErr = 0
    let sumA = 0
    let sumF = 0
    let sumA2 = 0
    let sumF2 = 0
    let sumAF = 0

    for (const p of paired) {
        const a = p.actual!
        const f = p.forecast!
        const err = f - a
        sumSqErr += err * err
        sumAbsErr += Math.abs(err)
        sumErr += err
        sumA += a
        sumF += f
        sumA2 += a * a
        sumF2 += f * f
        sumAF += a * f
    }

    const meanA = sumA / n
    const meanF = sumF / n
    let covAF = 0
    let varA = 0
    let varF = 0
    for (const p of paired) {
        const a = p.actual! - meanA
        const f = p.forecast! - meanF
        covAF += a * f
        varA += a * a
        varF += f * f
    }
    const correlation =
        varA > 0 && varF > 0 ? covAF / Math.sqrt(varA * varF) : null

    const withActuals = points.filter((p) => p.actual !== null).length
    const coverage =
        withActuals > 0
            ? Math.round((paired.length / withActuals) * 100)
            : 0

    return {
        rmse: Math.sqrt(sumSqErr / n),
        mae: sumAbsErr / n,
        mbe: sumErr / n,
        correlation,
        coverage,
    }
}

export function formatMW(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(1)} GW`
    return `${Math.round(value)} MW`
}
