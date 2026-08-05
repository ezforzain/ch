// One-time Chart.js component registration for react-chartjs-2's
// <Line>/<Bar>/<Doughnut> used throughout the admin panel. Imported once
// (side-effect only) from AdminApp.jsx.
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);
