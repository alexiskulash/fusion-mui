import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { User, UpdateUserRequest } from "../../types/user";

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, userData: UpdateUserRequest) => Promise<void>;
}

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [formData, setFormData] = React.useState<UpdateUserRequest>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
    }
  }, [user]);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => {
        const keys = field.split(".");
        const updated = { ...prev };

        if (keys.length === 1) {
          (updated as any)[keys[0]] = value;
        } else if (keys.length === 2) {
          (updated as any)[keys[0]] = {
            ...(updated as any)[keys[0]],
            [keys[1]]: value,
          };
        } else if (keys.length === 3) {
          (updated as any)[keys[0]] = {
            ...(updated as any)[keys[0]],
            [keys[1]]: {
              ...((updated as any)[keys[0]]?.[keys[1]] || {}),
              [keys[2]]: keys[2] === "number" ? parseInt(value) || 0 : value,
            },
          };
        }

        return updated;
      });
    };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await onSave(user.login.uuid, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
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
        sx: { minHeight: "600px" },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="h2">
          Edit User: {user.name.first} {user.name.last}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: 600 }}
              >
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.name?.title || ""}
                  label="Title"
                  onChange={(e) =>
                    handleInputChange("name.title")({
                      target: { value: e.target.value },
                    } as any)
                  }
                >
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={formData.name?.first || ""}
                onChange={handleInputChange("name.first")}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={formData.name?.last || ""}
                onChange={handleInputChange("name.last")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange("email")}
                required
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: 600 }}
              >
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone"
                value={formData.phone || ""}
                onChange={handleInputChange("phone")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Cell Phone"
                value={formData.cell || ""}
                onChange={handleInputChange("cell")}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, fontWeight: 600 }}
              >
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Street Number"
                type="number"
                value={formData.location?.street?.number || ""}
                onChange={handleInputChange("location.street.number")}
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                size="small"
                label="Street Name"
                value={formData.location?.street?.name || ""}
                onChange={handleInputChange("location.street.name")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={formData.location?.city || ""}
                onChange={handleInputChange("location.city")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="State"
                value={formData.location?.state || ""}
                onChange={handleInputChange("location.state")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                value={formData.location?.country || ""}
                onChange={handleInputChange("location.country")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Postal Code"
                value={formData.location?.postcode || ""}
                onChange={handleInputChange("location.postcode")}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
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
