
/**
 * @fileOverview Types for the static analytics data.
 */

export interface DashboardData {
  stats: {
    totalEmployees: number;
    attritionRate: number;
    avgTenure: string;
    hiringPipeline: number;
  };
  headcountByDept: {
    department: string;
    count: number;
  }[];
  recruitmentFunnel: {
    stage: string;
    count: number;
  }[];
}
