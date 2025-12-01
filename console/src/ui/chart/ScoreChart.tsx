import { Component } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ScoreChartProps {
  name?: string;
  value?: number;
  maxValue?: number;
  color?: string; // single solid color
  heading?: string; // new heading prop
}

interface ScoreChartState {
  series: number[];
  options: ApexOptions;
}

export class ScoreChart extends Component<ScoreChartProps, ScoreChartState> {
  constructor(props: ScoreChartProps) {
    super(props);

    const { name = "SEO", value = 0, maxValue = 1000, color } = this.props;
    const percentage = ((value / maxValue) * 100).toFixed(0);

    const dynamicColor =
      color ||
      (Number(percentage) < 50
        ? "#ef4444"
        : Number(percentage) < 80
        ? "#f97316"
        : "#22c55e");

    this.state = {
      series: [Number(percentage)],
      options: {
        chart: {
          type: "radialBar",
          toolbar: { show: false },
          height: "100%",
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: {
              size: "70%",
              background: "transparent",
              dropShadow: {
                enabled: true,
                top: 3,
                left: 0,
                blur: 4,
                opacity: 0.2,
              },
            },
            track: {
              background: "#f0f0f5",
              strokeWidth: "100%",
              margin: 8,
              dropShadow: { enabled: false },
            },
            dataLabels: {
              show: true,
              name: {
                show: true,
                fontSize: "15px",
                offsetY: 45,
                color: dynamicColor,
              },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 700,
                offsetY: -5,
                color: dynamicColor,
                formatter: () => `${value}/${maxValue}`,
              },
            },
          },
        },
        fill: {
          type: "solid",
        },
        colors: [dynamicColor],
        stroke: { lineCap: "round" },
        labels: [name],
        responsive: [
          {
            breakpoint: 500,
            options: { chart: { height: 200 } },
          },
        ],
      },
    };
  }

  render() {
    const { heading, color } = this.props;

    return (
      <div className="bg-[var(--yp-primary)] rounded-2xl p-5 shadow-sm hover:shadow-md transition w-full h-[250px] flex flex-col">
        {/* Heading Section */}
        {heading && (
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-1 h-4 rounded-full`}
              style={{ backgroundColor: color || "#22c55e" }}
            />
            <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
              {heading}
            </h3>
          </div>
        )}

        {/* Chart Section */}
        <div className="flex-1 flex items-center justify-center">
          <ReactApexChart
            options={this.state.options}
            series={this.state.series}
            type="radialBar"
            height="100%"
            width="100%"
          />
        </div>
      </div>
    );
  }
}
