import * as React from "react";
import {
  DataGridPro,
  GridColDef,
  GridPaginationModel,
  GridToolbar,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid-pro";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { fetchUsers, deleteUser, User } from "../services/usersApi";
import { alpha } from "@mui/material/styles";

interface CrmCustomerDashboardProps {
  onEditUser: (user: User) => void;
}

/**
 * Transform raw User API data into a flattened structure optimized for DataGrid display
 * This function performs several important operations:
 * 1. Flattens nested object properties for easier column access
 * 2. Creates computed fields like fullName and formatted street address
 * 3. Preserves the original user object for edit operations
 * 4. Ensures each row has a unique 'id' field required by DataGrid
 */
const transformUserData = (users: User[]) => {
  return users.map((user) => ({
    // DataGrid requires a unique 'id' field - using UUID from login
    id: user.login.uuid,

    // Preserve UUID and username for API operations
    uuid: user.login.uuid,
    username: user.login.username,

    // Flatten name object and create computed full name for display
    firstName: user.name.first,
    lastName: user.name.last,
    fullName: `${user.name.first} ${user.name.last}`,
    title: user.name.title,

    // Direct mapping of contact information
    email: user.email,
    gender: user.gender,

    // Extract age and date from date of birth object
    age: user.dob.age,
    dateOfBirth: user.dob.date,

    // Contact phone numbers
    phone: user.phone,
    cell: user.cell,

    // Flatten location object for easier column access
    city: user.location.city,
    state: user.location.state,
    country: user.location.country,
    postcode: user.location.postcode,

    // Create formatted street address from nested street object
    street: `${user.location.street.number} ${user.location.street.name}`,

    // Registration information
    registrationDate: user.registered.date,

    // Profile picture URL for avatar display
    profilePicture: user.picture.thumbnail,

    // Nationality code
    nationality: user.nat,

    // Keep reference to original user object for edit modal
    originalUser: user,
  }));
};

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function CrmCustomerDashboard({ onEditUser }: CrmCustomerDashboardProps) {
  // State to store the transformed user data that will be displayed in the DataGrid
  // Using any[] type as the transformed data has a different shape than the original User type
  const [users, setUsers] = React.useState<any[]>([]);

  // Loading state to show spinner while fetching data from the Users API
  const [loading, setLoading] = React.useState(true);

  // Immediate search query state that updates as user types in the search field
  const [searchQuery, setSearchQuery] = React.useState("");

  // Pagination model for DataGrid Pro - tracks current page and page size
  // Note: DataGrid uses 0-based page indexing while our API uses 1-based
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });

  // Total number of users from API response - used for server-side pagination
  const [totalUsers, setTotalUsers] = React.useState(0);

  // Debounced search query to prevent excessive API calls while user is typing
  // This creates a delay before actually triggering the search API call
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // Effect to implement search debouncing - waits 500ms after user stops typing
  // before updating the debounced query which triggers the API call
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    // Cleanup function to clear timeout if searchQuery changes before 500ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Main effect to fetch users data whenever pagination settings or search query changes
  // This ensures the grid stays synchronized with user interactions
  React.useEffect(() => {
    const loadUsers = async () => {
      // Set loading state to show spinner in DataGrid
      setLoading(true);
      try {
        // Call Users API with current pagination and search parameters
        const response = await fetchUsers(
          paginationModel.page + 1, // Convert 0-based DataGrid page to 1-based API page
          paginationModel.pageSize,
          debouncedSearchQuery || undefined, // Only pass search if it exists
          "name.first" // Default sort by first name
        );

        // Transform raw API user data into format expected by DataGrid
        // This flattens nested properties and adds computed fields
        const transformedData = transformUserData(response.data);
        setUsers(transformedData);

        // Update total count for pagination calculations
        setTotalUsers(response.total);
      } catch (error) {
        // Log error for debugging and reset data on failure
        console.error("Failed to fetch users:", error);
        setUsers([]);
        setTotalUsers(0);
      } finally {
        // Always clear loading state regardless of success or failure
        setLoading(false);
      }
    };

    // Execute the async function
    loadUsers();
  }, [paginationModel, debouncedSearchQuery]); // Re-run when pagination or search changes

  // Handler for deleting a user with confirmation dialog and optimistic UI updates
  const handleDeleteUser = async (userId: string) => {
    // Show native browser confirmation dialog for user safety
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Call API to delete the user by UUID
        await deleteUser(userId);

        // Refresh the current page data after successful deletion
        // This ensures the UI stays consistent and handles edge cases like
        // deleting the last item on a page
        const response = await fetchUsers(
          paginationModel.page + 1,
          paginationModel.pageSize,
          debouncedSearchQuery || undefined,
          "name.first"
        );

        // Transform and update the UI with fresh data
        const transformedData = transformUserData(response.data);
        setUsers(transformedData);
        setTotalUsers(response.total);
      } catch (error) {
        // Log error for debugging and show user-friendly error message
        console.error("Failed to delete user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // DataGrid column definitions with custom renderers for rich data display
  // Each column is configured with specific width, sorting, and rendering behavior
  const columns: GridColDef[] = [
    {
      field: "profilePicture",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.value}
          alt={params.row.fullName}
          sx={{ width: 32, height: 32 }}
        >
          {params.row.firstName?.[0]?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "fullName",
      headerName: "Full Name",
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      type: "number",
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "city",
      headerName: "City",
      width: 120,
    },
    {
      field: "country",
      headerName: "Country",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({params.row.nationality})
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "registrationDate",
      headerName: "Registered",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditUser(params.row.originalUser)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteUser(params.row.uuid)}
          color="error"
        />,
      ],
    },
  ];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Customer Management Dashboard
          </Typography>
          <TextField
            placeholder="Search customers by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.primary.main, 0.02)
                    : alpha(theme.palette.primary.main, 0.1),
              },
            }}
          />
        </Stack>
      </CardContent>
      <Box sx={{ flexGrow: 1, p: 2, pt: 1 }}>
        <DataGridPro
          rows={users}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationMode="server"
          rowCount={totalUsers}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.primary.main, 0.08),
            },
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Box>
    </Card>
  );
}
