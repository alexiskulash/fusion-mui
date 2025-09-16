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
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

/**
 * Interface defining the structure of a user object returned from the Users API
 * This matches the API specification from https://user-api.builder-io.workers.dev/api
 */
interface ApiUser {
  login: {
    uuid: string;         // Unique identifier for the user
    username: string;     // User's login username
    password?: string;    // Optional password field (usually not returned for security)
  };
  name: {
    title?: string;       // Optional title (Mr, Ms, Dr, etc.)
    first: string;        // User's first name
    last: string;         // User's last name
  };
  gender?: string;        // User's gender (male, female, etc.)
  location?: {
    street?: { number?: number; name?: string };  // Street address details
    city?: string;        // City name
    state?: string;       // State/province
    country?: string;     // Country name
    postcode?: string | number;  // Postal/zip code
  };
  email: string;          // User's email address (required field)
  dob?: { date?: string; age?: number };          // Date of birth and calculated age
  registered?: { date?: string; age?: number };   // Registration date and years since registration
  phone?: string;         // Primary phone number
  cell?: string;          // Mobile/cell phone number
  picture?: {             // Profile picture URLs in different sizes
    large?: string;       // Large profile picture URL
    medium?: string;      // Medium profile picture URL
    thumbnail?: string;   // Thumbnail profile picture URL
  };
  nat?: string;           // Nationality code
}

/**
 * Interface defining the structure of the API response when fetching users
 * Contains pagination metadata and the actual user data array
 */
interface ApiResponse {
  page: number;           // Current page number
  perPage: number;        // Number of items per page
  total: number;          // Total number of users in the database
  span: string;           // Time span view (week, month, etc.)
  effectivePage: number;  // The actual page being displayed (may differ from requested)
  data: ApiUser[];        // Array of user objects
}

/**
 * Interface defining the form state when editing a user
 * Contains only the fields that can be modified through the edit dialog
 */
interface EditFormState {
  email: string;          // User's email address
  first: string;          // User's first name
  last: string;           // User's last name
  city: string;           // User's city
  country: string;        // User's country
}

// Base URL for the Users API
const API_BASE = "https://user-api.builder-io.workers.dev/api";

/**
 * Utility function to format date strings into a readable format
 * @param dateString - ISO date string from the API
 * @returns Formatted date string (e.g., "Jan 15, 2023") or empty string if invalid
 */
function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * CustomersTable Component
 * 
 * A comprehensive table component for displaying and managing customer/user data.
 * Features include:
 * - Server-side pagination through the Users API
 * - Search functionality (searches name, email, city)
 * - Sorting by various fields (name, location, age, registration date)
 * - Client-side filtering by gender and country
 * - Edit functionality with modal dialog
 * - Responsive design with Material-UI components
 * 
 * The component fetches data from the Users API and provides a complete
 * customer management interface suitable for CRM applications.
 */
export default function CustomersTable() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Data and loading states
  const [rows, setRows] = React.useState<ApiUser[]>([]);           // Current page of user data
  const [loading, setLoading] = React.useState(false);             // Loading indicator for API calls
  const [error, setError] = React.useState<string | null>(null);   // Error message if API calls fail

  // Pagination states
  const [page, setPage] = React.useState(1);           // Current page number (1-based)
  const [perPage, setPerPage] = React.useState(10);    // Number of items to display per page
  const [total, setTotal] = React.useState(0);         // Total number of items in database

  // Search and filter states
  const [search, setSearch] = React.useState("");               // Search query string
  const [sortBy, setSortBy] = React.useState("name.first");     // Current sort field
  const [genderFilter, setGenderFilter] = React.useState<string>("all");    // Gender filter
  const [countryFilter, setCountryFilter] = React.useState<string>("all");  // Country filter

  // Edit modal states
  const [editOpen, setEditOpen] = React.useState(false);                    // Whether edit modal is open
  const [editingUser, setEditingUser] = React.useState<ApiUser | null>(null);  // User being edited
  const [editForm, setEditForm] = React.useState<EditFormState | null>(null);  // Form data for editing
  const [saving, setSaving] = React.useState(false);                       // Saving indicator for edit operations

  // ============================================================================
  // DATA FETCHING LOGIC
  // ============================================================================
  
  /**
   * Main data loading function that fetches users from the API
   * Uses useCallback to prevent unnecessary re-renders and to allow proper dependency tracking
   * Supports search, sorting, and pagination parameters
   */
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct API URL with query parameters
      const url = new URL(`${API_BASE}/users`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("perPage", String(perPage));
      
      // Add search parameter if user has entered a search query
      if (search.trim()) url.searchParams.set("search", search.trim());
      
      // Add sort parameter to control server-side sorting
      if (sortBy) url.searchParams.set("sortBy", sortBy);
      
      // Make API request
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      
      // Parse response and update state
      const json = (await res.json()) as ApiResponse;
      setRows(json.data);
      setTotal(json.total);
    } catch (e: any) {
      // Handle any errors that occur during the API call
      setError(e?.message || "Failed to load users");
    } finally {
      // Always clear loading state regardless of success or failure
      setLoading(false);
    }
  }, [page, perPage, search, sortBy]);

  // Effect to reload data whenever load dependencies change
  React.useEffect(() => {
    load();
  }, [load]);

  // ============================================================================
  // COMPUTED VALUES AND FILTERING
  // ============================================================================
  
  /**
   * Extract unique countries from the current data set for the country filter dropdown
   * This creates a dynamic list of countries based on the users currently loaded
   */
  const countries = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((u) => {
      const c = u.location?.country?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  /**
   * Apply client-side filters to the loaded data
   * Note: Search and sorting are handled server-side, but gender and country filters
   * are applied client-side for better user experience with the current data set
   */
  const filteredRows = React.useMemo(() => {
    return rows.filter((u) => {
      // Check if user matches gender filter
      const genderOk = genderFilter === "all" || (u.gender || "").toLowerCase() === genderFilter;
      
      // Check if user matches country filter
      const countryOk = countryFilter === "all" || (u.location?.country || "") === countryFilter;
      
      return genderOk && countryOk;
    });
  }, [rows, genderFilter, countryFilter]);

  // Calculate total pages for pagination component
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // ============================================================================
  // EVENT HANDLERS FOR EDIT FUNCTIONALITY
  // ============================================================================
  
  /**
   * Handler to open the edit modal for a specific user
   * Initializes the edit form with the user's current data
   * @param user - The user object to edit
   */
  function handleOpenEdit(user: ApiUser) {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      first: user.name?.first || "",
      last: user.name?.last || "",
      city: user.location?.city || "",
      country: user.location?.country || "",
    });
    setEditOpen(true);
  }

  /**
   * Handler to close the edit modal and reset all edit-related state
   */
  function handleCloseEdit() {
    setEditOpen(false);
    setEditingUser(null);
    setEditForm(null);
  }

  /**
   * Handler to save user edits to the server
   * Performs optimistic updates to provide immediate feedback
   * Only sends changed fields to minimize API payload
   */
  async function handleSaveEdit() {
    if (!editingUser || !editForm) return;
    
    setSaving(true);
    try {
      // Determine user identifier (prefer UUID, fallback to username or email)
      const id = editingUser.login?.uuid || editingUser.login?.username || editingUser.email;
      
      // Build payload with only changed fields to minimize data transfer
      const payload: any = {};
      
      // Check if name fields have changed
      if (editForm.first !== editingUser.name?.first || editForm.last !== editingUser.name?.last) {
        payload.name = { ...(editingUser.name || {}), first: editForm.first, last: editForm.last };
      }
      
      // Check if email has changed
      if (editForm.email !== editingUser.email) {
        payload.email = editForm.email;
      }
      
      // Check if location fields have changed
      if (
        editForm.city !== (editingUser.location?.city || "") ||
        editForm.country !== (editingUser.location?.country || "")
      ) {
        payload.location = {
          ...(editingUser.location || {}),
          city: editForm.city,
          country: editForm.country,
        };
      }

      // Send PUT request to update user
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to update user (${res.status})`);

      // Optimistically update local state to provide immediate feedback
      // This updates the table data without requiring a full reload
      setRows((prev) =>
        prev.map((u) =>
          (u.login?.uuid || u.login?.username || u.email) === id
            ? {
                ...u,
                email: editForm.email,
                name: { ...(u.name || {}), first: editForm.first, last: editForm.last },
                location: { ...(u.location || {}), city: editForm.city, country: editForm.country },
              }
            : u,
        ),
      );
      
      // Close the edit modal on successful save
      handleCloseEdit();
    } catch (e) {
      // Show error to user but keep modal open for retry
      // Using alert for simplicity, could be replaced with a more sophisticated notification system
      alert((e as Error).message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================
  
  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      {/* Header section with title and filter controls */}
      <CardContent sx={{ pb: 0 }}>
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems={{ xs: "stretch", sm: "center" }} 
          justifyContent="space-between" 
          sx={{ mb: 2 }}
        >
          {/* Table title */}
          <Typography variant="h6">Customers</Typography>
          
          {/* Filter and search controls */}
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={2} 
            alignItems={{ xs: "stretch", sm: "center" }} 
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {/* Search input - triggers server-side search */}
            <TextField
              size="small"
              label="Search"
              placeholder="Name, email, city..."
              value={search}
              onChange={(e) => {
                setPage(1); // Reset to first page when searching
                setSearch(e.target.value);
              }}
            />
            
            {/* Sort dropdown - controls server-side sorting */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="sort-by-label">Sort by</InputLabel>
              <Select
                labelId="sort-by-label"
                label="Sort by"
                value={sortBy}
                onChange={(e) => {
                  setPage(1); // Reset to first page when changing sort
                  setSortBy(String(e.target.value));
                }}
              >
                <MenuItem value="name.first">First name</MenuItem>
                <MenuItem value="name.last">Last name</MenuItem>
                <MenuItem value="location.city">City</MenuItem>
                <MenuItem value="location.country">Country</MenuItem>
                <MenuItem value="dob.age">Age</MenuItem>
                <MenuItem value="registered.date">Registered date</MenuItem>
              </Select>
            </FormControl>
            
            {/* Gender filter - client-side filtering */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="gender-filter-label">Gender</InputLabel>
              <Select
                labelId="gender-filter-label"
                label="Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(String(e.target.value))}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
            
            {/* Country filter - client-side filtering with dynamic options */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="country-filter-label">Country</InputLabel>
              <Select
                labelId="country-filter-label"
                label="Country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(String(e.target.value))}
              >
                <MenuItem value="all">All</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Items per page selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="per-page-label">Per page</InputLabel>
              <Select
                labelId="per-page-label"
                label="Per page"
                value={perPage}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPerPage(v);
                  setPage(1); // Reset to first page when changing page size
                }}
              >
                {[10, 20, 50].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </CardContent>
      
      {/* Main table container */}
      <TableContainer>
        <Table size="small" aria-label="customers table">
          {/* Table header with column definitions */}
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          
          {/* Table body with conditional rendering for different states */}
          <TableBody>
            {loading ? (
              /* Loading state - show spinner and message */
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading users…</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : error ? (
              /* Error state - show error message */
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              /* Empty state - show when no results match filters */
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No results</Typography>
                </TableCell>
              </TableRow>
            ) : (
              /* Data rows - render each user as a table row */
              filteredRows.map((u) => {
                // Extract and format user data for display
                const id = u.login?.uuid || u.login?.username || u.email;
                const fullName = `${u.name?.first || ""} ${u.name?.last || ""}`.trim();
                const locParts = [u.location?.city, u.location?.country].filter(Boolean);
                const location = locParts.join(", ");
                
                return (
                  <TableRow key={id} hover>
                    {/* Name column with avatar and formatted name */}
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={u.picture?.thumbnail} sx={{ width: 28, height: 28 }}>
                          {(u.name?.first?.[0] || "").toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {fullName || u.login?.username || "Unnamed"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    {/* Email column */}
                    <TableCell>{u.email}</TableCell>
                    
                    {/* Location column - combines city and country */}
                    <TableCell>{location}</TableCell>
                    
                    {/* Age column - shows age or dash if not available */}
                    <TableCell align="right">{u.dob?.age ?? "-"}</TableCell>
                    
                    {/* Registration date column */}
                    <TableCell>{formatDate(u.registered?.date)}</TableCell>
                    
                    {/* Actions column with edit button */}
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Edit user" onClick={() => handleOpenEdit(u)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Footer with pagination controls and summary info */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5 }}>
        {/* Summary text showing current page and total count */}
        <Typography variant="body2" color="text.secondary">
          Page {page} of {totalPages} • {total.toLocaleString()} total
        </Typography>
        
        {/* Pagination component for navigating between pages */}
        <Pagination
          color="primary"
          shape="rounded"
          page={page}
          onChange={(_e, p) => setPage(p)}
          count={totalPages}
          siblingCount={0}  // Show minimal page numbers for compact display
          boundaryCount={1} // Show first and last page numbers
        />
      </Box>

      {/* Edit User Modal Dialog */}
      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <Box component="form" autoComplete="off" sx={{ mt: 1 }}>
              {/* Grid layout for form fields */}
              <Grid container spacing={2}>
                {/* First name field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First name"
                    value={editForm.first}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), first: e.target.value })}
                  />
                </Grid>
                
                {/* Last name field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last name"
                    value={editForm.last}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), last: e.target.value })}
                  />
                </Grid>
                
                {/* Email field */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), email: e.target.value })}
                  />
                </Grid>
                
                {/* City field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), city: e.target.value })}
                  />
                </Grid>
                
                {/* Country field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), country: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        {/* Dialog actions with Cancel and Save buttons */}
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
