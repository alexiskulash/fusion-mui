import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import PeopleIcon from "@mui/icons-material/People";
import CrmCustomerDashboard from "../components/CrmCustomerDashboard";
import CrmUserEditModal from "../components/CrmUserEditModal";
import { User } from "../services/usersApi";

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [dashboardKey, setDashboardKey] = React.useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleUserUpdated = () => {
    // Force dashboard refresh by updating the key
    setDashboardKey(prev => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.main}04 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={600}>
                Customer Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your customer database with real-time data from the Users API
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="Live Data"
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              label="Search & Filter"
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label="Edit Customers"
              color="secondary"
              variant="outlined"
              size="small"
            />
            <Chip
              label="Pagination"
              color="info"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Paper>

        {/* Dashboard Section */}
        <Box sx={{ height: "calc(100vh - 280px)", minHeight: "600px" }}>
          <CrmCustomerDashboard
            key={dashboardKey}
            onEditUser={handleEditUser}
          />
        </Box>

        {/* Edit Modal */}
        <CrmUserEditModal
          open={modalOpen}
          user={selectedUser}
          onClose={handleCloseModal}
          onUserUpdated={handleUserUpdated}
        />
      </Stack>
    </Box>
  );
}
