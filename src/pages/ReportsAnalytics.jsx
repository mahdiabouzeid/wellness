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
  Grid,
  Chip,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("https://wellness.alwaysdata.net/get_schools.php");
        const data = await res.json();
        setSchools(data);
        if (data.length > 0) {
          setSelectedSchool(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    setChartData([]);
  }, [selectedSchool]);

  const exportToExcel = () => {
    if (!chartData || chartData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Month", ...Object.keys(chartData[0]).filter((key) => key !== "Month")];
    const worksheet = XLSX.utils.json_to_sheet(chartData, { header: headers });

    worksheet["!cols"] = headers.map((header) => ({
      wch: Math.max(12, header.length + 2),
    }));

    const percentCols = headers.slice(1);
    chartData.forEach((_, rowIndex) => {
      percentCols.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex + 1 });
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

    saveAs(
      blob,
      `Wellness_Report_${selectedSchool}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <Box className="page-shell">
      <Box className="page-shell__hero">
        <Box className="page-shell__hero-copy">
          <Chip
            label="Analytics"
            sx={{ mb: 2, color: "#0F3D39", backgroundColor: "rgba(244,255,253,0.9)" }}
          />
          <Typography variant="h3" sx={{ mb: 1 }}>
            Reports built for clean review and export.
          </Typography>
          <Typography sx={{ color: "rgba(245,255,253,0.82)" }}>
            Compare dimension progress across time and export the exact data shown on screen.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <Paper className="surface-card" sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ mb: 0.75 }}>
                  Yearly wellness completion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a school to view its rolling six-month performance window.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                <FormControl sx={{ minWidth: 240 }}>
                  <InputLabel>Select School</InputLabel>
                  {loadingSchools ? (
                    <Box
                      sx={{
                        minHeight: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Select
                      value={selectedSchool}
                      label="Select School"
                      onChange={(e) => setSelectedSchool(e.target.value)}
                    >
                      {schools.map((school) => (
                        <MenuItem key={school.id} value={school.id}>
                          {school.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>

                <Button variant="contained" onClick={exportToExcel} disabled={!chartData.length}>
                  Export to Excel
                </Button>
              </Box>
            </Box>

            {selectedSchool ? (
              <WellnessLineChart
                schoolId={selectedSchool}
                onDataReady={(data) => setChartData(Array.isArray(data) ? data : [])}
              />
            ) : (
              <Typography sx={{ mt: 3, color: "text.secondary" }}>
                Please select a school to view the report.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
