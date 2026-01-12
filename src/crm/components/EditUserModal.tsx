import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface UserLogin {
  uuid: string;
  username: string;
}

interface User {
  login: UserLogin;
  name: UserName;
  email: string;
  phone: string;
  cell: string;
  gender: string;
  location: UserLocation;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat: string;
}

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<User>>({});

  React.useEffect(() => {
    if (user) {
      setFormData(user);
      setError(null);
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      // Handle nested fields like "name.first" or "location.city"
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${user.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      onSave(formData as User);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.name?.title || ""}
                  onChange={(e) => handleChange("name.title", e.target.value)}
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
            <Grid item xs={12} sm={4}>
              <TextField
                label="First Name"
                value={formData.name?.first || ""}
                onChange={(e) => handleChange("name.first", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Last Name"
                value={formData.name?.last || ""}
                onChange={(e) => handleChange("name.last", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
          </Grid>

          <TextField
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            size="small"
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cell"
                value={formData.cell || ""}
                onChange={(e) => handleChange("cell", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <FormControl fullWidth size="small">
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender || ""}
              onChange={(e) => handleChange("gender", e.target.value)}
              label="Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Number"
                type="number"
                value={formData.location?.street?.number || ""}
                onChange={(e) =>
                  handleChange("location.street.number", Number(e.target.value))
                }
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Street Name"
                value={formData.location?.street?.name || ""}
                onChange={(e) =>
                  handleChange("location.street.name", e.target.value)
                }
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={formData.location?.city || ""}
                onChange={(e) => handleChange("location.city", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={formData.location?.state || ""}
                onChange={(e) => handleChange("location.state", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={formData.location?.country || ""}
                onChange={(e) =>
                  handleChange("location.country", e.target.value)
                }
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postcode"
                value={formData.location?.postcode || ""}
                onChange={(e) =>
                  handleChange("location.postcode", e.target.value)
                }
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
