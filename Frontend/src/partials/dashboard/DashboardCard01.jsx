import React from "react";
import { Link } from "react-router-dom";
import LineChart from "../../charts/LineChart01";
import { chartAreaGradient } from "../../charts/ChartjsConfig";
import EditMenu from "../../components/DropdownEditMenu";
import { tailwindConfig, hexToRGB } from "../../utils/Utils";

function DashboardCard01() {
  const chartData = {
    labels: [
      "12-01-2022",
      "01-01-2023",
      "02-01-2023",
      "03-01-2023",
      "04-01-2023",
      "05-01-2023",
      "06-01-2023",
      "07-01-2023",
      "08-01-2023",
      "09-01-2023",
      "10-01-2023",
      "11-01-2023",
      "12-01-2023",
      "01-01-2024",
      "02-01-2024",
      "03-01-2024",
      "04-01-2024",
      "05-01-2024",
      "06-01-2024",
      "07-01-2024",
      "08-01-2024",
      "09-01-2024",
      "10-01-2024",
      "11-01-2024",
      "12-01-2024",
      "01-01-2025",
    ],
    datasets: [
      {
        data: [
          732, 610, 610, 504, 504, 504, 349, 349, 504, 342, 504, 610, 391, 192,
          154, 273, 191, 191, 126, 263, 349, 252, 423, 622, 470, 532,
        ],
        fill: true,
        backgroundColor: function (context) {
          const { ctx, chartArea } = context.chart;
          return chartAreaGradient(ctx, chartArea, [
            {
              stop: 0,
              color: `rgba(${hexToRGB(
                tailwindConfig().theme.colors.violet[500]
              )}, 0)`,
            },
            {
              stop: 1,
              color: `rgba(${hexToRGB(
                tailwindConfig().theme.colors.violet[500]
              )}, 0.15)`,
            },
          ]);
        },
        borderColor: tailwindConfig().theme.colors.violet[500],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.violet[500],
        tension: 0.25,
      },
      {
        data: [
          532, 532, 532, 404, 404, 314, 314, 314, 314, 314, 234, 314, 234, 234,
          314, 314, 314, 388, 314, 202, 202, 202, 202, 314, 720, 642,
        ],
        borderColor: `rgba(${hexToRGB(
          tailwindConfig().theme.colors.gray[500]
        )}, 0.3)`,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
      },
    ],
  };

  return (
    <div
      className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 
      bg-gradient-to-br from-white via-gray-50 to-violet-50 
      dark:from-gray-800 dark:via-gray-900 dark:to-violet-950 
      shadow-lg rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          💳 Payment Overview
        </h2>
        <EditMenu align="right">
          <li>
            <Link
              className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              to="#"
            >
              Option 1
            </Link>
          </li>
          <li>
            <Link
              className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              to="#"
            >
              Option 2
            </Link>
          </li>
          <li>
            <Link
              className="px-3 py-1 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              to="#"
            >
              Remove
            </Link>
          </li>
        </EditMenu>
      </div>

      {/* Stats */}
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        This Month
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
          24,780
        </span>
        <span className="text-xs font-bold text-green-700 dark:text-green-400 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 animate-bounce">
          +49%
        </span>
      </div>

      {/* Chart */}
      <div className="h-32 w-full">
        <LineChart data={chartData} width={389} height={128} />
      </div>
    </div>
  );
}

export default DashboardCard01;
