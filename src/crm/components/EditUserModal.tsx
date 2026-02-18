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

/**
 * Base URL for the Users API
 * This API provides CRUD operations for user management
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * Interface representing a user's physical location
 * Contains address details including street, city, state, country, and postal code
 */
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

/**
 * Interface representing a user's name components
 * Includes title (Mr, Mrs, etc.), first name, and last name
 */
interface UserName {
  title: string;
  first: string;
  last: string;
}

/**
 * Interface representing user login credentials
 * Contains unique identifier (UUID) and username
 */
interface UserLogin {
  uuid: string;
  username: string;
}

/**
 * Main User interface representing a complete user object
 * Contains all user information including personal details, contact info, and location
 */
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

/**
 * Props interface for the EditUserModal component
 */
interface EditUserModalProps {
  /** Controls whether the modal is visible */
  open: boolean;
  /** The user object to edit, or null if no user is selected */
  user: User | null;
  /** Callback function to close the modal */
  onClose: () => void;
  /** Callback function called after successfully saving user changes */
  onSave: (user: User) => void;
}

/**
 * EditUserModal Component
 * 
 * A modal dialog for editing user information. Provides a comprehensive form
 * for updating all user fields including name, contact information, and address.
 * 
 * Features:
 * - Form validation for required fields
 * - Loading state during API calls
 * - Error handling with user-friendly messages
 * - Nested object handling for complex data structures
 * 
 * @param props - Component props including open state, user data, and callbacks
 * @returns A Material-UI Dialog with user edit form
 */
export default function EditUserModal({
  open,
  user,
  onClose,
  onSave,
}: EditUserModalProps) {
  // Loading state for API calls (shows spinner in save button)
  const [loading, setLoading] = React.useState(false);
  
  // Error message state for displaying API or validation errors
  const [error, setError] = React.useState<string | null>(null);
  
  // Form data state - starts as partial to handle incremental updates
  const [formData, setFormData] = React.useState<Partial<User>>({});

  /**
   * Effect to populate form when user prop changes
   * Resets error state when a new user is loaded
   */
  React.useEffect(() => {
    if (user) {
      setFormData(user);
      setError(null);
    }
  }, [user]);

  /**
   * Generic change handler for form fields
   * Handles both flat and nested object properties
   * 
   * Examples:
   * - "email" updates formData.email
   * - "name.first" updates formData.name.first
   * - "location.city" updates formData.location.city
   * 
   * @param field - Dot-notation path to the field (e.g., "name.first")
   * @param value - New value for the field
   */
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const keys = field.split(".");
      
      // Handle simple, non-nested fields
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      // Handle nested fields using dot notation
      // Creates a deep copy to avoid mutating state
      const newData = { ...prev };
      let current: any = newData;
      
      // Navigate to the parent object, creating missing intermediate objects
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          // Clone the nested object to maintain immutability
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  /**
   * Form submission handler
   * Sends PUT request to API to update user data
   * 
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Send PUT request to update user
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

      // Call parent's save handler with updated data
      onSave(formData as User);
    } catch (err) {
      // Display error message to user
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      // Always stop loading, regardless of success/failure
      setLoading(false);
    }
  };

  // Don't render modal if no user is selected
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
          {/* Error alert banner - only shown when error exists */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Name section: Title, First Name, Last Name */}
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

          {/* Email field - required */}
          <TextField
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
            size="small"
            required
          />

          {/* Contact numbers: Phone and Cell */}
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

          {/* Gender selection */}
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

          {/* Address section: Street Number and Street Name */}
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

          {/* Address section: City and State */}
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

          {/* Address section: Country and Postcode */}
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
      
      {/* Modal action buttons */}
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {/* Show spinner during API call, otherwise show text */}
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
