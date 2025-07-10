import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Avatar,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { User, UpdateUserRequest } from "../types/User";
import { usersApi } from "../services/usersApi";

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  cell?: string;
}

const titleOptions = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"];

export default function EditUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
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

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.first,
        lastName: user.name.last,
        title: user.name.title,
        email: user.email,
        phone: user.phone,
        cell: user.cell,
        streetNumber: user.location.street.number.toString(),
        streetName: user.location.street.name,
        city: user.location.city,
        state: user.location.state,
        country: user.location.country,
        postcode: user.location.postcode,
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.cell && !/^[\d\s\-\+\(\)]+$/.test(formData.cell)) {
      newErrors.cell = "Please enter a valid cell number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } },
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleSubmit = async () => {
    if (!user || !validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const updateData: UpdateUserRequest = {
        name: {
          first: formData.firstName,
          last: formData.lastName,
          title: formData.title,
        },
        email: formData.email,
        phone: formData.phone,
        cell: formData.cell,
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
      onSuccess();
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update user",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.picture.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
          />
          <Box>
            <Typography variant="h6">Edit User</Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.login.username}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Title</InputLabel>
              <Select
                value={formData.title}
                label="Title"
                onChange={handleInputChange("title")}
              >
                {titleOptions.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName}
              required
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange("phone")}
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cell"
              value={formData.cell}
              onChange={handleInputChange("cell")}
              error={!!errors.cell}
              helperText={errors.cell}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Address Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Street Number"
              value={formData.streetNumber}
              onChange={handleInputChange("streetNumber")}
            />
          </Grid>

          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Street Name"
              value={formData.streetName}
              onChange={handleInputChange("streetName")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange("city")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleInputChange("state")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={handleInputChange("country")}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postcode"
              value={formData.postcode}
              onChange={handleInputChange("postcode")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
