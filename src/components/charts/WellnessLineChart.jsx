import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", completion: 60 },
  { month: "Feb", completion: 65 },
  { month: "Mar", completion: 70 },
  { month: "Apr", completion: 75 },
  { month: "May", completion: 80 },
  { month: "Jun", completion: 78 },
];

const WellnessLineChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Line type="monotone" dataKey="completion" stroke="#4F46E5" strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

export default WellnessLineChart;
