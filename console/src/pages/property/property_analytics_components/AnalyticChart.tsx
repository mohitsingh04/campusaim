import { Component } from "react";
import ReactApexChart from "react-apexcharts";

interface AnalyticChartProps {
  trafficData: { day: string; clicks: number }[];
  enquiryData: { day: string; enquiries: number }[];
}

interface AnalyticChartState {
  series: { name: string; data: number[] }[];
  options: ApexCharts.ApexOptions;
}

export class AnalyticChart extends Component<
  AnalyticChartProps,
  AnalyticChartState
> {
  constructor(props: AnalyticChartProps) {
    super(props);

    const { trafficData = [], enquiryData = [] } = props;

    // Collect all days from traffic and enquiries
    const allDays = Array.from(
      new Set([
        ...trafficData.map((item) => item.day),
        ...enquiryData.map((item) => item.day),
      ])
    ).sort((a, b) => Number(a) - Number(b));

    // Create lookup maps
    const trafficMap = trafficData.reduce<Record<string, number>>(
      (map, { day, clicks }) => {
        map[day] = clicks;
        return map;
      },
      {}
    );

    const enquiryMap = enquiryData.reduce<Record<string, number>>(
      (map, { day, enquiries }) => {
        map[day] = enquiries;
        return map;
      },
      {}
    );

    const trafficSeries = allDays.map((day) => trafficMap[day] || 0);
    const enquirySeries = allDays.map((day) => enquiryMap[day] || 0);

    // Tailwind inspired colors
    const textColor = "#9ca3af";
    const gridColor = "#9ca3af";

    this.state = {
      series: [
        { name: "Traffic", data: trafficSeries },
        { name: "Enquiries", data: enquirySeries },
      ],
      options: {
        chart: {
          type: "line",
          height: 320,
          toolbar: { show: false },
          foreColor: textColor,
          background: "transparent",
        },
        stroke: { curve: "smooth", width: 3 },
        dataLabels: {
          enabled: true,
        },
        xaxis: {
          categories: allDays,
          title: { text: "Day", style: { color: textColor } },
          labels: { style: { colors: Array(allDays.length).fill(textColor) } },
        },
        yaxis: {
          title: { text: "Count", style: { color: textColor } },
          labels: { style: { colors: Array(allDays.length).fill(textColor) } },
        },
        grid: { borderColor: gridColor, strokeDashArray: 3 },
        colors: ["#3b82f6", "#f87171"],
        legend: { show: true, position: "top", labels: { colors: textColor } },
        tooltip: { theme: "dark" },
      },
    };
  }

  render() {
    return (
      <ReactApexChart
        options={this.state.options}
        series={this.state.series}
        type="line"
        height={420}
      />
    );
  }
}
