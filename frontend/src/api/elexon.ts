import { ActualRecord, ForecastRecord } from '../types'
import { format } from 'date-fns'

const BASE = '/bmrs-api'

function toISOParam(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

async function fetchStream<T>(url: string): Promise<T[]> {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`)
    }

    const contentType = res.headers.get('content-type') ?? ''

    // Handle NDJSON stream
    if (contentType.includes('application/x-ndjson') || contentType.includes('text/plain')) {
        const text = await res.text()
        return text
            .split('\n')
            .filter(Boolean)
            .map((line) => JSON.parse(line) as T)
    }

    // Handle standard JSON (array or wrapped)
    const json = await res.json()
    if (Array.isArray(json)) return json as T[]
    if (json.data && Array.isArray(json.data)) return json.data as T[]
    if (json.items && Array.isArray(json.items)) return json.items as T[]
    return [] as T[]
}

export async function fetchActuals(start: Date, end: Date): Promise<ActualRecord[]> {
    const params = new URLSearchParams({
        from: toISOParam(start),
        to: toISOParam(end),
        fuelType: 'WIND',
    })
    const records = await fetchStream<ActualRecord>(`${BASE}/datasets/FUELHH/stream?${params}`)
    return records.filter((r) => r.fuelType === 'WIND' || !r.fuelType)
}

export async function fetchForecasts(start: Date, end: Date): Promise<ForecastRecord[]> {
    // Extend start back 48 hrs to catch forecasts published well before the window
    const extendedStart = new Date(start.getTime() - 48 * 60 * 60 * 1000)

    const params = new URLSearchParams({
        from: toISOParam(extendedStart),
        to: toISOParam(end),
    })
    return fetchStream<ForecastRecord>(`${BASE}/datasets/WINDFOR/stream?${params}`)
}

// Format date for display in the date input (YYYY-MM-DDThh:mm)
export function formatDateTimeLocal(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm")
}
