import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface UserRoleData {
  name: string;
  value: number;
}

export default function RolebasedUserPieChart({
  data,
}: {
  data: UserRoleData[];
}) {
  const series = data.map((item) => item.value);
  const labels = data.map((item) => item.name);
  const totalUsers = series.reduce((sum, value) => sum + value, 0);

  const options: ApexOptions = {
    chart: {
      height: 350,
    },
    labels: labels,
    colors: ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0", "#546E7A"],
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "65%",
          background: "transparent",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: undefined,
              offsetY: -10,
              formatter: function (val: string) {
                return val;
              },
            },
            value: {
              show: true,
              fontSize: "22px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 700,
              color: undefined,
              offsetY: 10,
              // Corrected the type of `val` to string as per ApexCharts docs for labels.value.formatter
              formatter: function (val: string) {
                return `${parseInt(val)} users`;
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Users",
              fontSize: "16px",
              fontFamily: "Helvetica, Arial, sans-serif",
              fontWeight: 600,
              color: "#373d3f",
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => {
                  return a + b;
                }, 0);
              },
            },
          },
        },
        startAngle: -90,
        endAngle: 270,
        offsetY: 0,
      },
    },
    stroke: {
      width: 5,
      show: true,
      colors: ["#fff"],
    },
    dataLabels: {
      enabled: true,
      formatter: function (_val: any, opts: any) {
        return opts.w.globals.series[opts.seriesIndex];
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
    },
    legend: {
      position: "bottom",
      fontSize: "14px",
      markers: {
        // Corrected 'radius' to 'size' as per ApexCharts documentation
        size: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return `${value} users (${((value / totalUsers) * 100).toFixed(1)}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            width: "100%",
          },
          legend: {
            position: "bottom",
          },
          plotOptions: {
            pie: {
              donut: {
                size: "50%",
              },
            },
          },
          dataLabels: {
            textAnchor: "middle",
          },
        },
      },
    ],
  };

  return (
    <div className="bg-white h-full dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        User Roles Breakdown
      </h2>
      <div className="flex flex-col justify-center h-full">
        {totalUsers > 0 ? (
          <Chart options={options} series={series} type="donut" height={350} />
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            No user data available to display chart.
          </p>
        )}
      </div>
    </div>
  );
}
