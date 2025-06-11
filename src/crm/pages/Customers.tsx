import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import UsersDataGrid from "../components/UsersDataGrid";

/**
 * Customers page component that displays a comprehensive customer management dashboard.
 *
 * This page includes:
 * - Customer overview metrics cards showing key statistics
 * - Interactive data grid for managing customer records
 * - Search, edit, and delete functionality for customer data
 *
 * The component integrates with the Users API to provide real-time customer data
 * and supports full CRUD operations through the UsersDataGrid component.
 */
export default function Customers() {
  return (
    {/* Main container with responsive width constraints */}
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page header */}
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customer Management
      </Typography>

      {/* Main content stack with consistent spacing */}
      <Stack spacing={3}>
        {/* Dashboard metrics cards section */}
        <Grid container spacing={3}>
          {/* Total Customers metric card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                {/* Main metric display - hardcoded for demo purposes */}
                <Typography variant="h4" component="div">
                  1,234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active users in system
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* New Customers This Month metric card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  New This Month
                </Typography>
                {/* Growth metric with success color to indicate positive trend */}
                <Typography variant="h4" component="div" color="success.main">
                  +89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Newly registered
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Users Today metric card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Today
                </Typography>
                {/* Current activity metric with primary color */}
                <Typography variant="h4" component="div" color="primary.main">
                  456
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Users online now
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Conversion Rate metric card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Conversion Rate
                </Typography>
                {/* Conversion percentage with warning color to draw attention */}
                <Typography variant="h4" component="div" color="warning.main">
                  12.5%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lead to customer
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer data management section */}
        {/* Fixed height container for the data grid to ensure consistent layout */}
        <Box sx={{ height: 600 }}>
          {/*
            Main data grid component that handles:
            - Fetching users from the Users API
            - Search functionality with debouncing
            - Server-side pagination
            - Edit modal for user management
            - Delete operations with confirmation
          */}
          <UsersDataGrid />
        </Box>
      </Stack>
    </Box>
  );
}