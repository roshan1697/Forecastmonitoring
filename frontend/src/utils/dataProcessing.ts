import type { ActualRecord, ForecastRecord, ChartPoint, Metrics } from '../types'
import { format, parseISO } from 'date-fns'

/**
 * For each target time T in the actuals:
 *   find the latest forecast where:
 *     forecast.startTime === T
 *     forecast.publishTime <= T - horizonHours
 *     (T - forecast.publishTime) <= 48 hours
 */
function formatLabel(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
export function buildChartData(
    actuals: ActualRecord[],
    forecasts: ForecastRecord[],
    horizonHours: number
): ChartPoint[] {
    // Group forecasts by startTime

    
function processWindData(
  actual: ActualRecord[],
  forecast: ForecastRecord[]
): ChartPoint[] {
  const actualMap = new Map<number, number>(
    actual.map((a) => [new Date(a.startTime).getTime(), a.generation])
  );

  const forecastMap = new Map<number, number>(
    forecast.map((f) => [new Date(f.startTime).getTime(), f.generation])
  );

  const allTimestamps = new Set<number>([
    ...actualMap.keys(),
    ...forecastMap.keys(),
  ]);

  return [...allTimestamps]
    .sort((a, b) => a - b)
    .map((timestamp) => ({
      timestamp,
      label: formatLabel(new Date(timestamp).toISOString()),
      actual: actualMap.get(timestamp) ?? null,
      forecast: forecastMap.get(timestamp) ?? null,
    }));
}


const aligned = processWindData(actuals, forecasts);
console.log(aligned);
    return aligned
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
