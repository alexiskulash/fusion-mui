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

  React.useEffect(() => {
    if (user) {
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
        streetNumber: user.location.street?.number?.toString() || "",
        streetName: user.location.street?.name || "",
      });
    }
  }, [user]);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
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
            number: parseInt(formData.streetNumber) || 0,
            name: formData.streetName,
          },
        },
      };

      await usersApi.updateUser(user.login.uuid, updateData);
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
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
