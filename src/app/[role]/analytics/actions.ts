
'use server';

import { getDashboardData } from "@/ai/flows/get-dashboard-data";
import type { DashboardData } from "@/ai/flows/get-dashboard-data.types";

export async function getDashboardDataAction(): Promise<DashboardData> {
  return await getDashboardData();
}
