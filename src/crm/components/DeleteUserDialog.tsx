import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { User } from "../types/User";
import { usersApi } from "../services/usersApi";

interface DeleteUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteUserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  // Track loading state during API call to prevent multiple simultaneous deletions
  const [loading, setLoading] = React.useState(false);

  // Store any error messages that occur during deletion process
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Handles the actual deletion of a user
   * This function performs the following operations:
   * 1. Validates that a user is selected
   * 2. Sets loading state to show progress indicator
   * 3. Clears any previous errors
   * 4. Makes API call to delete the user
   * 5. Calls success callback and closes dialog on success
   * 6. Shows error message if deletion fails
   * 7. Always resets loading state in finally block
   */
  const handleDelete = async () => {
    // Early return if no user is selected (defensive programming)
    if (!user) return;

    // Set loading state to disable buttons and show progress indicator
    setLoading(true);

    // Clear any previous error messages before attempting deletion
    setError(null);

    try {
      // Call API to delete user using their unique UUID identifier
      await usersApi.deleteUser(user.login.uuid);

      // Notify parent component that deletion was successful
      // This typically triggers a refresh of the users list
      onSuccess();

      // Close the dialog after successful deletion
      onClose();
    } catch (err) {
      // Handle deletion errors by setting error state
      // Check if error is an Error object to safely access message property
      // Fallback to generic message if error format is unexpected
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      // Always reset loading state regardless of success or failure
      // This ensures UI returns to normal state and buttons are re-enabled
      setLoading(false);
    }
  };

  /**
   * Handles dialog close events
   * Prevents closing the dialog while an API operation is in progress
   * Clears error state when dialog is closed to ensure clean state for next open
   */
  const handleClose = () => {
    // Only allow closing if not currently performing deletion operation
    if (!loading) {
      // Clear any error messages when closing dialog
      setError(null);

      // Call parent's onClose callback to actually close the dialog
      onClose();
    }
  };

  // Early return if no user is provided - dialog should not render
  // This is a defensive check to prevent rendering with invalid data
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningIcon color="error" />
          <Typography variant="h6">Delete User</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            src={user.picture.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="h6">
              {user.name.first} {user.name.last}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.login.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          All user data including profile information, contact details, and
          associated records will be permanently removed.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Deleting..." : "Delete User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
