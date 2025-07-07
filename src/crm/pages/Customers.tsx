import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import UsersDataGrid from "../components/UsersDataGrid";
import UserEditModal from "../components/UserEditModal";
import UserSearch from "../components/UserSearch";
import { User } from "../services/userService";

export default function Customers() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSnackbar({
      open: true,
      message: `User ${user.name.first} ${user.name.last} has been deleted successfully`,
      severity: "success",
    });
  };

  const handleUserUpdated = (updatedUser: User) => {
    setSnackbar({
      open: true,
      message: `User ${updatedUser.name.first} ${updatedUser.name.last} has been updated successfully`,
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const debouncedSearchQuery = React.useMemo(() => {
    const timeoutId = setTimeout(() => searchQuery, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database with search, edit, and delete
            capabilities
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <UserSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or city..."
          />
        </Box>

        <Paper
          sx={{
            height: 600,
            width: "100%",
            "& .even": {
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.grey["50"]} / 0.3)`
                : theme.palette.grey[50],
            },
            "& .odd": {
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : theme.palette.background.default,
            },
          }}
        >
          <UsersDataGrid
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            searchQuery={searchQuery}
          />
        </Paper>
      </Stack>

      <UserEditModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
