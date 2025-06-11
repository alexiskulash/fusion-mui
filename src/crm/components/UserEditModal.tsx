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
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { User, UsersApiService, UpdateUserRequest } from "../services/usersApi";

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

export default function UserEditModal({
  open,
  user,
  onClose,
  onUserUpdated,
}: UserEditModalProps) {
  const [formData, setFormData] = React.useState<UpdateUserRequest>({});
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

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
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await UsersApiService.updateUser(user.login.uuid, formData);
      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
      onUserUpdated();
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to update user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      const newData = { ...prev };

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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={user.picture.thumbnail} sx={{ width: 40, height: 40 }}>
              {user.name.first.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6">
              Edit User: {user.name.first} {user.name.last}
            </Typography>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Title</InputLabel>
                  <Select
                    value={formData.name?.title || ""}
                    onChange={(e) =>
                      handleInputChange("name.title", e.target.value)
                    }
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
                  fullWidth
                  label="First Name"
                  value={formData.name?.first || ""}
                  onChange={(e) =>
                    handleInputChange("name.first", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.name?.last || ""}
                  onChange={(e) =>
                    handleInputChange("name.last", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cell Phone"
                  value={formData.cell || ""}
                  onChange={(e) => handleInputChange("cell", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Street Number"
                  type="number"
                  value={formData.location?.street?.number || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "location.street.number",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Street Name"
                  value={formData.location?.street?.name || ""}
                  onChange={(e) =>
                    handleInputChange("location.street.name", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.location?.city || ""}
                  onChange={(e) =>
                    handleInputChange("location.city", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.location?.state || ""}
                  onChange={(e) =>
                    handleInputChange("location.state", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.location?.country || ""}
                  onChange={(e) =>
                    handleInputChange("location.country", e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.location?.postcode || ""}
                  onChange={(e) =>
                    handleInputChange("location.postcode", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
