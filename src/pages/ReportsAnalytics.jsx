import React, { useEffect, useState } from "react";
import WellnessLineChart from "../components/charts/WellnessLineChart";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);

  // ✅ this will be EXACTLY what the chart is showing
  const [chartData, setChartData] = useState([]);

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("/get_schools.php");
        const data = await res.json();
        setSchools(data);
        if (data.length > 0) setSelectedSchool(data[0].id);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  // ✅ clear old data immediately when school changes (prevents exporting previous school)
  useEffect(() => {
    setChartData([]);
  }, [selectedSchool]);

  // Excel Export (EXPORT WHAT YOU SEE)
  const exportToExcel = () => {
    if (!chartData || chartData.length === 0) {
      alert("No data available to export.");
      return;
    }

    // force stable column order: Month first, then the rest
    const headers = ["Month", ...Object.keys(chartData[0]).filter((k) => k !== "Month")];

    const worksheet = XLSX.utils.json_to_sheet(chartData, { header: headers });

    // set widths (optional, keeps it clean)
    worksheet["!cols"] = headers.map((h) => ({ wch: Math.max(12, h.length + 2) }));

    // format % columns if values look like 0..100
    const percentCols = headers.slice(1); // all except Month
    chartData.forEach((_, r) => {
      percentCols.forEach((_, c) => {
        const cellRef = XLSX.utils.encode_cell({ r: r + 1, c: c + 1 });
        if (worksheet[cellRef] && typeof worksheet[cellRef].v === "number") {
          worksheet[cellRef].v = worksheet[cellRef].v / 100;
          worksheet[cellRef].z = "0%";
        }
      });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wellness Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Wellness_Report_${selectedSchool}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            gap: 2,
          }}
        >
          <Typography variant="h6">Yearly Wellness Completion</Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select School</InputLabel>
              {loadingSchools ? (
                <CircularProgress size={24} sx={{ ml: 2 }} />
              ) : (
                <Select
                  value={selectedSchool}
                  label="Select School"
                  onChange={(e) => setSelectedSchool(e.target.value)}
                >
                  {schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              onClick={exportToExcel}
              disabled={!chartData.length} // ✅ only enable when chart has loaded
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {/* Chart (UI unchanged) */}
        {selectedSchool ? (
          <WellnessLineChart
            schoolId={selectedSchool}
            // ✅ chart will call this once it has the exact data it is rendering
            onDataReady={(data) => setChartData(Array.isArray(data) ? data : [])}
          />
        ) : (
          <Typography sx={{ mt: 3, color: "text.secondary" }}>
            Please select a school to view the report.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default Reports;
