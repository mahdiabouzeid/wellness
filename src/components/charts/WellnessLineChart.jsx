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
import { Box, Typography, CircularProgress, Button } from "@mui/material";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Box
      sx={{
        backgroundColor: "rgba(255,255,255,0.96)",
        p: 1.5,
        borderRadius: 2,
        boxShadow: "0 18px 40px rgba(16, 42, 39, 0.12)",
        border: "1px solid rgba(16, 42, 39, 0.08)",
        minWidth: 140,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry) => (
        <Typography
          key={entry.name}
          variant="body2"
          sx={{
            color: entry.color,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {entry.name}: {entry.value}%
        </Typography>
      ))}
    </Box>
  );
};

const WellnessLineChart = ({ schoolId, onDataReady }) => {
  const [monthStats, setMonthStats] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWindowEnd, setCurrentWindowEnd] = useState(new Date());

  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true);

      const months = [];
      const temp = new Date(startDate);
      while (temp <= endDate) {
        months.push(temp.toISOString().slice(0, 7));
        temp.setMonth(temp.getMonth() + 1);
      }

      const responses = await Promise.all(
        months.map((month) =>
          fetch(`https://wellness.alwaysdata.net/get_wellness_percentage.php?school_id=${schoolId}&month=${month}`)
            .then((res) => res.json())
            .then((res) => ({ month, data: res }))
        )
      );

      const allDimensions = {};
      responses.forEach(({ data }) => {
        if (Array.isArray(data)) {
          data.forEach((item) => {
            allDimensions[item.dimension_name] = item.color;
          });
        }
      });

      const formattedData = responses.map(({ month, data }) => {
        const label = new Date(month + "-01").toLocaleString("default", {
          month: "short",
        });
        const entry = { month: label };

        Object.keys(allDimensions).forEach((dimension) => {
          entry[dimension] = 0;
        });

        if (Array.isArray(data)) {
          data.forEach((item) => {
            entry[item.dimension_name] = parseFloat(item.wellness_percentage) || 0;
          });
        }

        return entry;
      });

      setMonthStats(formattedData);
      setDimensions(
        Object.entries(allDimensions).map(([key, color]) => ({ key, color }))
      );

      if (onDataReady) {
        const exportSafeData = formattedData.map((row) => {
          const output = { Month: row.month };
          Object.keys(row).forEach((key) => {
            if (key !== "month") {
              output[key] = row[key];
            }
          });
          return output;
        });

        onDataReady(exportSafeData);
      }
    } catch (err) {
      console.error("Error loading chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!schoolId) return;

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);

    setCurrentWindowEnd(end);
    fetchData(start, end);
  }, [schoolId]);

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

    if (newEnd > today) {
      const start = new Date();
      start.setMonth(today.getMonth() - 5);
      setCurrentWindowEnd(today);
      fetchData(start, today);
      return;
    }

    const newStart = new Date(newEnd);
    newStart.setMonth(newStart.getMonth() - 5);

    setCurrentWindowEnd(newEnd);
    fetchData(newStart, newEnd);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={360}>
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

  const windowRange = `${monthStats[0]?.month} to ${monthStats[monthStats.length - 1]?.month}`;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Progress by Dimension
          </Typography>
          <Typography variant="h6">{windowRange}</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handlePrev}>
            Prev 6 months
          </Button>
          <Button variant="outlined" onClick={handleNext}>
            Next 6 months
          </Button>
        </Box>
      </Box>

      <Box sx={{ width: "100%", height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(16,42,39,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="month" tick={{ fill: "#55706C" }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "#55706C" }}
              axisLine={false}
              tickLine={false}
            />
            <ReTooltip content={<CustomTooltip />} />

            {dimensions.map((dimension) => (
              <Line
                key={dimension.key}
                type="monotone"
                dataKey={dimension.key}
                stroke={dimension.color}
                strokeWidth={3}
                dot={{ r: 3, fill: dimension.color }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default WellnessLineChart;
