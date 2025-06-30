import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Avatar,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { User, usersApi } from "../services/usersApi";

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  onUserUpdated: () => void;
}

export default function UserEditModal({
  open,
  onClose,
  user,
  onUserUpdated,
}: UserEditModalProps) {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    title: "",
    gender: "",
    phone: "",
    cell: "",
    city: "",
    state: "",
    country: "",
    postcode: "",
    streetNumber: "",
    streetName: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Effect to populate form fields when a user is selected for editing
   * Transforms the nested User object structure into a flat form data object
   * for easier form handling and input binding. This runs whenever the user prop changes.
   */
  React.useEffect(() => {
    if (user) {
      // Transform complex nested user object into simplified form structure
      // Each field is safely accessed with optional chaining and fallback to empty string
      setFormData({
        firstName: user.name.first || "",
        lastName: user.name.last || "",
        email: user.email || "",
        username: user.login.username || "",
        title: user.name.title || "",
        gender: user.gender || "",
        phone: user.phone || "",
        cell: user.cell || "",
        city: user.location.city || "",
        state: user.location.state || "",
        country: user.location.country || "",
        postcode: user.location.postcode || "",
        // Convert number to string for text input compatibility
        streetNumber: user.location.street?.number?.toString() || "",
        streetName: user.location.street?.name || "",
      });
    }
  }, [user]);

  /**
   * Higher-order function that creates field-specific change handlers
   * This pattern allows us to create reusable input handlers for each form field
   * Returns a function that updates the specified field in the form data state
   */
  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      // Update only the specific field while preserving all other form data
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  /**
   * Handles form submission when user clicks "Save Changes"
   * Transforms the flat form data structure back into the nested API format
   * and sends the update request to the backend API
   */
  const handleSubmit = async () => {
    // Safety check - ensure we have a user to update
    if (!user) return;

    // Start loading state to show progress indicator and disable form
    setLoading(true);
    setError(null);

    try {
      // Transform flat form data back into the nested structure expected by the API
      // This reverses the flattening done in the useEffect above
      const updateData = {
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
        phone: formData.phone,
        cell: formData.cell,
        location: {
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postcode: formData.postcode,
          street: {
            // Parse string input back to number, with fallback for invalid input
            number: parseInt(formData.streetNumber) || 0,
            name: formData.streetName,
          },
        },
      };

      // Send update request to API using the user's UUID as identifier
      await usersApi.updateUser(user.login.uuid, updateData);

      // Notify parent component to refresh the users list
      onUserUpdated();

      // Close modal after successful update
      onClose();
    } catch (err) {
      // Capture and display any API errors to the user
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always reset loading state regardless of success or failure
      setLoading(false);
    }
  };

  /**
   * Handles modal close with proper cleanup
   * Ensures any error state is cleared before closing to prevent
   * stale error messages from appearing when modal reopens
   */
  const handleClose = () => {
    // Clear any existing error messages for clean state on next open
    setError(null);
    // Delegate to parent component's close handler
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* Dialog header with user context for better UX */}
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Display user avatar when available for visual identification */}
          {user && (
            <Avatar
              src={user.picture.medium}
              alt={`${user.name.first} ${user.name.last}`}
            />
          )}
          <Typography variant="h6">
            Edit Customer: {user?.name.first} {user?.name.last}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Error alert displayed prominently at the top when API operations fail */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Title"
              value={formData.title}
              onChange={handleInputChange("title")}
              fullWidth
              size="small"
            >
              <MenuItem value="Mr">Mr</MenuItem>
              <MenuItem value="Ms">Ms</MenuItem>
              <MenuItem value="Mrs">Mrs</MenuItem>
              <MenuItem value="Dr">Dr</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Username"
              value={formData.username}
              onChange={handleInputChange("username")}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Gender"
              value={formData.gender}
              onChange={handleInputChange("gender")}
              fullWidth
              size="small"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
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
              label="Cell"
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

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
