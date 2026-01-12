import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CrmUsersTable from "../components/CrmUsersTable";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph color="text.secondary" sx={{ mb: 3 }}>
        View and manage your customer data. Search, edit, and track all customer
        information in one place.
      </Typography>
      <CrmUsersTable />
    </Box>
  );
}
