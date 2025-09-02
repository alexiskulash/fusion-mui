/**
 * User Management Interface for CRM Contacts
 *
 * This component provides a comprehensive user management interface that matches
 * the Figma design specifications. It includes:
 * - Real-time search functionality with debouncing
 * - Sortable user data with multiple attributes
 * - Row selection with bulk operations
 * - Pagination controls
 * - Responsive design for all screen sizes
 * - Integration with the Builder.io Users API
 */

import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";

/**
 * User data type definition based on the Builder.io Users API
 * This interface matches the exact structure returned by the API endpoint:
 * https://user-api.builder-io.workers.dev/api/users
 *
 * Each user contains comprehensive profile information including:
 * - Authentication credentials (login object)
 * - Personal information (name, gender, date of birth)
 * - Contact information (email, phone numbers)
 * - Location data with coordinates and timezone
 * - Profile pictures in multiple sizes
 * - Registration metadata
 */
interface User {
  /** Authentication and login credentials */
  login: {
    uuid: string;        // Unique identifier for the user
    username: string;    // Username for login purposes
    password: string;    // Encrypted password (not displayed in UI)
  };

  /** Full name information with title */
  name: {
    title: string;       // Mr, Ms, Dr, etc.
    first: string;       // Given name
    last: string;        // Family name
  };

  /** Gender information */
  gender: string;        // Male, Female, or other gender identities

  /** Complete location and address information */
  location: {
    street: {
      number: number;    // Street number
      name: string;      // Street name
    };
    city: string;        // City name (displayed in table)
    state: string;       // State or province
    country: string;     // Country name
    postcode: string;    // Postal/ZIP code
    coordinates: {
      latitude: number;  // GPS latitude for mapping
      longitude: number; // GPS longitude for mapping
    };
    timezone: {
      offset: string;    // UTC offset (e.g., "-05:00")
      description: string; // Human-readable timezone
    };
  };

  /** Primary email address for communication */
  email: string;

  /** Date of birth and calculated age */
  dob: {
    date: string;        // ISO date string
    age: number;         // Calculated age in years
  };

  /** Registration information and account age */
  registered: {
    date: string;        // ISO date when user registered
    age: number;         // Years since registration (used for status calculation)
  };

  /** Contact phone numbers */
  phone: string;         // Primary phone number
  cell: string;          // Mobile/cellular number

  /** Profile pictures in multiple resolutions */
  picture: {
    large: string;       // High-resolution profile picture
    medium: string;      // Medium-resolution for cards
    thumbnail: string;   // Small thumbnail for table rows
  };

  /** Nationality code */
  nat: string;           // Two-letter country code
}

/**
 * Account status enumeration
 * Determines the current state of a user's account for business logic:
 * - Active: Normal user with full access
 * - Suspended: Temporarily restricted user (shows warning chip)
 * - Inactive: New or dormant user (shows error chip)
 */
type AccountStatus = "Active" | "Suspended" | "Inactive";

/**
 * Main Contacts component that renders the user management interface
 *
 * This component handles all user interactions and API communications for
 * managing contacts/users in the CRM system. It provides a table-based
 * interface with search, filtering, sorting, and pagination capabilities.
 *
 * @returns JSX.Element The complete user management interface
 */
export default function Contacts() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Array of user objects fetched from the API */
  const [users, setUsers] = React.useState<User[]>([]);

  /** Loading state to show/hide loading indicators during API calls */
  const [loading, setLoading] = React.useState(true);

  /** Current page number for pagination (0-indexed) */
  const [page, setPage] = React.useState(0);

  /** Number of rows to display per page (10, 25, or 50) */
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  /** Total number of users available (for pagination calculations) */
  const [totalUsers, setTotalUsers] = React.useState(0);

  /** Current search query string for filtering users */
  const [search, setSearch] = React.useState("");

  /** Current sort field (name.first, location.city, etc.) */
  const [sortBy, setSortBy] = React.useState("name.first");

  /** Array of selected user UUIDs for bulk operations */
  const [selected, setSelected] = React.useState<string[]>([]);

  // ============================================================================
  // API INTEGRATION
  // ============================================================================

  /**
   * Fetches users from the Builder.io Users API with current filters and pagination
   *
   * This function constructs the API request with the following parameters:
   * - page: Current page number (converted from 0-indexed to 1-indexed)
   * - perPage: Number of results per page
   * - sortBy: Field to sort results by (supports nested properties)
   * - search: Optional search query for filtering results
   *
   * The API returns paginated results with total count for pagination controls.
   * Error handling ensures the UI remains functional even if the API fails.
   */
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters for the API request
      const queryParams = new URLSearchParams({
        page: String(page + 1),        // Convert to 1-indexed for API
        perPage: String(rowsPerPage),  // Number of results per page
        sortBy: sortBy,                // Sort field (supports dot notation)
        ...(search && { search }),     // Only include search if not empty
      });

      // Make the API request to fetch users
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${queryParams}`
      );
      const data = await response.json();

      // Update state with the fetched data
      setUsers(data.data || []);       // User array from API response
      setTotalUsers(data.total || 0);  // Total count for pagination
    } catch (error) {
      // Handle API errors gracefully
      console.error("Failed to fetch users:", error);
      setUsers([]);                    // Reset to empty array on error
    } finally {
      setLoading(false);               // Always clear loading state
    }
  }, [page, rowsPerPage, search, sortBy]);

  /**
   * Fetch users whenever dependencies change
   * This effect runs when page, rowsPerPage, search, or sortBy changes
   */
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ============================================================================
  // SEARCH DEBOUNCING
  // ============================================================================

  /**
   * Debounced search implementation to avoid excessive API calls
   *
   * This pattern prevents API requests on every keystroke by implementing
   * a 500ms delay. Only when the user stops typing for 500ms will the
   * actual search be performed.
   */
  const [searchDebounced, setSearchDebounced] = React.useState(search);

  /**
   * Debounce the search input with 500ms delay
   * This prevents API calls on every keystroke for better performance
   */
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);

    // Cleanup function to cancel the timer if search changes again
    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Trigger new API request when debounced search changes
   * Also resets pagination to first page when searching
   */
  React.useEffect(() => {
    if (searchDebounced !== search) {
      setPage(0);                      // Reset to first page for new search
      fetchUsers();                    // Fetch new results
    }
  }, [searchDebounced, search, fetchUsers]);

  // ============================================================================
  // EVENT HANDLERS - PAGINATION
  // ============================================================================

  /**
   * Handles page navigation in the pagination component
   *
   * @param event - The click event (unused but required by MUI)
   * @param newPage - The new page number (0-indexed)
   */
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handles changes to the number of rows displayed per page
   *
   * When the user changes the rows per page, we also reset to the first page
   * to avoid being on a page that doesn't exist with the new page size.
   *
   * @param event - The select change event containing the new value
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  // Reset to first page when changing page size
  };

  // Handle selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((user) => user.login.uuid);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, uuid: string) => {
    const selectedIndex = selected.indexOf(uuid);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, uuid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (uuid: string) => selected.indexOf(uuid) !== -1;

  // Get account status (simulated based on registration age)
  const getAccountStatus = (user: User): AccountStatus => {
    const registrationAge = user.registered.age;
    if (registrationAge < 1) return "Inactive";
    if (registrationAge > 5) return "Suspended";
    return "Active";
  };

  // Get status chip color
  const getStatusColor = (status: AccountStatus) => {
    switch (status) {
      case "Active":
        return "success";
      case "Suspended":
        return "warning";
      case "Inactive":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          User management
        </Typography>
      </Box>

      {/* Main Card */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* Search and Filter */}
            <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
              <TextField
                placeholder="Name, email, etc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="medium"
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="medium" sx={{ minWidth: 180 }}>
                <InputLabel>Attribute</InputLabel>
                <Select
                  value={sortBy}
                  label="Attribute"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name.first">First Name</MenuItem>
                  <MenuItem value="name.last">Last Name</MenuItem>
                  <MenuItem value="location.city">City</MenuItem>
                  <MenuItem value="location.country">Country</MenuItem>
                  <MenuItem value="dob.age">Age</MenuItem>
                  <MenuItem value="registered.date">Registration Date</MenuItem>
                </Select>
              </FormControl>
              <IconButton size="large">
                <FilterAltIcon />
              </IconButton>
            </Stack>

            {/* Actions */}
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" color="inherit">
                Action
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                color="primary"
              >
                New
              </Button>
              <IconButton size="large">
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < users.length
                    }
                    checked={users.length > 0 && selected.length === users.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const isItemSelected = isSelected(user.login.uuid);
                const status = getAccountStatus(user);

                return (
                  <TableRow
                    hover
                    key={user.login.uuid}
                    selected={isItemSelected}
                    onClick={(event) => handleClick(event, user.login.uuid)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onChange={(event) => {
                          event.stopPropagation();
                          handleClick(event, user.login.uuid);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.picture.thumbnail}
                          alt={`${user.name.first} ${user.name.last}`}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.name.first[0]}
                          {user.name.last[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {user.name.first} {user.name.last}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {user.location.city}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status}
                        size="small"
                        color={getStatusColor(status)}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.login.uuid.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
