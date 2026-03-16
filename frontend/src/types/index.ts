export interface ActualRecord {
    startTime: string;
    settlementDate: string;
    settlementPeriod: number;
    fuelType: string;
    generation: number;
}

export interface ForecastRecord {
    startTime: string;
    publishTime: string;
    generation: number;
    boundary?: string;
}

export interface ChartPoint {
    timestamp: number;          // Unix ms
    label: string;              // Formatted label for axis
    actual: number | null;
    forecast: number | null;
    forecastPublishTime?: string;
    horizonHours?: number;
}

export interface Metrics {
    rmse: number | null;
    mae: number | null;
    mbe: number | null;          // Mean Bias Error
    correlation: number | null;
    coverage: number;            // % of time steps with forecast
}

export interface DateRange {
    start: Date;
    end: Date;
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error';
