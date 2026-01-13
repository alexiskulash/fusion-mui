import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

/**
 * Base URL for the Users API
 * API Documentation: https://user-api.builder-io.workers.dev/api
 * Endpoints:
 * - GET /users - List users with pagination and search
 * - GET /users/:id - Get specific user
 * - PUT /users/:id - Update user
 * - DELETE /users/:id - Delete user
 */
const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

/**
 * User interface matching the API response structure
 * Represents a complete user object with login credentials, personal info,
 * location data, and contact information
 */
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

/**
 * Form data interface for the edit dialog
 * Contains only the fields that can be edited by users
 */
interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

/**
 * Customers Page Component
 * 
 * Displays a searchable, paginated table of users from the Users API.
 * Features:
 * - Server-side pagination
 * - Search functionality with debouncing
 * - Edit user via modal dialog
 * - Delete user with confirmation
 * - Success/error notifications
 * 
 * @returns {JSX.Element} The Customers page with user management table
 */
export default function Customers() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  /**
   * Array of users fetched from the API
   * Updated when pagination changes or search is performed
   */
  const [users, setUsers] = useState<User[]>([]);
  
  /**
   * Loading state for API requests
   * Shows loading indicator in DataGrid while fetching data
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * Total number of users available on the server
   * Used for server-side pagination to calculate total pages
   */
  const [total, setTotal] = useState(0);
  
  /**
   * Pagination state for DataGrid
   * Controls current page and number of items per page
   */
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  
  /**
   * Current value of the search input field
   * Updates immediately as user types
   */
  const [searchQuery, setSearchQuery] = useState("");
  
  /**
   * Debounced search value
   * Only updates after 500ms of no typing to reduce API calls
   */
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  /**
   * Controls visibility of the edit user dialog
   */
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  /**
   * Currently selected user for editing
   * Null when no user is selected
   */
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  /**
   * Form data for the edit dialog
   * Populated when a user clicks the edit button
   */
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });
  
  /**
   * Snackbar notification state
   * Used to display success/error messages after operations
   */
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Debounce Effect
   * Delays the search query update to avoid excessive API calls while typing.
   * Waits 500ms after the user stops typing before updating debouncedSearch.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    // Cleanup: clear timeout if searchQuery changes before 500ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Fetch Users from API
   * 
   * Makes a GET request to /users with pagination and search parameters.
   * Updates the users list and total count when response is received.
   * 
   * Dependencies:
   * - paginationModel: Refetch when page or pageSize changes
   * - debouncedSearch: Refetch when search query is updated (after debounce)
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters for the API request
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1), // API uses 1-based pagination
        perPage: String(paginationModel.pageSize),
      });

      // Add search parameter if user has entered a search query
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      const data = await response.json();

      // Update state with fetched data
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch]);

  /**
   * Fetch Effect
   * Triggers fetchUsers whenever pagination or search changes
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle Edit Button Click
   * 
   * Opens the edit dialog and populates the form with the selected user's data.
   * 
   * @param {User} user - The user object to edit
   */
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      state: user.location.state,
      country: user.location.country,
      phone: user.phone,
    });
    setEditDialogOpen(true);
  };

  /**
   * Handle Delete User
   * 
   * Deletes a user after confirmation. Makes a DELETE request to the API
   * and refreshes the user list on success.
   * 
   * @param {string} userId - UUID of the user to delete
   */
  const handleDelete = async (userId: string) => {
    // Confirm deletion with native browser dialog
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
        // Refresh the user list to reflect the deletion
        fetchUsers();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      });
    }
  };

  /**
   * Handle Edit Form Submit
   * 
   * Sends a PUT request to update the user's information.
   * Closes the dialog and refreshes the list on success.
   */
  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: formData.firstName,
              last: formData.lastName,
            },
            email: formData.email,
            location: {
              city: formData.city,
              state: formData.state,
              country: formData.country,
            },
            phone: formData.phone,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
        setEditDialogOpen(false);
        // Refresh the user list to show updated data
        fetchUsers();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setSnackbar({
        open: true,
        message: "Failed to update user",
        severity: "error",
      });
    }
  };

  // ============================================================================
  // DATAGRID COLUMN DEFINITIONS
  // ============================================================================
  
  /**
   * Column definitions for the DataGrid
   * Defines how each column should be displayed and what data to show
   */
  const columns: GridColDef[] = [
    {
      field: "picture",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture.thumbnail}
          alt={`${params.row.name.first} ${params.row.name.last}`}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      // Combines first and last name for display
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 200,
      // Formats location as "City, State, Country"
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.state}, ${row.location.country}`,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      // Extracts age from nested dob object
      valueGetter: (value, row) => row.dob.age,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      // Displays gender as a colored chip
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      // Renders edit and delete action buttons
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            aria-label="Edit user"
            color="primary"
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.login.uuid)}
            aria-label="Delete user"
            color="error"
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3, color: "text.secondary" }}>
        Manage your customer database, search users, and update their
        information.
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Data Grid - Main users table */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.login.uuid} // Use UUID as unique row identifier
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          rowCount={total} // Total rows for server-side pagination
          paginationMode="server" // Enable server-side pagination
          loading={loading}
          density="compact"
          disableColumnResize
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* First Name Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </Grid>
            {/* Last Name Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </Grid>
            {/* Email Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Grid>
            {/* Phone Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            {/* City Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </Grid>
            {/* State Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </Grid>
            {/* Country Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success/Error Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
