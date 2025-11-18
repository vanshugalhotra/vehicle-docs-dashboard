export type StatsBucketType = 'day' | 'week' | 'month' | 'year';

export interface AggregatedBucket {
  bucket: string;
  count: number;
}

export interface TimeSeriesPoint {
  x: string;
  y: number;
}
