import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";

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
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
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

interface EditUserModalProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

const titleOptions = ["Mr", "Mrs", "Ms", "Miss", "Dr"];
const genderOptions = ["male", "female"];

export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [formData, setFormData] = React.useState<User>(user);

  // Update form data when user prop changes
  React.useEffect(() => {
    setFormData(user);
  }, [user]);

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
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

  // Handle save
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {/* Avatar and basic info */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={formData.picture.large}
                alt={`${formData.name.first} ${formData.name.last}`}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h6">
                  {formData.name.first} {formData.name.last}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{formData.login.username}
                </Typography>
              </Box>
            </Stack>

            {/* Name fields */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  label="Title"
                  value={formData.name.title}
                  onChange={(e) => handleChange("name.title", e.target.value)}
                  size="small"
                >
                  {titleOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4.5}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.name.first}
                  onChange={(e) => handleChange("name.first", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4.5}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.name.last}
                  onChange={(e) => handleChange("name.last", e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Contact fields */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.login.username}
                  onChange={(e) =>
                    handleChange("login.username", e.target.value)
                  }
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Phone fields */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cell"
                  value={formData.cell}
                  onChange={(e) => handleChange("cell", e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Gender */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  size="small"
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Location fields */}
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Number"
                  type="number"
                  value={formData.location.street.number}
                  onChange={(e) =>
                    handleChange(
                      "location.street.number",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  size="small"
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
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.location.city}
                  onChange={(e) =>
                    handleChange("location.city", e.target.value)
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.location.state}
                  onChange={(e) =>
                    handleChange("location.state", e.target.value)
                  }
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.location.country}
                  onChange={(e) =>
                    handleChange("location.country", e.target.value)
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Postcode"
                  value={formData.location.postcode}
                  onChange={(e) =>
                    handleChange("location.postcode", e.target.value)
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
