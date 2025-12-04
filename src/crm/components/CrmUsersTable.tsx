import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import CloseIcon from "@mui/icons-material/Close";

/**
 * User interface representing the complete user data structure from the Users API.
 * This matches the API response schema from https://user-api.builder-io.workers.dev/api
 * 
 * The interface includes:
 * - login: Authentication and identification details (UUID, username, password)
 * - name: User's title, first name, and last name
 * - gender: User's gender (optional)
 * - location: Complete address information including street, city, state, country, and postcode
 * - email: User's email address (required field)
 * - dob: Date of birth information including the date string and calculated age
 * - phone: Primary phone number
 * - cell: Mobile/cell phone number
 * - picture: URLs for user's profile pictures in different sizes (large, medium, thumbnail)
 */
interface User {
  login: {
    uuid: string;
    username: string;
    password?: string;
  };
  name: {
    title?: string;
    first: string;
    last: string;
  };
  gender?: string;
  location?: {
    street?: {
      number?: number;
      name?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  email: string;
  dob?: {
    date?: string;
    age?: number;
  };
  phone?: string;
  cell?: string;
  picture?: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
}

/**
 * UsersResponse interface representing the paginated API response structure.
 * 
 * The API returns:
 * - page: Current page number (1-indexed in API, 0-indexed in component state)
 * - perPage: Number of users returned per page
 * - total: Total count of users matching the search criteria
 * - data: Array of User objects for the current page
 */
interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

/**
 * Base URL for the Users API.
 * All API endpoints are prefixed with this URL.
 */
const API_BASE = "https://user-api.builder-io.workers.dev/api";

/**
 * CrmUsersTable Component
 * 
 * A comprehensive users management table with the following features:
 * 1. Paginated display of users from the Users API
 * 2. Real-time search functionality with debouncing (500ms delay)
 * 3. Inline editing via a modal dialog
 * 4. Loading states and error handling
 * 5. Responsive design with Material-UI components
 * 
 * The component fetches users from the API, displays them in a table format,
 * and allows editing of user information through a modal form.
 */
export default function CrmUsersTable() {
  /**
   * State Management
   * 
   * users: Current page of users fetched from the API
   * loading: Loading state for API requests (initial load and page changes)
   * error: Error message if API request fails
   * page: Current page number (0-indexed for MUI TablePagination)
   * rowsPerPage: Number of rows to display per page
   * totalUsers: Total count of all users (used for pagination)
   * search: Raw search input value (updates on every keystroke)
   * debouncedSearch: Debounced search value (updates 500ms after user stops typing)
   * editModalOpen: Controls visibility of the edit user modal
   * selectedUser: User currently being edited in the modal
   * saving: Loading state for save operation in the edit modal
   * saveError: Error message if save operation fails
   */
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  /**
   * Search Debouncing Effect
   * 
   * This effect implements a debouncing mechanism for the search input.
   * It waits 500ms after the user stops typing before triggering a new search.
   * This prevents excessive API calls while the user is actively typing.
   * 
   * When the debounced search value updates, it also resets the page to 0
   * to show results from the beginning of the new search results.
   */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Data Fetching Effect
   * 
   * This effect fetches users from the API whenever pagination or search changes.
   * Dependencies:
   * - page: Fetch new page when user navigates
   * - rowsPerPage: Fetch new data when user changes items per page
   * - debouncedSearch: Fetch filtered results when search term changes
   */
  React.useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, debouncedSearch]);

  /**
   * Fetches users from the Users API with pagination and search parameters.
   * 
   * Query Parameters:
   * - page: Current page number (converted to 1-indexed for API)
   * - perPage: Number of results per page
   * - search: Optional search term for filtering users
   * 
   * The API searches across user's first name, last name, email, and city.
   * 
   * Updates state with:
   * - users: Array of user objects for current page
   * - totalUsers: Total count for pagination
   * - loading: Loading indicator
   * - error: Any error messages from failed requests
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1), // API uses 1-indexed pages, MUI uses 0-indexed
        perPage: String(rowsPerPage),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`${API_BASE}/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles pagination page change events.
   * 
   * @param _event - The event object (unused)
   * @param newPage - The new page number (0-indexed)
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handles changes to the number of rows per page.
   * Resets to the first page when rows per page changes.
   * 
   * @param event - The change event containing the new value
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Opens the edit modal for a specific user.
   * Creates a copy of the user object to allow for cancellation without affecting the table.
   * Clears any previous save errors when opening the modal.
   * 
   * @param user - The user object to edit
   */
  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setEditModalOpen(true);
    setSaveError(null);
  };

  /**
   * Closes the edit modal and resets related state.
   * Clears the selected user and any save errors.
   */
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setSaveError(null);
  };

  /**
   * Saves the edited user data to the API via PUT request.
   * 
   * Process:
   * 1. Validates that a user is selected
   * 2. Sends PUT request with updated user data
   * 3. On success: refreshes the users list and closes the modal
   * 4. On error: displays error message in the modal
   * 
   * The API endpoint used is: PUT /users/:uuid
   * Only sends editable fields (name, email, gender, location, phone, cell)
   */
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(
        `${API_BASE}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedUser.name,
            email: selectedUser.email,
            gender: selectedUser.gender,
            location: selectedUser.location,
            phone: selectedUser.phone,
            cell: selectedUser.cell,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      // Refresh the users list to show updated data
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles input changes in the edit modal form.
   * Supports nested field updates using dot notation (e.g., "name.first", "location.city").
   * 
   * This function:
   * 1. Splits the field path by dots to handle nested objects
   * 2. Traverses the user object to find the correct nested property
   * 3. Creates missing intermediate objects if they don't exist
   * 4. Updates the final property with the new value
   * 
   * @param field - Dot-notation path to the field (e.g., "name.first", "location.city")
   * @param value - The new value for the field
   * 
   * Example: handleInputChange("location.city", "New York") updates user.location.city
   */
  const handleInputChange = (field: string, value: any) => {
    if (!selectedUser) return;

    const keys = field.split(".");
    const updatedUser = { ...selectedUser };
    let current: any = updatedUser;

    // Navigate to the nested property
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Update the final property
    current[keys[keys.length - 1]] = value;
    setSelectedUser(updatedUser);
  };

  /**
   * Generates user initials from first and last name for avatar fallback.
   * Used when no profile picture is available.
   * 
   * @param user - The user object
   * @returns Two-letter uppercase initials (e.g., "JD" for John Doe)
   */
  const getInitials = (user: User) => {
    return `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();
  };

  return (
    <>
      {/* Main Users Table Card */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {/* Header with Title and Search */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" component="h2">
                Users
              </Typography>
              {/* Search input with debouncing */}
              <TextField
                placeholder="Search users..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 250 }}
              />
            </Stack>

            {/* Error Alert */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Loading State or Table Content */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Users Table */}
                <TableContainer>
                  <Table size="small" aria-label="users table">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Empty State */}
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No users found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        /* User Rows */
                        users.map((user) => (
                          <TableRow key={user.login.uuid} hover>
                            {/* User Column with Avatar and Name */}
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                              >
                                <Avatar
                                  src={user.picture?.thumbnail}
                                  sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                                >
                                  {getInitials(user)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {user.name.title} {user.name.first}{" "}
                                    {user.name.last}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    @{user.login.username}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            {/* Email Column */}
                            <TableCell>{user.email}</TableCell>
                            {/* Location Column - Shows City, Country or N/A */}
                            <TableCell>
                              {user.location?.city && user.location?.country
                                ? `${user.location.city}, ${user.location.country}`
                                : "N/A"}
                            </TableCell>
                            {/* Phone Column */}
                            <TableCell>{user.phone || "N/A"}</TableCell>
                            {/* Age Column */}
                            <TableCell>{user.dob?.age || "N/A"}</TableCell>
                            {/* Actions Column with Edit Button */}
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(user)}
                                aria-label="edit user"
                              >
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination Controls */}
                <TablePagination
                  component="div"
                  count={totalUsers}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="edit-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600 },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Stack spacing={3}>
            {/* Modal Header */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" component="h2" id="edit-user-modal">
                Edit User
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Save Error Alert */}
            {saveError && <Alert severity="error">{saveError}</Alert>}

            {/* Edit Form */}
            {selectedUser && (
              <Grid container spacing={2}>
                {/* Name Fields */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Title"
                    select
                    value={selectedUser.name.title || ""}
                    onChange={(e) =>
                      handleInputChange("name.title", e.target.value)
                    }
                  >
                    <MenuItem value="Mr">Mr</MenuItem>
                    <MenuItem value="Mrs">Mrs</MenuItem>
                    <MenuItem value="Ms">Ms</MenuItem>
                    <MenuItem value="Miss">Miss</MenuItem>
                    <MenuItem value="Dr">Dr</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={selectedUser.name.first}
                    onChange={(e) =>
                      handleInputChange("name.first", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    value={selectedUser.name.last}
                    onChange={(e) =>
                      handleInputChange("name.last", e.target.value)
                    }
                  />
                </Grid>

                {/* Contact Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    select
                    value={selectedUser.gender || ""}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </TextField>
                </Grid>

                {/* Phone Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={selectedUser.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cell"
                    value={selectedUser.cell || ""}
                    onChange={(e) => handleInputChange("cell", e.target.value)}
                  />
                </Grid>

                {/* Location Section Header */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                </Grid>

                {/* Street Address Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street Number"
                    type="number"
                    value={selectedUser.location?.street?.number || ""}
                    onChange={(e) =>
                      handleInputChange("location.street.number", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street Name"
                    value={selectedUser.location?.street?.name || ""}
                    onChange={(e) =>
                      handleInputChange("location.street.name", e.target.value)
                    }
                  />
                </Grid>

                {/* City and State Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={selectedUser.location?.city || ""}
                    onChange={(e) =>
                      handleInputChange("location.city", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State"
                    value={selectedUser.location?.state || ""}
                    onChange={(e) =>
                      handleInputChange("location.state", e.target.value)
                    }
                  />
                </Grid>

                {/* Country and Postcode Fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={selectedUser.location?.country || ""}
                    onChange={(e) =>
                      handleInputChange("location.country", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postcode"
                    value={selectedUser.location?.postcode || ""}
                    onChange={(e) =>
                      handleInputChange("location.postcode", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            )}

            {/* Modal Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={handleCloseModal} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveUser}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </>
  );
}
