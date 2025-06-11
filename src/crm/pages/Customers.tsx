import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import UsersDataGrid from "../components/UsersDataGrid";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customer Management
      </Typography>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h4" component="div">
                  1,234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active users in system
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  New This Month
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  +89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Newly registered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Today
                </Typography>
                <Typography variant="h4" component="div" color="primary.main">
                  456
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Users online now
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Conversion Rate
                </Typography>
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

        <Box sx={{ height: 600 }}>
          <UsersDataGrid />
        </Box>
      </Stack>
    </Box>
  );
}
