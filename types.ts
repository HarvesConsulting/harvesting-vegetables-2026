
export interface Crop {
  name: string;
  startDate: string;
  endDate: string;
  yield: number;
}

export interface ChartData extends Crop {
  startDay: number;
  harvestDuration: number;
  color: string;
}
