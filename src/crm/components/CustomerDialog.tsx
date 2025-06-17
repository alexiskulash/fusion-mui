import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  Paper,
  Stack,
} from "@mui/material";

interface Customer {
  id?: string;
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  cell?: string;
  location: {
    city: string;
    state: string;
    country: string;
    street?: {
      number: number;
      name: string;
    };
    postcode?: string;
  };
  picture?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  dob?: {
    age: number;
  };
  registered?: {
    date: string;
  };
  gender: string;
}

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: "create" | "edit";
  customer?: Customer;
}

interface FormData {
  email: string;
  login: {
    username: string;
    password: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  phone: string;
  cell: string;
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

const initialFormData: FormData = {
  email: "",
  login: {
    username: "",
    password: "",
  },
  name: {
    title: "Mr",
    first: "",
    last: "",
  },
  gender: "male",
  location: {
    street: {
      number: 0,
      name: "",
    },
    city: "",
    state: "",
    country: "USA",
    postcode: "",
  },
  phone: "",
  cell: "",
};

const titleOptions = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Dr", label: "Dr" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function CustomerDialog({
  open,
  onClose,
  onSave,
  mode,
  customer,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && customer) {
      setFormData({
        email: customer.email,
        login: {
          username: customer.login.username,
          password: "",
        },
        name: {
          title: customer.name.title,
          first: customer.name.first,
          last: customer.name.last,
        },
        gender: customer.gender,
        location: {
          street: {
            number: customer.location.street?.number || 0,
            name: customer.location.street?.name || "",
          },
          city: customer.location.city,
          state: customer.location.state,
          country: customer.location.country,
          postcode: customer.location.postcode || "",
        },
        phone: customer.phone,
        cell: customer.cell || "",
      });
    } else {
      setFormData(initialFormData);
    }
    setError(null);
  }, [mode, customer, open]);

  const handleChange =
    (field: string) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: unknown } },
    ) => {
      const value = event.target.value;
      const keys = field.split(".");

      setFormData((prev) => {
        const newData = { ...prev };
        let current: any = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return "Email is required";
    if (!formData.login.username.trim()) return "Username is required";
    if (!formData.name.first.trim()) return "First name is required";
    if (!formData.name.last.trim()) return "Last name is required";
    if (mode === "create" && !formData.login.password.trim()) {
      return "Password is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url =
        mode === "create"
          ? `${API_BASE_URL}/users`
          : `${API_BASE_URL}/users/${customer?.login.uuid}`;

      const method = mode === "create" ? "POST" : "PUT";

      const submitData = { ...formData };
      if (mode === "edit" && !submitData.login.password.trim()) {
        delete (submitData.login as any).password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${mode} customer`);
      }

      onSave();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to ${mode} customer`,
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          {mode === "create" ? "Add New Customer" : "Edit Customer"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Personal Information Section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.name.title}
                    label="Title"
                    onChange={handleChange("name.title")}
                  >
                    {titleOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.name.first}
                  onChange={handleChange("name.first")}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.name.last}
                  onChange={handleChange("name.last")}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Gender"
                    onChange={handleChange("gender")}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Account Information Section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.login.username}
                  onChange={handleChange("login.username")}
                  required
                />
              </Grid>

              {mode === "create" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.login.password}
                    onChange={handleChange("login.password")}
                    required
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Contact Information Section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primary Phone"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Phone"
                  value={formData.cell}
                  onChange={handleChange("cell")}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Address Information Section */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Address Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Number"
                  type="number"
                  value={formData.location.street.number || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChange("location.street.number")({
                      target: { value },
                    });
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={10}>
                <TextField
                  fullWidth
                  label="Street Name"
                  value={formData.location.street.name}
                  onChange={handleChange("location.street.name")}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.location.city}
                  onChange={handleChange("location.city")}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.location.state}
                  onChange={handleChange("location.state")}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.location.country}
                  onChange={handleChange("location.country")}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.location.postcode}
                  onChange={handleChange("location.postcode")}
                />
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Add Customer"
              : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
