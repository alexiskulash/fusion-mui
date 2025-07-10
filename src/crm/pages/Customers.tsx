import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Alert, Snackbar } from "@mui/material";
import UsersTable from "../components/UsersTable";
import EditUserModal from "../components/EditUserModal";
import DeleteUserDialog from "../components/DeleteUserDialog";
import { User } from "../types/User";

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setSnackbar({
      open: true,
      message: "User updated successfully!",
      severity: "success",
    });
    setRefreshKey((prev) => prev + 1); // Force table refresh
  };

  const handleDeleteSuccess = () => {
    setSnackbar({
      open: true,
      message: "User deleted successfully!",
      severity: "success",
    });
    setRefreshKey((prev) => prev + 1); // Force table refresh
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customers Dashboard
      </Typography>
      <Typography paragraph sx={{ mb: 4, color: "text.secondary" }}>
        Manage your customer database with comprehensive user information,
        search capabilities, and editing tools.
      </Typography>

      <UsersTable
        key={refreshKey}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        user={userToDelete}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
