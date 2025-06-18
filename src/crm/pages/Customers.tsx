import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CrmStatCard from "../components/CrmStatCard";
import CustomersTable from "../components/CustomersTable";
import CustomerDialog from "../components/CustomerDialog";

// Sample data for customer stats cards
const customerStatsData = [
  {
    title: "Total Customers",
    value: "2,543",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+15%",
    data: [
      200, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500,
      520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720, 740, 760, 780, 800,
    ],
  },
  {
    title: "Active Customers",
    value: "2,124",
    interval: "Currently active",
    trend: "up",
    trendValue: "+8%",
    data: [
      400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680,
      700, 720, 740, 760, 780, 800, 820, 840, 860, 880, 900, 920, 940, 960, 980,
    ],
  },
  {
    title: "New Customers",
    value: "156",
    interval: "This month",
    trend: "up",
    trendValue: "+23%",
    data: [
      300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440,
      450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590,
    ],
  },
  {
    title: "Customer Satisfaction",
    value: "94%",
    interval: "Average rating",
    trend: "up",
    trendValue: "+2%",
    data: [
      85, 87, 88, 90, 89, 91, 92, 93, 94, 93, 94, 95, 94, 93, 94, 95, 96, 95,
      94, 95, 96, 95, 94, 95, 94, 93, 94, 95, 94, 94,
    ],
  },
];

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddCustomer = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleCustomerSaved = () => {
    setRefreshTable((prev) => prev + 1);
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddCustomer}
          >
            Add Customer
          </Button>
        </Box>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {customerStatsData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <CrmStatCard
              title={card.title}
              value={card.value}
              interval={card.interval}
              trend={card.trend as "up" | "down"}
              trendValue={card.trendValue}
              data={card.data}
            />
          </Grid>
        ))}
      </Grid>

      {/* Customers Table */}
      <CustomersTable
        searchTerm={searchTerm}
        refreshTrigger={refreshTable}
        onCustomerUpdate={() => setRefreshTable((prev) => prev + 1)}
        onSearchChange={setSearchTerm}
      />

      {/* Add Customer Dialog */}
      <CustomerDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleCustomerSaved}
        mode="create"
      />
    </Box>
  );
}
