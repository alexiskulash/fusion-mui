import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import UsersDataGrid from "../components/UsersDataGrid";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph color="text.secondary" sx={{ mb: 3 }}>
        Manage your customer database. Search, view, and edit customer information.
      </Typography>

      <UsersDataGrid />
    </Box>
  );
}
