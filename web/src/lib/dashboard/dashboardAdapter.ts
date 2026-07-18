import { dashboardMockData } from "@/components/dashboard/mockData";

export type DashboardData = typeof dashboardMockData;

/**
 * Canonical Dashboard Adapter
 *
 * SD-001 (Sprint Execution Directive)
 *
 * This adapter is the single entry point for dashboard data.
 *
 * Current implementation:
 *     dashboardMockData
 *
 * Future implementation:
 *     authenticated runtime data
 */
export function getDashboardData(): DashboardData {
  return dashboardMockData;
}
