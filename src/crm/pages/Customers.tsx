import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { usersApi, UsersApiError } from "../../services/usersApi";
import { User } from "../../types/user";
import EditUserModal from "../components/EditUserModal";

interface CustomersState {
  users: User[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  searchValue: string;
}

export default function Customers() {
  // Main component state containing all user data, pagination, search, and UI states
  // This centralizes all the state management for the customer management page
  const [state, setState] = React.useState<CustomersState>({
    users: [], // Array of user objects fetched from the API
    loading: false, // Loading state for API operations
    error: null, // Error message to display to user if API calls fail
    total: 0, // Total number of users available (for pagination)
    page: 0, // Current page index (0-based for DataGrid)
    pageSize: 25, // Number of users to display per page
    search: "", // Applied search query (what's actually being searched)
    searchValue: "", // Current search input value (for debouncing)
  });

  // State for controlling the edit user modal dialog
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // Currently selected user for editing - null when no user is selected
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Snackbar state for showing success/error messages to the user
  // Provides feedback for operations like save, delete, etc.
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Reference to debounce timer for search functionality
  // Prevents excessive API calls while user is typing in search field
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  /**
   * Helper function to display snackbar notifications to the user
   * Used for showing success messages after operations or error alerts
   * @param message - The message to display in the snackbar
   * @param severity - Type of message (success or error) which affects styling
   */
  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  /**
   * Main function to load users from the API with pagination and search support
   * Uses React.useCallback to prevent unnecessary re-renders and optimize performance
   * Handles loading states, error states, and updates the component state with results
   */
  const loadUsers = React.useCallback(
    async (params?: { page?: number; pageSize?: number; search?: string }) => {
      // Set loading state and clear any previous errors before making API call
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Call the Users API with pagination and search parameters
        // Note: API uses 1-based pagination while DataGrid uses 0-based, so we add 1
        const response = await usersApi.getUsers({
          page: (params?.page ?? state.page) + 1, // API is 1-indexed
          perPage: params?.pageSize ?? state.pageSize,
          search: params?.search ?? state.search,
          sortBy: "name.first",
        });

        setState((prev) => ({
          ...prev,
          users: response.data,
          total: response.total,
          loading: false,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof UsersApiError
            ? error.message
            : "Failed to load users";

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    },
    [state.page, state.pageSize, state.search],
  );

  // Initial load
  React.useEffect(() => {
    loadUsers();
  }, []);

  // Handle search with debounce
  React.useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (state.searchValue !== state.search) {
        setState((prev) => ({ ...prev, search: state.searchValue, page: 0 }));
        loadUsers({ search: state.searchValue, page: 0 });
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [state.searchValue, state.search, loadUsers]);

  const handlePaginationChange = (model: GridPaginationModel) => {
    setState((prev) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
    loadUsers({ page: model.page, pageSize: model.pageSize });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, searchValue: event.target.value }));
  };

  const handleRefresh = () => {
    loadUsers();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (id: string, userData: any) => {
    try {
      await usersApi.updateUser(id, userData);
      showSnackbar("User updated successfully");
      loadUsers(); // Refresh the data
    } catch (error) {
      const errorMessage =
        error instanceof UsersApiError
          ? error.message
          : "Failed to update user";
      throw new Error(errorMessage);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.name.first} ${user.name.last}?`,
      )
    ) {
      return;
    }

    try {
      await usersApi.deleteUser(user.login.uuid);
      showSnackbar("User deleted successfully");
      loadUsers(); // Refresh the data
    } catch (error) {
      const errorMessage =
        error instanceof UsersApiError
          ? error.message
          : "Failed to delete user";
      showSnackbar(errorMessage, "error");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Avatar
            src={user.picture?.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 32, height: 32, fontSize: "0.75rem" }}
          >
            {!user.picture?.thumbnail &&
              getInitials(user.name.first, user.name.last)}
          </Avatar>
        );
      },
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {user.name.title} {user.name.first} {user.name.last}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.login.username}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const location = params.value;
        return (
          <Box>
            <Typography variant="body2">
              {location.city}, {location.state}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {location.country}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Box>
            <Typography variant="body2">{user.phone}</Typography>
            {user.cell && (
              <Typography variant="caption" color="text.secondary">
                Cell: {user.cell}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const user = params.row as User;
        return (
          <Chip
            label={user.dob.age}
            size="small"
            variant="outlined"
            color="primary"
          />
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit User">
              <EditRoundedIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEditUser(params.row as User)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete User">
              <DeleteRoundedIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteUser(params.row as User)}
          color="error"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <PersonRoundedIcon color="primary" />
          <Typography variant="h4" component="h1">
            Customer Management
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Manage your customer database with search, edit, and delete
          capabilities.
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              size="small"
              placeholder="Search customers by name, email, or city..."
              value={state.searchValue}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleRefresh}
              disabled={state.loading}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {state.error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setState((prev) => ({ ...prev, error: null }))}
        >
          {state.error}
        </Alert>
      )}

      {/* Data Grid */}
      <Card variant="outlined">
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={state.users}
            columns={columns}
            loading={state.loading}
            paginationMode="server"
            rowCount={state.total}
            paginationModel={{ page: state.page, pageSize: state.pageSize }}
            onPaginationModelChange={handlePaginationChange}
            pageSizeOptions={[10, 25, 50, 100]}
            getRowId={(row) => row.login.uuid}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
            }}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            sx={{
              "& .even": {
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
              "& .odd": {
                backgroundColor: "transparent",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          />
        </Box>
      </Card>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
