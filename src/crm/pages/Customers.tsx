/**
 * Customers Page Component
 *
 * This component provides a comprehensive customer management interface with the following features:
 * - Display users in a paginated data table using MUI DataGrid
 * - Search functionality to filter users by name, email, or city
 * - Edit user information through a modal dialog
 * - Integration with the Builder.io Users API for CRUD operations
 *
 * @component
 */

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

/**
 * Represents the location information for a user
 * Matches the API response structure from the Users API
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
 * Complete user object structure as returned by the Users API
 * This interface matches the API response format from:
 * https://user-api.builder-io.workers.dev/api/users
 */
interface User {
  login: {
    uuid: string; // Unique identifier used for API operations
    username: string;
  };
  name: {
    title: string; // Mr, Mrs, Ms, etc.
    first: string;
    last: string;
  };
  gender: string;
  location: UserLocation;
  email: string;
  dob: {
    date: string; // ISO date string
    age: number; // Calculated age
  };
  registered: {
    date: string; // ISO date string of registration
    age: number; // Years since registration
  };
  phone: string;
  cell: string;
  picture?: {
    large: string;
    medium: string;
    thumbnail: string; // Used in the avatar column
  };
  nat: string; // Nationality code
}

/**
 * Form data structure for the edit dialog
 * Contains only the editable fields from the User object
 */
interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

export default function Customers() {
  // ========== State Management ==========

  /**
   * Array of user objects fetched from the API
   * Updated when page changes or search is performed
   */
  const [users, setUsers] = React.useState<User[]>([]);

  /**
   * Loading state for the DataGrid
   * Shows skeleton/spinner while fetching data
   */
  const [loading, setLoading] = React.useState(false);

  /**
   * Current search query entered by the user
   * Used to filter users by name, email, or city
   */
  const [searchQuery, setSearchQuery] = React.useState("");

  /**
   * Current page number (1-indexed)
   * The API uses 1-based pagination, but DataGrid uses 0-based
   */
  const [page, setPage] = React.useState(1);

  /**
   * Total number of users matching the current search/filter
   * Used by DataGrid to calculate total pages
   */
  const [totalUsers, setTotalUsers] = React.useState(0);

  /**
   * Controls the visibility of the edit user dialog
   */
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  /**
   * The user currently being edited
   * Null when no user is selected
   */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  /**
   * Form data for the edit dialog
   * Populated when a user is selected for editing
   */
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });

  // ========== API Functions ==========

  /**
   * Fetches users from the Users API with pagination and search support
   *
   * @param currentPage - The page number to fetch (1-indexed)
   * @param search - Optional search query to filter users
   *
   * API Endpoint: GET https://user-api.builder-io.workers.dev/api/users
   * Query Parameters:
   * - page: Page number (1-based)
   * - perPage: Number of results per page (fixed at 20)
   * - search: Optional search string to filter by name, email, or city
   */
  const fetchUsers = React.useCallback(
    async (currentPage: number, search: string) => {
      setLoading(true);
      try {
        // Build query parameters for the API request
        const params = new URLSearchParams({
          page: currentPage.toString(),
          perPage: "20", // Fixed page size for consistent UX
        });

        // Add search parameter only if user has entered a search query
        if (search) {
          params.append("search", search);
        }

        // Fetch users from the API
        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`
        );
        const data = await response.json();

        // Update state with fetched data
        // Use empty array as fallback if data is missing
        setUsers(data.data || []);
        setTotalUsers(data.total || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Could add error state/notification here in production
      } finally {
        // Always turn off loading state, even if request fails
        setLoading(false);
      }
    },
    [] // No dependencies - function is stable across renders
  );

  /**
   * Effect: Fetch users when page changes
   * Also runs on initial mount to load the first page
   */
  React.useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, fetchUsers]); // Re-run when page changes

  // ========== Event Handlers ==========

  /**
   * Handles search button click
   * Resets to page 1 to show results from the beginning
   */
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchUsers(1, searchQuery);
  };

  /**
   * Handles Enter key press in the search field
   * Allows users to search without clicking the button
   *
   * @param event - Keyboard event from the TextField
   */
  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * Opens the edit dialog for a specific user
   * Populates the form with the user's current data
   *
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);

    // Pre-populate the form with current user data
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      phone: user.phone,
      city: user.location.city,
      country: user.location.country,
    });

    setEditDialogOpen(true);
  };

  /**
   * Closes the edit dialog and clears selected user
   * Called when user clicks Cancel or closes the dialog
   */
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  /**
   * Updates a single field in the edit form
   * Uses functional update pattern for type safety
   *
   * @param field - The field name to update
   * @param value - The new value for the field
   */
  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Saves the edited user data to the API
   * Sends a PUT request with the updated fields
   *
   * API Endpoint: PUT https://user-api.builder-io.workers.dev/api/users/:uuid
   * Request Body: Nested object structure matching the User interface
   */
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      // Construct the update payload with nested structure
      // Only includes editable fields
      const updatePayload = {
        name: {
          first: editFormData.firstName,
          last: editFormData.lastName,
        },
        email: editFormData.email,
        phone: editFormData.phone,
        location: {
          city: editFormData.city,
          country: editFormData.country,
        },
      };

      // Send PUT request to update the user
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (response.ok) {
        // Refresh the users list to show updated data
        fetchUsers(page, searchQuery);
        handleCloseDialog();
      } else {
        console.error("Failed to update user");
        // Could add error notification here in production
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // Could add error notification here in production
    }
  };

  // ========== DataGrid Column Configuration ==========

  /**
   * Column definitions for the MUI DataGrid
   * Each column specifies how to display and interact with user data
   */
  const columns: GridColDef[] = [
    /**
     * Avatar Column
     * Displays user profile picture or initials
     * Not sortable as it's purely visual
     */
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as User;
        // Create initials from first and last name (e.g., "JD" for John Doe)
        const initials = `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();

        return (
          <Avatar
            src={user.picture?.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 32, height: 32 }}
          >
            {initials}
          </Avatar>
        );
      },
    },

    /**
     * Name Column
     * Combines title, first name, and last name
     * Uses valueGetter to format the display value
     */
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row: User) =>
        `${row.name.title} ${row.name.first} ${row.name.last}`,
    },

    /**
     * Email Column
     * Displays user's email address
     * Wider than other columns to accommodate long emails
     */
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },

    /**
     * Phone Column
     * Displays user's phone number
     */
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
    },

    /**
     * Location Column
     * Combines city and country for compact display
     * Format: "City, Country"
     */
    {
      field: "location",
      headerName: "Location",
      flex: 1.2,
      minWidth: 180,
      valueGetter: (value, row: User) =>
        `${row.location.city}, ${row.location.country}`,
    },

    /**
     * Age Column
     * Displays calculated age from date of birth
     * Fixed width as age is typically 2-3 digits
     */
    {
      field: "age",
      headerName: "Age",
      width: 80,
      valueGetter: (value, row: User) => row.dob.age,
    },

    /**
     * Gender Column
     * Displays gender as a colored chip for visual distinction
     * Male = Primary color (blue), Female = Secondary color (pink)
     */
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const gender = params.value as string;
        return (
          <Chip
            label={gender.charAt(0).toUpperCase() + gender.slice(1)}
            size="small"
            color={gender === "male" ? "primary" : "secondary"}
            variant="outlined"
          />
        );
      },
    },

    /**
     * Actions Column
     * Contains edit button for each row
     * Not sortable as it contains interactive elements
     */
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as User;
        return (
          <IconButton
            size="small"
            onClick={() => handleEditClick(user)}
            color="primary"
            aria-label="edit user"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  /**
   * Transform users array into DataGrid rows format
   * DataGrid requires each row to have an 'id' field
   * We use the user's UUID as the unique identifier
   */
  const rows = users.map((user) => ({
    id: user.login.uuid,
    ...user,
  }));

  // ========== Render ==========

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Header */}
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3, color: "text.secondary" }}>
        Manage your customer data and user accounts.
      </Typography>

      {/* Search Bar Section */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name, email, or city..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </Stack>

      {/* DataGrid Table */}
      <Box sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20]}
          paginationMode="server" // Server-side pagination for better performance
          rowCount={totalUsers} // Total rows for pagination calculation
          paginationModel={{ page: page - 1, pageSize: 20 }} // Convert to 0-based for DataGrid
          onPaginationModelChange={(model) => setPage(model.page + 1)} // Convert back to 1-based
          disableColumnResize
          density="comfortable"
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            // Styling for alternating row colors
            "& .even": {
              bgcolor: "action.hover",
            },
          }}
        />
      </Box>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {/* Edit Form Fields */}
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              fullWidth
              value={editFormData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
            />
            <TextField
              label="Last Name"
              fullWidth
              value={editFormData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editFormData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
            />
            <TextField
              label="Phone"
              fullWidth
              value={editFormData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
            />
            <TextField
              label="City"
              fullWidth
              value={editFormData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
            />
            <TextField
              label="Country"
              fullWidth
              value={editFormData.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
            />
          </Stack>
        </DialogContent>

        {/* Dialog Action Buttons */}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
