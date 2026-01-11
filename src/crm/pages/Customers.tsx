import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomersTable from "../components/CustomersTable";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Customers
      </Typography>
      <CustomersTable />
    </Box>
  );
}
