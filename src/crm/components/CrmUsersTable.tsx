/**
 * CRM Users Table Component
 *
 * A comprehensive data table for displaying and managing users in the CRM system.
 * This component integrates with the Users API and provides full CRUD functionality.
 *
 * Features:
 * - Server-side pagination for efficient data handling
 * - Real-time search across multiple fields (name, email, city)
 * - Inline edit functionality via modal dialog
 * - Responsive DataGrid with sortable columns
 * - Loading and error states
 * - User avatars and formatted data display
 *
 * API Integration:
 * - Fetches data from https://user-api.builder-io.workers.dev/api/users
 * - Supports query parameters: page, perPage, search
 * - Updates user data via PUT requests
 */

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CrmEditUserModal from "./CrmEditUserModal";

/**
 * User interface matching the structure from the Users API
 * Represents a complete user record with all associated data
 */
interface User {
  login: {
    uuid: string; // Unique identifier
    username: string; // Login username
    password: string; // User password
  };
  name: {
    title: string; // Honorific (Mr, Mrs, Ms, etc.)
    first: string; // First name
    last: string; // Last name
  };
  gender: string; // Gender (male/female)
  location: {
    street: {
      number: number; // Street number
      name: string; // Street name
    };
    city: string; // City
    state: string; // State/province
    country: string; // Country
    postcode: string; // Postal code
    coordinates?: {
      latitude: number; // GPS latitude
      longitude: number; // GPS longitude
    };
    timezone?: {
      offset: string; // UTC offset
      description: string; // Timezone name
    };
  };
  email: string; // Email address
  dob?: {
    date: string; // Date of birth
    age: number; // Calculated age
  };
  registered?: {
    date: string; // Registration date
    age: number; // Years since registration
  };
  phone: string; // Primary phone
  cell?: string; // Cell/mobile phone
  picture?: {
    large: string; // Large profile picture URL
    medium: string; // Medium profile picture URL
    thumbnail: string; // Thumbnail profile picture URL
  };
  nat?: string; // Nationality code
}

/**
 * API Response interface for the Users API
 * Contains pagination metadata and user data array
 */
interface ApiResponse {
  page: number; // Current page number
  perPage: number; // Items per page
  total: number; // Total number of users
  data: User[]; // Array of user objects
}

/**
 * Main users table component
 */
export default function CrmUsersTable() {
  // STATE MANAGEMENT
  // ----------------

  /**
   * Users array - holds the current page of user data from the API
   */
  const [users, setUsers] = React.useState<User[]>([]);

  /**
   * Loading state - indicates when data is being fetched from the API
   * Used to show loading indicators and disable interactions
   */
  const [loading, setLoading] = React.useState(true);

  /**
   * Error state - holds any error messages from API calls
   * Displayed as an alert banner when present
   */
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Search query state - holds the current search filter text
   * Filters users by name, email, or city
   */
  const [searchQuery, setSearchQuery] = React.useState("");

  /**
   * Pagination model - controls current page and items per page
   * Note: API uses 1-based page numbers, but DataGrid uses 0-based
   */
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // Current page (0-indexed for DataGrid)
    pageSize: 10, // Number of items per page
  });

  /**
   * Total row count - total number of users in the database
   * Used for pagination to show correct number of pages
   */
  const [totalRows, setTotalRows] = React.useState(0);

  /**
   * Edit modal visibility state
   */
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  /**
   * Selected user for editing
   * Null when no user is selected
   */
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // API FUNCTIONS
  // -------------

  /**
   * Fetches users from the API with current pagination and search parameters
   * Uses useCallback to memoize the function and prevent unnecessary re-renders
   * Dependencies: page, pageSize, searchQuery
   */
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters for the API request
      // Note: API uses 1-based page numbers, so we add 1 to the page
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1), // Convert to 1-based
        perPage: String(paginationModel.pageSize),
        ...(searchQuery && { search: searchQuery }), // Only include search if not empty
      });

      // Fetch users from the API
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`,
      );

      // Handle API errors
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      // Parse and store the response data
      const data: ApiResponse = await response.json();
      setUsers(data.data); // Update users array
      setTotalRows(data.total); // Update total count for pagination
    } catch (err) {
      // Handle and display errors
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      // Always clear loading state, even if there was an error
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  /**
   * Effect to fetch users whenever pagination or search changes
   * Runs on component mount and when fetchUsers dependencies change
   */
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // EVENT HANDLERS
  // --------------

  /**
   * Handles search input changes
   * Resets to page 0 when search query changes to show results from the beginning
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page
  };

  /**
   * Opens the edit modal for a specific user
   * @param user - The user to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  /**
   * Closes the edit modal and clears the selected user
   */
  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Handles successful user update from the modal
   * Refreshes the user list and closes the modal
   * @param updatedUser - The updated user data (not currently used but available)
   */
  const handleUserUpdate = async (updatedUser: User) => {
    await fetchUsers(); // Refresh the table data
    handleModalClose(); // Close the modal
  };

  // COLUMN DEFINITIONS
  // ------------------
  /**
   * DataGrid column configuration
   * Defines how each column is displayed, sorted, and filtered
   */
  const columns: GridColDef[] = [
    /**
     * Avatar column - displays user profile picture or initials
     * Not sortable or filterable since it's just visual
     */
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Avatar
          src={params.row.picture?.thumbnail}
          alt={`${params.row.name.first} ${params.row.name.last}`}
          sx={{ width: 36, height: 36 }}
        >
          {/* Fallback to initials if no picture */}
          {params.row.name.first[0]}
          {params.row.name.last[0]}
        </Avatar>
      ),
    },
    /**
     * Name column - displays full name with username
     * Shows name in bold and username as secondary text
     * valueGetter is used for sorting/filtering the combined name
     */
    {
      field: "name",
      headerName: "Name",
      flex: 1, // Flexible width
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.name.title} ${row.name.first} ${row.name.last}`,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.name.first} {params.row.name.last}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.login.username}
          </Typography>
        </Box>
      ),
    },
    /**
     * Email column - displays user's email address
     * Simple text display with default sorting
     */
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
    },
    /**
     * Location column - displays city, state, and country
     * Shows city/state in primary text and country in secondary
     * valueGetter combines city and country for sorting/filtering
     */
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.country}`,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box>
          <Typography variant="body2">
            {params.row.location.city}, {params.row.location.state}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.location.country}
          </Typography>
        </Box>
      ),
    },
    /**
     * Phone column - displays primary phone number
     * Simple text display
     */
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
    },
    /**
     * Gender column - displays gender with color-coded chip
     * Male = primary (blue), Female = secondary (purple/pink)
     */
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Chip
          label={params.row.gender}
          size="small"
          color={params.row.gender === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    /**
     * Age column - displays user's age from date of birth
     * Center-aligned, shows "N/A" if age data is not available
     */
    {
      field: "age",
      headerName: "Age",
      width: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.dob?.age || "N/A",
    },
    /**
     * Actions column - displays edit button for each user
     * Not sortable or filterable
     * Triggers the edit modal when clicked
     */
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <IconButton
          size="small"
          color="primary"
          onClick={() => handleEditClick(params.row)}
          aria-label={`Edit ${params.row.name.first} ${params.row.name.last}`}
        >
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h6" component="h3">
                Users
              </Typography>
            </Stack>

            <TextField
              placeholder="Search users by name, email, or city..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={users}
                columns={columns}
                getRowId={(row) => row.login.uuid}
                loading={loading}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25, 50]}
                rowCount={totalRows}
                disableRowSelectionOnClick
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                }}
                slots={{
                  loadingOverlay: () => (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ),
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {selectedUser && (
        <CrmEditUserModal
          open={editModalOpen}
          user={selectedUser}
          onClose={handleModalClose}
          onUpdate={handleUserUpdate}
        />
      )}
    </>
  );
}
