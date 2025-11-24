export class WeeklySalesDto {
  week: string;
  sales: number;
  products: number;
}

export class SalesOverviewResponseDto {
  period: string;
  totalSales: number;
  totalProducts: number;
  weeklyData: WeeklySalesDto[];
}