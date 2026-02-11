import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CrmUsersTable from "../components/CrmUsersTable";

export default function Customers() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customers
      </Typography>
      <CrmUsersTable />
    </Box>
  );
}
