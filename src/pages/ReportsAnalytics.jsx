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

  // Excel Export
  const exportToExcel = () => {
    if (!chartData.length) {
      alert("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(chartData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wellness Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Wellness_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
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
              disabled={!chartData.length}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {/* Chart */}
        {selectedSchool ? (
          <WellnessLineChart
            schoolId={selectedSchool}
            
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
//working NOW
export default Reports;
