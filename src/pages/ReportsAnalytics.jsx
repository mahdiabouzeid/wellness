import React, { useCallback, useEffect, useState } from "react";
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
import { API_BASE_URL, authFetch } from "../auth/authService";

const Reports = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [defaultSchool, setDefaultSchool] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [resetVersion, setResetVersion] = useState(0);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/get_schools.php`);
        const data = await res.json();
        setSchools(data);
        if (data.length > 0) {
          setSelectedSchool(String(data[0].id));
          setDefaultSchool(String(data[0].id));
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

  const handleChartDataReady = useCallback((data) => {
    setChartData(Array.isArray(data) ? data : []);
  }, []);

  const handleResetReports = useCallback(() => {
    setSelectedSchool(defaultSchool);
    setChartData([]);
    setResetVersion((current) => current + 1);
  }, [defaultSchool]);

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
          <Typography
            variant="h3"
            sx={{
              mb: 1,
              fontSize: { xs: "2rem", sm: "2.45rem", lg: "2.85rem" },
              lineHeight: 1.12,
            }}
          >
            Create, Review, and Export Reports
          </Typography>
          <Typography sx={{ color: "rgba(245,255,253,0.82)" }}>
            Analyze wellness dimension progress over time and easily export the displayed data.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sx={{ minWidth: 0 }}>
          <Paper className="surface-card" sx={{ p: { xs: 2, md: 3 }, width: "100%", minWidth: 0, overflow: "hidden" }}>
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
                      onChange={(e) => setSelectedSchool(String(e.target.value))}
                    >
                      {schools.map((school) => (
                        <MenuItem key={school.id} value={String(school.id)}>
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
                onDataReady={handleChartDataReady}
                onReset={handleResetReports}
                resetVersion={resetVersion}
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
