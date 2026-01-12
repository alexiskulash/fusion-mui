import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomersUsersTable from "../components/CustomersUsersTable";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3, color: "text.secondary" }}>
        Manage your customer data and user information
      </Typography>
      <CustomersUsersTable />
    </Box>
  );
}
