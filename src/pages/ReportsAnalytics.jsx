import React from "react";
import WellnessLineChart from "../components/charts/WellnessLineChart";
import { Box, Typography, Paper, Button } from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Reports = () => {
  // Sample data (same as chart)
  const data = [
    { month: "Jan", completion: 60 },
    { month: "Feb", completion: 65 },
    { month: "Mar", completion: 70 },
    { month: "Apr", completion: 75 },
    { month: "May", completion: 80 },
    { month: "Jun", completion: 78 },
  ];

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wellness Report");

    // Convert to binary Excel file and save
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            Monthly Wellness Completion
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
        </Box>

        <WellnessLineChart />
      </Paper>
    </Box>
  );
};

export default Reports;
