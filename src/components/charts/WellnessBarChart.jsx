import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Box, Typography, CircularProgress } from "@mui/material";

const WellnessBarChart = ({ schoolId, month }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId || !month) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Ensure month format is YYYY-MM (like "2025-10")
        const formattedMonth = month.slice(0, 7);

        const url = `/get_wellness_percentage.php?school_id=${schoolId}&month=${formattedMonth}`;
        console.log("Fetching:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API result:", result);

        const dataArray = Array.isArray(result) ? result : result?.data || [];

        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const formattedData = dataArray.map((item) => ({
            dimension: item.dimension_name,
            completion: parseFloat(item.wellness_percentage) || 0,
            color: item.color || "#4F46E5",
          }));
          setData(formattedData);
        } else {
          console.warn("No data found in response");
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, month]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          No data available for this month.
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dimension" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar
          dataKey="completion"
          radius={[6, 6, 0, 0]}
          label={{ position: "top", fill: "#555" }}
        >
          {/* ✅ Use Cell (capital C) to apply per-bar color */}
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WellnessBarChart;
