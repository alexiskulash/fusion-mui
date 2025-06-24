import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { User, usersApi, UpdateUserRequest } from "../services/usersApi";

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  username: string;
  gender: "male" | "female";
  phone: string;
  cell: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  username: "",
  gender: "male",
  phone: "",
  cell: "",
  streetNumber: "",
  streetName: "",
  city: "",
  state: "",
  country: "",
  postcode: "",
};

export default function UserEditModal({
  open,
  onClose,
  user,
  onUserUpdated,
}: UserEditModalProps) {
  // Component state management for form data and UI states
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Effect to populate form data when modal opens or user data changes
   * This ensures the form is always in sync with the selected user's data
   *
   * Key behaviors:
   * - When a user is provided, map their API data structure to our flat form structure
   * - When no user is provided (new user scenario), reset to initial empty state
   * - Clear any previous error/success states when modal opens/user changes
   * - Uses optional chaining (?.) to safely access nested properties that might be undefined
   */
  useEffect(() => {
    if (user) {
      // Transform the nested User API structure into a flat form structure
      // This makes it easier to work with form inputs and validation
      setFormData({
        firstName: user.name.first || "",
        lastName: user.name.last || "",
        title: user.name.title || "",
        email: user.email || "",
        username: user.login.username || "",
        gender: user.gender || "male",
        phone: user.phone || "",
        cell: user.cell || "",
        // Handle nested street address structure with safe property access
        streetNumber: user.location.street?.number?.toString() || "",
        streetName: user.location.street?.name || "",
        city: user.location.city || "",
        state: user.location.state || "",
        country: user.location.country || "",
        postcode: user.location.postcode || "",
      });
    } else {
      // Reset to empty form when no user is selected (for new user creation)
      setFormData(initialFormData);
    }

    // Reset error and success states whenever the modal opens or user changes
    // This prevents stale messages from previous operations
    setError(null);
    setSuccess(false);
  }, [user, open]); // Dependencies: re-run when user data or modal open state changes

  /**
   * Higher-order function that creates input change handlers for specific form fields
   *
   * This pattern allows us to:
   * - Create reusable change handlers for any form field
   * - Maintain type safety with TypeScript
   * - Use the same handler pattern across all form inputs
   *
   * @param field - The form field name (must be a key of FormData)
   * @returns A function that handles the input change event
   */
  const handleInputChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // Update only the specific field while preserving all other form data
      setFormData((prev) => ({
        ...prev, // Spread operator to keep all existing form data
        [field]: event.target.value, // Update only the changed field
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const updateData: UpdateUserRequest = {
        name: {
          first: formData.firstName,
          last: formData.lastName,
          title: formData.title,
        },
        email: formData.email,
        login: {
          username: formData.username,
        },
        gender: formData.gender,
        location: {
          street: {
            number: parseInt(formData.streetNumber) || 0,
            name: formData.streetName,
          },
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postcode: formData.postcode,
        },
      };

      await usersApi.updateUser(user.login.uuid, updateData);
      setSuccess(true);
      onUserUpdated();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "600px" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Edit User
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              User updated successfully!
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={handleInputChange("title")}
                fullWidth
                size="small"
                select
              >
                <MenuItem value="Mr">Mr</MenuItem>
                <MenuItem value="Mrs">Mrs</MenuItem>
                <MenuItem value="Ms">Ms</MenuItem>
                <MenuItem value="Dr">Dr</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange("gender")}
                fullWidth
                size="small"
                select
                required
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={handleInputChange("username")}
                fullWidth
                size="small"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Cell Phone"
                value={formData.cell}
                onChange={handleInputChange("cell")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Number"
                value={formData.streetNumber}
                onChange={handleInputChange("streetNumber")}
                fullWidth
                size="small"
                type="number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Name"
                value={formData.streetName}
                onChange={handleInputChange("streetName")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={formData.city}
                onChange={handleInputChange("city")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={formData.state}
                onChange={handleInputChange("state")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={handleInputChange("country")}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={formData.postcode}
                onChange={handleInputChange("postcode")}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || success}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Updating..." : "Update User"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
