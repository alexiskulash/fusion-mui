import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditUserModal from "./EditUserModal";

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
 * Interface representing the API response structure
 * Contains paginated user data along with metadata
 */
interface ApiResponse {
  data: User[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * CustomersUsersTable Component
 * 
 * A comprehensive table component for displaying and managing user data.
 * Features include:
 * - Server-side pagination for efficient data loading
 * - Real-time search functionality (searches name, email, city)
 * - Inline edit capability via modal dialog
 * - Responsive data grid with customizable columns
 * 
 * @returns A Material-UI Card containing a searchable, paginated user table
 */
export default function CustomersUsersTable() {
  // State management for users data fetched from API
  const [users, setUsers] = React.useState<User[]>([]);
  
  // Loading state to show spinner while fetching data
  const [loading, setLoading] = React.useState(true);
  
  // Search query state - triggers debounced API call when changed
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Total number of users in database (for pagination)
  const [totalRows, setTotalRows] = React.useState(0);
  
  // Pagination state - tracks current page and items per page
  // Note: DataGrid uses 0-based page index, but API uses 1-based
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  
  // State for managing the edit modal
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  /**
   * Fetches users from the API with current pagination and search parameters
   * 
   * This function:
   * 1. Constructs query parameters from current state
   * 2. Makes GET request to users API
   * 3. Updates users and total count in state
   * 4. Handles errors gracefully by resetting to empty state
   * 
   * Dependencies: paginationModel.page, paginationModel.pageSize, searchQuery
   */
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters for API request
      // Convert 0-based page to 1-based for API
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        perPage: String(paginationModel.pageSize),
        // Only include search parameter if query is not empty
        ...(searchQuery && { search: searchQuery }),
      });

      // Fetch users from API
      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      const data: ApiResponse = await response.json();
      
      // Update state with fetched data
      setUsers(data.data || []);
      setTotalRows(data.total || 0);
    } catch (error) {
      // Log error and reset to empty state on failure
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalRows(0);
    } finally {
      // Always stop loading spinner, regardless of success/failure
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  /**
   * Effect hook to trigger user fetching with debouncing
   * 
   * Implements a 300ms debounce to prevent excessive API calls
   * when user types in search field. This improves performance
   * and reduces server load.
   * 
   * The cleanup function cancels pending API calls if dependencies
   * change before the timeout completes.
   */
  React.useEffect(() => {
    // Debounce API calls by 300ms
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    // Cleanup: cancel pending API call if dependencies change
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  /**
   * Opens the edit modal with the selected user's data
   * 
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  /**
   * Closes the edit modal and clears selected user
   */
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Handles successful user update from the modal
   * Refreshes the table data and closes the modal
   * 
   * @param updatedUser - The updated user object (currently unused but available for optimistic updates)
   */
  const handleSaveUser = async (updatedUser: User) => {
    // Refresh the table to show updated data from server
    await fetchUsers();
    handleCloseModal();
  };

  /**
   * Column definitions for the DataGrid
   * Each column specifies how to display and format user data
   */
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      // Custom render: Display user's profile picture or initials
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          src={params.row.picture?.thumbnail}
          alt={`${params.row.name?.first} ${params.row.name?.last}`}
          sx={{ width: 36, height: 36 }}
        >
          {params.row.name?.first?.[0]}
          {params.row.name?.last?.[0]}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      // Combine title, first, and last name into single display value
      valueGetter: (value, row) =>
        `${row.name?.title || ""} ${row.name?.first || ""} ${row.name?.last || ""}`.trim(),
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
      minWidth: 180,
      // Display city and country as "City, Country"
      valueGetter: (value, row) =>
        `${row.location?.city || ""}, ${row.location?.country || ""}`,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      // Custom render: Display gender as a colored chip badge
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      // Extract age from date of birth object
      valueGetter: (value, row) => row.dob?.age || "-",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      // Custom render: Display edit button for each row
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => handleEditClick(params.row)}
          aria-label="edit user"
        >
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      {/* Main card container for the users table */}
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Header section with title */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h6" component="h2">
                Users
              </Typography>
            </Stack>

            {/* Search input field with icon
                Triggers debounced API call when user types */}
            <TextField
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* DataGrid container with fixed height for scrolling */}
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={users}
                columns={columns}
                loading={loading}
                pagination
                paginationMode="server" // Server-side pagination for better performance
                rowCount={totalRows}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                getRowId={(row) => row.login?.uuid || row.email} // Use UUID as unique row identifier
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  // Remove focus outline for cleaner UI
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Edit user modal dialog
          Opens when user clicks edit button on any row */}
      <EditUserModal
        open={isEditModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />
    </>
  );
}
