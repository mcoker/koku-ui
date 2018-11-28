import { OcpReportType } from 'api/ocpReports';
import { ChartType } from 'components/commonChart/chartUtils';
import { OcpDashboardTab, OcpDashboardWidget } from './ocpDashboardCommon';

let currrentId = 0;
const getId = () => currrentId++;

// Todo: projects & clusters tabs
export const costSummaryWidget: OcpDashboardWidget = {
  id: getId(),
  titleKey: 'ocp_details.total_charge',
  reportType: OcpReportType.cost,
  details: {
    labelKey: 'ocp_details.total_charge',
    formatOptions: {
      fractionDigits: 2,
    },
  },
  trend: {
    titleKey: 'ocp_dashboard.cost_trend_title',
    formatOptions: {},
    type: ChartType.rolling,
  },
  topItems: {
    formatOptions: {},
  },
  availableTabs: [
    OcpDashboardTab.services,
    OcpDashboardTab.accounts,
    OcpDashboardTab.regions,
  ],
  currentTab: OcpDashboardTab.services,
};

// Todo: cpu
export const storageWidget: OcpDashboardWidget = {
  id: getId(),
  titleKey: 'ocp_dashboard.cpu_usage_title',
  reportType: OcpReportType.storage,
  details: {
    labelKey: 'ocp_dashboard.storage_detail_label',
    formatOptions: {
      fractionDigits: 0,
    },
  },
  trend: {
    titleKey: 'ocp_dashboard.storage_trend_title',
    formatOptions: {
      fractionDigits: 2,
    },
    type: ChartType.daily,
  },
  topItems: {
    formatOptions: {},
  },
  availableTabs: [OcpDashboardTab.accounts, OcpDashboardTab.regions],
  currentTab: OcpDashboardTab.accounts,
};

// Todo: memory
export const computeWidget: OcpDashboardWidget = {
  id: getId(),
  titleKey: 'ocp_dashboard.cpu_allocation_title',
  reportType: OcpReportType.instanceType,
  details: {
    labelKey: 'ocp_dashboard.compute_detail_label',
    formatOptions: {
      fractionDigits: 0,
    },
  },
  trend: {
    titleKey: 'ocp_dashboard.compute_trend_title',
    formatOptions: {
      fractionDigits: 2,
    },
    type: ChartType.daily,
  },
  topItems: {
    formatOptions: {},
  },
  availableTabs: [
    OcpDashboardTab.instanceType,
    OcpDashboardTab.accounts,
    OcpDashboardTab.regions,
  ],
  currentTab: OcpDashboardTab.instanceType,
};
