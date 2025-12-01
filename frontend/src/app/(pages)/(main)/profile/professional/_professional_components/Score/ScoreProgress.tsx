import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ScoreProgress({ score }: { score: number }) {
  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: ["#9333ea", "#e9ecef"],
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: "80%",
    rotation: 0,
    circumference: 360,
    borderRadius: 10,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    animation: {
      animateRotate: true,
      duration: 1000,
    },
  };
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative w-28 h-28">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-purple-600">{score}</span>
        </div>
      </div>
    </div>
  );
}
