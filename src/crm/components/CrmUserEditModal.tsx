import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { User, updateUser, UpdateUserData } from "../services/usersApi";

interface CrmUserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function CrmUserEditModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: CrmUserEditModalProps) {
  const [formData, setFormData] = React.useState<UpdateUserData>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Initialize form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: {
          title: user.name.title,
          first: user.name.first,
          last: user.name.last,
        },
        email: user.email,
        location: {
          street: {
            number: user.location.street.number,
            name: user.location.street.name,
          },
          city: user.location.city,
          state: user.location.state,
          country: user.location.country,
          postcode: user.location.postcode,
        },
        phone: user.phone,
        cell: user.cell,
      });
      setError(null);
      setSuccess(false);
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split('.');
      const newData = { ...prev };
      
      if (keys.length === 1) {
        (newData as any)[keys[0]] = value;
      } else if (keys.length === 2) {
        if (!(newData as any)[keys[0]]) {
          (newData as any)[keys[0]] = {};
        }
        (newData as any)[keys[0]][keys[1]] = value;
      } else if (keys.length === 3) {
        if (!(newData as any)[keys[0]]) {
          (newData as any)[keys[0]] = {};
        }
        if (!(newData as any)[keys[0]][keys[1]]) {
          (newData as any)[keys[0]][keys[1]] = {};
        }
        (newData as any)[keys[0]][keys[1]][keys[2]] = value;
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await updateUser(user.login.uuid, formData);
      setSuccess(true);
      setTimeout(() => {
        onUserUpdated();
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
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.picture.medium}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 48, height: 48 }}
          >
            {user.name.first[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">
              Edit Customer: {user.name.first} {user.name.last}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.login.username} • {user.email}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success">
              User updated successfully!
            </Alert>
          )}

          {/* Personal Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.name?.title || ""}
                    label="Title"
                    onChange={(e) => handleInputChange("name.title", e.target.value)}
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Mrs">Mrs</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Miss">Miss</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4.5}>
                <TextField
                  label="First Name"
                  value={formData.name?.first || ""}
                  onChange={(e) => handleInputChange("name.first", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4.5}>
                <TextField
                  label="Last Name"
                  value={formData.name?.last || ""}
                  onChange={(e) => handleInputChange("name.last", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Cell Phone"
                  value={formData.cell || ""}
                  onChange={(e) => handleInputChange("cell", e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Address Information */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Street Number"
                  type="number"
                  value={formData.location?.street?.number || ""}
                  onChange={(e) => handleInputChange("location.street.number", parseInt(e.target.value) || 0)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={9}>
                <TextField
                  label="Street Name"
                  value={formData.location?.street?.name || ""}
                  onChange={(e) => handleInputChange("location.street.name", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="City"
                  value={formData.location?.city || ""}
                  onChange={(e) => handleInputChange("location.city", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="State/Province"
                  value={formData.location?.state || ""}
                  onChange={(e) => handleInputChange("location.state", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Country"
                  value={formData.location?.country || ""}
                  onChange={(e) => handleInputChange("location.country", e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  value={formData.location?.postcode || ""}
                  onChange={(e) => handleInputChange("location.postcode", e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Updating..." : "Update User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
