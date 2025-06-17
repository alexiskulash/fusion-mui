import * as React from "react";
import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

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

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

const initialFormData = {
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

export default function CustomerDialog({
  open,
  onClose,
  onSave,
  mode,
  customer,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && customer) {
      setFormData({
        email: customer.email,
        login: {
          username: customer.login.username,
          password: "", // Don't populate password for edit
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

  const handleInputChange = (path: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.email) return "Email is required";
    if (!formData.login.username) return "Username is required";
    if (!formData.name.first) return "First name is required";
    if (!formData.name.last) return "Last name is required";
    if (mode === "create" && !formData.login.password)
      return "Password is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      return "Please enter a valid email address";

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

      // For edit mode, remove password if it's empty
      const submitData = { ...formData };
      if (mode === "edit" && !submitData.login.password) {
        delete submitData.login.password;
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Add New Customer" : "Edit Customer"}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Title</InputLabel>
              <Select
                value={formData.name.title}
                label="Title"
                onChange={(e) =>
                  handleInputChange("name.title", e.target.value)
                }
              >
                <MenuItem value="Mr">Mr</MenuItem>
                <MenuItem value="Mrs">Mrs</MenuItem>
                <MenuItem value="Ms">Ms</MenuItem>
                <MenuItem value="Dr">Dr</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4.5}>
            <TextField
              fullWidth
              size="small"
              label="First Name"
              value={formData.name.first}
              onChange={(e) => handleInputChange("name.first", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4.5}>
            <TextField
              fullWidth
              size="small"
              label="Last Name"
              value={formData.name.last}
              onChange={(e) => handleInputChange("name.last", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Account Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Username"
              value={formData.login.username}
              onChange={(e) =>
                handleInputChange("login.username", e.target.value)
              }
              required
            />
          </Grid>

          {mode === "create" && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Password"
                type="password"
                value={formData.login.password}
                onChange={(e) =>
                  handleInputChange("login.password", e.target.value)
                }
                required={mode === "create"}
              />
            </Grid>
          )}

          {/* Contact Information */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Cell Phone"
              value={formData.cell}
              onChange={(e) => handleInputChange("cell", e.target.value)}
            />
          </Grid>

          {/* Address Information */}
          <Grid item xs={12} sx={{ mt: 3, mb: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Address Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Street Number"
              type="number"
              value={formData.location.street.number}
              onChange={(e) =>
                handleInputChange(
                  "location.street.number",
                  parseInt(e.target.value) || 0,
                )
              }
            />
          </Grid>

          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              size="small"
              label="Street Name"
              value={formData.location.street.name}
              onChange={(e) =>
                handleInputChange("location.street.name", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="City"
              value={formData.location.city}
              onChange={(e) =>
                handleInputChange("location.city", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="State"
              value={formData.location.state}
              onChange={(e) =>
                handleInputChange("location.state", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Country"
              value={formData.location.country}
              onChange={(e) =>
                handleInputChange("location.country", e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Postal Code"
              value={formData.location.postcode}
              onChange={(e) =>
                handleInputChange("location.postcode", e.target.value)
              }
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
