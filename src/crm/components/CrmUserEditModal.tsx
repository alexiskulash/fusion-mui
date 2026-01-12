import * as React from "react";
import { useState } from "react";
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
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";

interface User {
  login: {
    uuid: string;
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
  email: string;
  dob: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface CrmUserEditModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function CrmUserEditModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: CrmUserEditModalProps) {
  const [formData, setFormData] = useState({
    title: user.name?.title || "",
    firstName: user.name?.first || "",
    lastName: user.name?.last || "",
    email: user.email || "",
    gender: user.gender || "",
    phone: user.phone || "",
    cell: user.cell || "",
    streetNumber: user.location?.street?.number || 0,
    streetName: user.location?.street?.name || "",
    city: user.location?.city || "",
    state: user.location?.state || "",
    country: user.location?.country || "",
    postcode: user.location?.postcode || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Construct the update payload
      const updatePayload = {
        name: {
          title: formData.title,
          first: formData.firstName,
          last: formData.lastName,
        },
        email: formData.email,
        gender: formData.gender,
        phone: formData.phone,
        cell: formData.cell,
        location: {
          street: {
            number: Number(formData.streetNumber),
            name: formData.streetName,
          },
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postcode: formData.postcode,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      setSuccess(true);
      setTimeout(() => {
        onUserUpdated();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* User Avatar and Username */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              src={user.picture?.large}
              alt={`${formData.firstName} ${formData.lastName}`}
              sx={{ width: 64, height: 64 }}
            />
            <Box>
              <TextField
                label="Username"
                value={user.login?.username || ""}
                disabled
                size="small"
                helperText="Username cannot be changed"
              />
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">User updated successfully!</Alert>
          )}

          {/* Name Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Title</InputLabel>
                <Select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  label="Title"
                >
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Miss">Miss</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                required
                fullWidth
                size="small"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                required
                fullWidth
                size="small"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Contact Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                size="small"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Phone Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Cell"
                name="cell"
                value={formData.cell}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* Address Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Street Number"
                name="streetNumber"
                type="number"
                value={formData.streetNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                size="small"
                label="Street Name"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
