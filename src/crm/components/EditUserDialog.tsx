import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  email: string;
  phone: string;
  cell: string;
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
}

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (updatedUser: User) => Promise<void>;
}

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const [formData, setFormData] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (field: string, value: any) => {
    if (!formData) return;

    const fieldParts = field.split(".");
    setFormData((prev) => {
      if (!prev) return prev;
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < fieldParts.length - 1; i++) {
        current[fieldParts[i]] = { ...current[fieldParts[i]] };
        current = current[fieldParts[i]];
      }

      current[fieldParts[fieldParts.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit,
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Title"
              value={formData.name.title}
              onChange={(e) => handleChange("name.title", e.target.value)}
              required
            >
              <MenuItem value="Mr">Mr</MenuItem>
              <MenuItem value="Mrs">Mrs</MenuItem>
              <MenuItem value="Ms">Ms</MenuItem>
              <MenuItem value="Miss">Miss</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.name.first}
              onChange={(e) => handleChange("name.first", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.name.last}
              onChange={(e) => handleChange("name.last", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              required
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cell"
              value={formData.cell}
              onChange={(e) => handleChange("cell", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Number"
              type="number"
              value={formData.location.street.number}
              onChange={(e) =>
                handleChange("location.street.number", parseInt(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Name"
              value={formData.location.street.name}
              onChange={(e) =>
                handleChange("location.street.name", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.location.city}
              onChange={(e) => handleChange("location.city", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.location.state}
              onChange={(e) => handleChange("location.state", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.location.country}
              onChange={(e) => handleChange("location.country", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postcode"
              value={formData.location.postcode}
              onChange={(e) => handleChange("location.postcode", e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              Saving...
            </Box>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
