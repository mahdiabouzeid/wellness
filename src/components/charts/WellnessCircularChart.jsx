import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Box, Typography, CircularProgress } from "@mui/material";

const WellnessCircularChart = ({ schoolId, month }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId || !month) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const formattedMonth = month.slice(0, 7); // YYYY-MM format
        const url = `/get_wellness_percentage.php?school_id=${schoolId}&month=${formattedMonth}`;
        console.log("Fetching:", url);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        console.log("API result:", result);

        const dataArray = Array.isArray(result)
          ? result
          : result?.data || [];

        if (Array.isArray(dataArray) && dataArray.length > 0) {
          const formattedData = dataArray.map((item) => ({
            name: item.dimension_name,
            value: parseFloat(item.wellness_percentage) || 0,
            color: item.color || "#8884d8",
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, month]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={350}>
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
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={45}   // ✅ same as your original static chart
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default WellnessCircularChart;
