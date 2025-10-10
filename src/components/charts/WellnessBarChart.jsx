import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { dimension: "Emotional", completion: 70 },
  { dimension: "Physical", completion: 85 },
  { dimension: "Social", completion: 60 },
  { dimension: "Intellectual", completion: 90 },
  { dimension: "Spiritual", completion: 50 },
  { dimension: "Financial", completion: 65 },
  { dimension: "Environmental", completion: 80 },
  { dimension: "Vocational", completion: 75 },
];

const WellnessBarChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="dimension" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Bar dataKey="completion" fill="#4F46E5" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default WellnessBarChart;
