import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Emotional", value: 70 },
  { name: "Physical", value: 85 },
  { name: "Social", value: 60 },
  { name: "Intellectual", value: 90 },
  { name: "Spiritual", value: 50 },
  { name: "Financial", value: 65 },
  { name: "Environmental", value: 80 },
  { name: "Vocational", value: 75 },
];

const COLORS = [
  "#4F46E5", "#22C55E", "#F59E0B", "#3B82F6",
  "#EC4899", "#10B981", "#8B5CF6", "#EF4444"
];

const WellnessCircularChart = () => (
  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        outerRadius={50}
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export default WellnessCircularChart;
