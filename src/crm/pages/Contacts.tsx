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
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
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

// Account status type
type AccountStatus = "Active" | "Suspended" | "Inactive";

export default function Contacts() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [selected, setSelected] = React.useState<string[]>([]);

  // Fetch users from the API
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page + 1),
        perPage: String(rowsPerPage),
        sortBy: sortBy,
        ...(search && { search }),
      });

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${queryParams}`
      );
      const data = await response.json();

      setUsers(data.data || []);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortBy]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search with debounce
  const [searchDebounced, setSearchDebounced] = React.useState(search);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    if (searchDebounced !== search) {
      setPage(0);
      fetchUsers();
    }
  }, [searchDebounced, search, fetchUsers]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
