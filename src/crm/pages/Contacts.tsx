import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CrmContactsGrid from "../components/CrmContactsGrid";

export default function Contacts() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Contacts
      </Typography>
      <CrmContactsGrid />
    </Box>
  );
}
