/**
 * EditUserDialog Component
 *
 * A modal dialog component for editing user information in the CRM system.
 * This component provides a comprehensive form for updating all user details
 * including personal information, contact details, and address.
 *
 * Features:
 * - Full CRUD operations for user data
 * - Form validation for required fields
 * - Loading states during save operations
 * - Deep nested object updates via dot notation
 * - Responsive grid layout that adapts to screen size
 *
 * @module EditUserDialog
 */

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

/**
 * User interface representing the structure of a user object
 * This matches the API schema from https://user-api.builder-io.workers.dev/api
 */
interface User {
  /** Login credentials and unique identifier */
  login: {
    /** Unique user identifier (UUID format) */
    uuid: string;
    /** User's login username */
    username: string;
  };
  /** User's full name details */
  name: {
    /** Title (Mr, Mrs, Ms, Miss) */
    title: string;
    /** First/given name */
    first: string;
    /** Last/family name */
    last: string;
  };
  /** User's gender (male/female) */
  gender: string;
  /** Primary email address */
  email: string;
  /** Primary phone number */
  phone: string;
  /** Mobile/cell phone number */
  cell: string;
  /** Physical address details */
  location: {
    /** Street address components */
    street: {
      /** Street number */
      number: number;
      /** Street name */
      name: string;
    };
    /** City name */
    city: string;
    /** State/province */
    state: string;
    /** Country name */
    country: string;
    /** Postal/ZIP code */
    postcode: string;
  };
}

/**
 * Props for the EditUserDialog component
 */
interface EditUserDialogProps {
  /** Controls whether the dialog is visible */
  open: boolean;
  /** The user object to edit, or null if no user is selected */
  user: User | null;
  /** Callback function to close the dialog */
  onClose: () => void;
  /** Async callback function to save the updated user data */
  onSave: (updatedUser: User) => Promise<void>;
}

/**
 * EditUserDialog Component
 *
 * Modal dialog for editing user information with form validation and API integration.
 *
 * @param {EditUserDialogProps} props - Component props
 * @returns {JSX.Element | null} The rendered dialog or null if no form data
 */
export default function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: EditUserDialogProps) {
  // Local state to store the form data being edited
  const [formData, setFormData] = React.useState<User | null>(null);

  // Loading state to show spinner during save operations
  const [loading, setLoading] = React.useState(false);

  /**
   * Effect to populate form data when a user is selected for editing
   * This creates a local copy of the user object to avoid mutating the original
   */
  React.useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  /**
   * Handles changes to form fields, supporting nested object updates via dot notation
   *
   * This function allows updating deeply nested properties using a string path
   * like "name.first" or "location.street.number". It creates a new object with
   * the updated value while maintaining immutability.
   *
   * @param {string} field - Dot-notation path to the field (e.g., "name.first")
   * @param {any} value - The new value to set
   *
   * @example
   * handleChange("name.first", "John")
   * handleChange("location.city", "New York")
   */
  const handleChange = (field: string, value: any) => {
    if (!formData) return;

    // Split the field path into parts (e.g., "name.first" becomes ["name", "first"])
    const fieldParts = field.split(".");

    setFormData((prev) => {
      if (!prev) return prev;

      // Create a shallow copy of the user object
      const newData = { ...prev };
      let current: any = newData;

      // Traverse the object tree, creating copies of each nested level
      // This ensures we don't mutate the original nested objects
      for (let i = 0; i < fieldParts.length - 1; i++) {
        current[fieldParts[i]] = { ...current[fieldParts[i]] };
        current = current[fieldParts[i]];
      }

      // Set the final value at the leaf node
      current[fieldParts[fieldParts.length - 1]] = value;
      return newData;
    });
  };

  /**
   * Handles form submission
   *
   * Prevents default form behavior, shows loading state, calls the save callback,
   * and closes the dialog on success. Errors are logged to the console.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Form submit event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;

    setLoading(true);
    try {
      // Call the parent's save handler (which typically makes an API request)
      await onSave(formData);
      // Close the dialog on successful save
      onClose();
    } catch (error) {
      // Log errors for debugging (in production, consider showing user-friendly error messages)
      console.error("Error saving user:", error);
    } finally {
      // Always reset loading state, even if there was an error
      setLoading(false);
    }
  };

  // Don't render the dialog if there's no form data
  if (!formData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md" // Medium width dialog for better form layout
      fullWidth // Take up full width up to maxWidth
      slotProps={{
        paper: {
          // Make the dialog paper component a form element
          component: "form",
          onSubmit: handleSubmit,
          // Remove default background image for cleaner appearance
          sx: { backgroundImage: "none" },
        },
      }}
    >
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Responsive grid layout: stacks on mobile, side-by-side on larger screens */}
        <Grid container spacing={2}>
          {/* Personal Information Section */}

          {/* Title field - dropdown selector (Mr, Mrs, Ms, Miss) */}
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

          {/* First name - required field */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.name.first}
              onChange={(e) => handleChange("name.first", e.target.value)}
              required
            />
          </Grid>

          {/* Last name - required field */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.name.last}
              onChange={(e) => handleChange("name.last", e.target.value)}
              required
            />
          </Grid>
          {/* Contact Information Section */}

          {/* Email - required field with email validation */}
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

          {/* Gender - dropdown selector (Male/Female) */}
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

          {/* Primary phone number - optional field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </Grid>

          {/* Cell/mobile phone number - optional field */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cell"
              value={formData.cell}
              onChange={(e) => handleChange("cell", e.target.value)}
            />
          </Grid>

          {/* Address Information Section */}

          {/* Street number - parsed as integer */}
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

          {/* Street name */}
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

          {/* City name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.location.city}
              onChange={(e) => handleChange("location.city", e.target.value)}
            />
          </Grid>

          {/* State/province */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={formData.location.state}
              onChange={(e) => handleChange("location.state", e.target.value)}
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={formData.location.country}
              onChange={(e) => handleChange("location.country", e.target.value)}
            />
          </Grid>

          {/* Postal/ZIP code */}
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

      {/* Dialog Action Buttons */}
      <DialogActions sx={{ pb: 3, px: 3 }}>
        {/* Cancel button - closes dialog without saving */}
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>

        {/* Submit button - saves changes and closes dialog */}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? (
            // Show loading spinner and text during save operation
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={20} />
              Saving...
            </Box>
          ) : (
            // Default button text when not loading
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
