import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";

// ✅ Custom Tooltip with color-coded values
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Box
      sx={{
        backgroundColor: "white",
        p: 1.5,
        borderRadius: 1,
        boxShadow: 2,
        minWidth: 100,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography
          key={entry.name}
          variant="body2"
          sx={{
            color: entry.color,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {entry.name}: {entry.value}%
        </Typography>
      ))}
    </Box>
  );
};

const WellnessLineChart = ({ schoolId, onDataLoaded }) => {
  const [monthStats, setMonthStats] = useState([]);
  const [DIMENSIONS, setDIMENSIONS] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWindowEnd, setCurrentWindowEnd] = useState(new Date());

  // ✅ Fetch data for range of months
  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);

      // Generate list of months between startDate and endDate
      const months = [];
      const temp = new Date(startDate);
      while (temp <= endDate) {
        months.push(temp.toISOString().slice(0, 7));
        temp.setMonth(temp.getMonth() + 1);
      }

      // Fetch data for each month
      const responses = await Promise.all(
        months.map((month) =>
          fetch(
            `/get_wellness_percentage.php?school_id=${schoolId}&month=${month}`
          )
            .then((res) => res.json())
            .then((res) => ({ month, data: res }))
        )
      );

      // Collect all unique dimensions (to ensure consistent keys)
      const allDims = {};
      responses.forEach(({ data }) => {
        if (Array.isArray(data)) {
          data.forEach((d) => {
            allDims[d.dimension_name] = d.color;
          });
        }
      });

      // Normalize each month's data (fill missing dimensions with 0)
      const formattedData = responses.map(({ month, data }) => {
        const label = new Date(month + "-01").toLocaleString("default", {
          month: "short",
        });
        const entry = { month: label };

        // Default all dimensions to 0
        Object.keys(allDims).forEach((dim) => {
          entry[dim] = 0;
        });

        // Fill actual values
        if (Array.isArray(data)) {
          data.forEach((d) => {
            entry[d.dimension_name] = parseFloat(d.wellness_percentage) || 0;
          });
        }

        return entry;
      });

      setMonthStats(formattedData);
      setDIMENSIONS(
        Object.entries(allDims).map(([key, color]) => ({ key, color }))
      );

      if (onDataLoaded) onDataLoaded(formattedData);
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch (latest 6 months)
  useEffect(() => {
    if (!schoolId) return;
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    setCurrentWindowEnd(end);
    fetchData(start, end);
  }, [schoolId]);

  // ✅ Prev / Next buttons
  const handlePrev = () => {
    const newEnd = new Date(currentWindowEnd);
    newEnd.setMonth(newEnd.getMonth() - 6);
    const newStart = new Date(newEnd);
    newStart.setMonth(newStart.getMonth() - 5);
    setCurrentWindowEnd(newEnd);
    fetchData(newStart, newEnd);
  };

  const handleNext = () => {
    const today = new Date();
    const newEnd = new Date(currentWindowEnd);
    newEnd.setMonth(newEnd.getMonth() + 6);

    // Prevent going beyond current month
    if (newEnd > today) {
      setCurrentWindowEnd(today);
      const newStart = new Date();
      newStart.setMonth(today.getMonth() - 5);
      fetchData(newStart, today);
      return;
    }

    const newStart = new Date(newEnd);
    newStart.setMonth(newStart.getMonth() - 5);
    setCurrentWindowEnd(newEnd);
    fetchData(newStart, newEnd);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={350}>
        <CircularProgress />
      </Box>
    );
  }

  if (!monthStats.length) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          No data available for this school.
        </Typography>
      </Box>
    );
  }

  const windowRange = `${monthStats[0]?.month || ""} → ${
    monthStats[monthStats.length - 1]?.month || ""
  }`;

  return (
    <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 3, p: 2 }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Progress by Dimension ({windowRange})
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={handlePrev}>
              Prev 6 months
            </Button>
            <Button variant="outlined" onClick={handleNext}>
              Next 6 months
            </Button>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthStats}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <ReTooltip content={<CustomTooltip />} />

              {DIMENSIONS.map((d) => (
                <Line
                  key={d.key}
                  type="monotone"
                  dataKey={d.key}
                  stroke={d.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: d.color }}
                  activeDot={{ r: 5 }}
                  connectNulls={true} // ✅ keeps line continuous
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WellnessLineChart;
