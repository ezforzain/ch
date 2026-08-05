// Transcribed exactly from source class fields (months12, days14,
// monthlyLeadsData, whatsappClicks/Conv, callbackData, customerGrowthData,
// statCardTrends, chartCfgs, reportCards, revMonths/leadMonths) in
// Admin Panel.dc.html. chartConfigs values are consumed directly as the
// `data`/`options` props of react-chartjs-2's <Line>/<Bar>/<Doughnut>.

export const months12 = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
export const days14 = Array.from({ length: 14 }, (_, i) => `D${i + 1}`);

export const monthlyLeadsData = [180, 195, 210, 225, 205, 240, 255, 270, 290, 310, 360, 412];
export const whatsappClicks = [38, 42, 35, 50, 55, 48, 60, 58, 65, 70, 66, 72, 75, 80];
export const whatsappConv = [8, 9, 8.5, 10, 11, 10.5, 12, 11.5, 13, 13.5, 12.8, 14, 14.5, 15];
export const callbackData = [40, 45, 42, 50, 55, 60, 58, 65, 70, 68, 75, 91];
export const customerGrowthData = [22, 25, 28, 30, 27, 33, 36, 38, 42, 45, 50, 58];

// [label, value, icon, iconBg] — transcribed exactly from source `statCards`.
// Four of the eight values are derived from live collection data
// (leads/projects counts + a fixed baseline offset, exactly as in source).
export function statCardBase(data) {
  const leads = data.leads, projects = data.projects;
  const newLeadsCount = leads.filter((l) => l.status === 'New').length;
  return [
    ['Total leads', String(leads.length + 1279), '▤', '#F7ECD9'],
    ['Today’s leads', String(newLeadsCount + 21), '◈', '#E3EEDF'],
    ['Monthly leads', '412', '▣', '#F7ECD9'],
    ['Completed projects', String(projects.filter((p) => p.status === 'Completed').length + 94), '✓', '#E3EEDF'],
    ['Pending projects', String(projects.filter((p) => p.status !== 'Completed').length + 12), '◷', '#F6E2DC'],
    ['Revenue', 'PKR 18.4M', '₨', '#F7ECD9'],
    ['WhatsApp clicks', '638', '✉', '#E3EEDF'],
    ['Callback requests', '91', '☏', '#F6E2DC'],
  ];
}

export const statCardTrends = [
  { data: [900, 980, 1020, 1100, 1150, 1200, 1284], color: '#E2A347' },
  { data: [14, 17, 15, 19, 21, 20, 23], color: '#2A4E7A' },
  { data: [250, 270, 290, 310, 330, 360, 412], color: '#E2A347' },
  { data: [70, 76, 80, 84, 88, 92, 96], color: '#3E7C4A' },
  { data: [20, 18, 17, 16, 15, 14, 14], color: '#C1442A' },
  { data: [12.1, 13.4, 14.2, 15.8, 16.5, 17.6, 18.4], color: '#E2A347' },
  { data: [420, 460, 500, 540, 580, 610, 638], color: '#2A4E7A' },
  { data: [55, 60, 65, 70, 75, 85, 91], color: '#3E7C4A' },
];

export function sparkConfig(trend) {
  return {
    data: {
      labels: trend.data.map((_, idx) => idx),
      datasets: [
        {
          data: trend.data,
          borderColor: trend.color,
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    },
  };
}

export const chartConfigs = {
  monthlyLeads: {
    type: 'line',
    data: {
      labels: months12,
      datasets: [{ label: 'Leads', data: monthlyLeadsData, borderColor: '#E2A347', backgroundColor: 'rgba(226,163,71,0.15)', fill: true, tension: 0.35, pointRadius: 3 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  },
  leadSources: {
    type: 'doughnut',
    data: {
      labels: ['Website', 'WhatsApp', 'Phone Calls', 'Marketplace', 'Referral'],
      datasets: [{ data: [156, 110, 62, 49, 33], backgroundColor: ['#E2A347', '#2A4E7A', '#3E7C4A', '#C1442A', '#8A6D3B'] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } },
  },
  serviceRequests: {
    type: 'bar',
    data: {
      labels: ['Solar Install', 'Backup/UPS', 'CCTV', 'Wiring', 'Generator', 'Comm. Solar'],
      datasets: [{ label: 'Requests', data: [142, 88, 64, 51, 37, 29], backgroundColor: '#E2A347', borderRadius: 6 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  },
  projectStatus: {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
      datasets: [{ data: [96, 14, 8, 4], backgroundColor: ['#3E7C4A', '#2A4E7A', '#E2A347', '#C1442A'] }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } },
  },
  whatsapp: {
    type: 'line',
    data: {
      labels: days14,
      datasets: [
        { label: 'Clicks', data: whatsappClicks, borderColor: '#2A4E7A', backgroundColor: 'rgba(42,78,122,0.12)', tension: 0.35, yAxisID: 'y' },
        { label: 'Conversion %', data: whatsappConv, borderColor: '#E2A347', backgroundColor: 'rgba(226,163,71,0.1)', tension: 0.35, yAxisID: 'y1' },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { y: { beginAtZero: true, position: 'left' }, y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } } },
    },
  },
  callback: {
    type: 'line',
    data: {
      labels: months12,
      datasets: [{ label: 'Callbacks', data: callbackData, borderColor: '#C1442A', backgroundColor: 'rgba(193,68,42,0.18)', fill: true, tension: 0.35, pointRadius: 2 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  },
  topCitiesChart: {
    type: 'bar',
    data: {
      labels: ['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala'],
      datasets: [{ label: 'Projects', data: [62, 38, 24, 15, 11, 9], backgroundColor: '#3E7C4A', borderRadius: 6 }],
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } },
  },
  topProducts: {
    type: 'bar',
    data: {
      labels: ['5kW Hybrid Inverter', '180W Solar Panel', '12V 200Ah Battery', 'CCTV Camera Kit', 'MPPT Controller'],
      datasets: [{ label: 'Units sold', data: [84, 76, 65, 52, 41], backgroundColor: '#2A4E7A', borderRadius: 6 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  },
  customerGrowth: {
    type: 'line',
    data: {
      labels: months12,
      datasets: [{ label: 'New customers', data: customerGrowthData, borderColor: '#3E7C4A', backgroundColor: 'rgba(62,124,74,0.15)', fill: true, tension: 0.35, pointRadius: 2 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  },
};

export const reportCards = [
  { label: 'Leads this month', value: '412' },
  { label: 'Conversion rate', value: '23%' },
  { label: 'Avg. order value', value: 'PKR 52,300' },
  { label: 'Repeat customers', value: '34%' },
];

export const revMonths = [['Mar', 62], ['Apr', 74], ['May', 68], ['Jun', 81], ['Jul', 90], ['Aug', 76]];
