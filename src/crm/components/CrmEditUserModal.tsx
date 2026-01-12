import * as React from "react";
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
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone?: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob?: {
    date: string;
    age: number;
  };
  registered?: {
    date: string;
    age: number;
  };
  phone: string;
  cell?: string;
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat?: string;
}

interface EditUserModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => Promise<void>;
}

export default function CrmEditUserModal({
  open,
  user,
  onClose,
  onUpdate,
}: EditUserModalProps) {
  const [formData, setFormData] = React.useState<User>(user);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(user);
    setError(null);
    setSuccess(false);
  }, [user, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to update user: ${response.statusText}`,
        );
      }

      setSuccess(true);
      await onUpdate(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      console.error("Error updating user:", err);
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
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={user.picture?.large}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 48, height: 48 }}
          >
            {user.name.first[0]}
            {user.name.last[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">Edit User</Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.login.username}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              User updated successfully!
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.name.title}
                  label="Title"
                  onChange={(e) => handleChange("name.title", e.target.value)}
                >
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Miss">Miss</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                fullWidth
                size="small"
                required
                value={formData.name.first}
                onChange={(e) => handleChange("name.first", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                fullWidth
                size="small"
                required
                value={formData.name.last}
                onChange={(e) => handleChange("name.last", e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                size="small"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cell"
                fullWidth
                size="small"
                value={formData.cell || ""}
                onChange={(e) => handleChange("cell", e.target.value)}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Address
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Street Number"
                fullWidth
                size="small"
                type="number"
                value={formData.location.street.number}
                onChange={(e) =>
                  handleChange(
                    "location.street.number",
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                label="Street Name"
                fullWidth
                size="small"
                value={formData.location.street.name}
                onChange={(e) =>
                  handleChange("location.street.name", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                fullWidth
                size="small"
                value={formData.location.city}
                onChange={(e) => handleChange("location.city", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                fullWidth
                size="small"
                value={formData.location.state}
                onChange={(e) => handleChange("location.state", e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                size="small"
                value={formData.location.country}
                onChange={(e) =>
                  handleChange("location.country", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postcode"
                fullWidth
                size="small"
                value={formData.location.postcode}
                onChange={(e) =>
                  handleChange("location.postcode", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
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
