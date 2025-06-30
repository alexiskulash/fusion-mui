import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { User, usersApi, UsersResponse } from "../services/usersApi";
import UserEditModal from "../components/UserEditModal";

interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  activeCustomers: number;
  topCountries: { country: string; count: number }[];
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [perPage] = React.useState(10);
  const [stats, setStats] = React.useState<CustomerStats>({
    totalCustomers: 0,
    newThisMonth: 0,
    activeCustomers: 0,
    topCountries: [],
  });

  // Modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | undefined>();

  // Menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: UsersResponse = await usersApi.getUsers({
        page: currentPage,
        perPage,
        search: searchTerm || undefined,
        sortBy,
      });

      setUsers(response.data);
      setTotalUsers(response.total);
      setTotalPages(Math.ceil(response.total / perPage));

      // Calculate stats
      const countryCounts = response.data.reduce(
        (acc, user) => {
          const country = user.location.country;
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const topCountries = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setStats({
        totalCustomers: response.total,
        newThisMonth: Math.floor(response.total * 0.15), // Mock calculation
        activeCustomers: Math.floor(response.total * 0.8), // Mock calculation
        topCountries,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchTerm, sortBy]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortBy(event.target.value as string);
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await usersApi.deleteUser(userId);
        await fetchUsers(); // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete user");
      }
    }
    handleMenuClose();
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the list after user update
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGenderColor = (gender: string) => {
    return gender === "male" ? "primary" : "secondary";
  };

  if (loading && users.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customer Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Total Customers
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    New This Month
                  </Typography>
                  <Typography variant="h4">
                    {stats.newThisMonth.toLocaleString()}
                  </Typography>
                </Box>
                <PersonAddIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Active Customers
                  </Typography>
                  <Typography variant="h4">
                    {stats.activeCustomers.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Top Country
                  </Typography>
                  <Typography variant="h6">
                    {stats.topCountries[0]?.country || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.topCountries[0]?.count || 0} customers
                  </Typography>
                </Box>
                <LocationOnIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              placeholder="Search customers..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flex: 1 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="name.first">First Name</MenuItem>
                <MenuItem value="name.last">Last Name</MenuItem>
                <MenuItem value="location.city">City</MenuItem>
                <MenuItem value="location.country">Country</MenuItem>
                <MenuItem value="dob.age">Age</MenuItem>
                <MenuItem value="registered.date">Registration Date</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                /* TODO: Implement add user */
              }}
            >
              Add Customer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.login.uuid} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={user.picture.thumbnail}
                        alt={`${user.name.first} ${user.name.last}`}
                      />
                      <Box>
                        <Typography variant="subtitle2">
                          {user.name.title} {user.name.first} {user.name.last}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{user.login.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.phone}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {user.location.city}, {user.location.state}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.location.country}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">{user.dob.age}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.gender}
                      color={
                        getGenderColor(user.gender) as "primary" | "secondary"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.registered.date)}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, user.login.uuid)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Typography variant="body2" color="textSecondary">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, totalUsers)} of {totalUsers}{" "}
            customers
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const user = users.find((u) => u.login.uuid === menuUserId);
            if (user) handleEditUser(user);
          }}
        >
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUserId) handleDeleteUser(menuUserId);
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <UserEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
