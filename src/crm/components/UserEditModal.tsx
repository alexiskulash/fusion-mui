import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import { User, updateUser, UpdateUserRequest } from "../services/usersApi";

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  cell: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export default function UserEditModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: UserEditModalProps) {
  const [formData, setFormData] = React.useState<FormData>({
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    phone: "",
    cell: "",
    streetNumber: "",
    streetName: "",
    city: "",
    state: "",
    country: "",
    postcode: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name?.first || "",
        lastName: user.name?.last || "",
        title: user.name?.title || "",
        email: user.email || "",
        phone: user.phone || "",
        cell: user.cell || "",
        streetNumber: user.location?.street?.number?.toString() || "",
        streetName: user.location?.street?.name || "",
        city: user.location?.city || "",
        state: user.location?.state || "",
        country: user.location?.country || "",
        postcode: user.location?.postcode || "",
      });
    }
  }, [user]);

  const handleInputChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
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
        phone: formData.phone,
        cell: formData.cell,
      };

      await updateUser(user.login.uuid, updateData);
      setSuccess(true);
      onUserUpdated();
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.picture?.medium}
              alt={`${user.name?.first} ${user.name?.last}`}
              sx={{ width: 48, height: 48 }}
            >
              {user.name?.first?.charAt(0)}
              {user.name?.last?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">Edit User Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.login?.username}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Contact Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
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
                  label="Phone"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile"
                  value={formData.cell}
                  onChange={handleInputChange("cell")}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Street Number"
                  value={formData.streetNumber}
                  onChange={handleInputChange("streetNumber")}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={9}>
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
                  label="State/Province"
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

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {loading ? "Updating..." : "Update User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          User updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
