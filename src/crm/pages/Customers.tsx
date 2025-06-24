import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Avatar,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  TablePagination,
  CircularProgress,
  Alert,
  Skeleton,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { User, fetchUsers, UsersApiResponse } from "../services/usersApi";
import UserEditModal from "../components/UserEditModal";

// Statistics card component for the dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography color="text.primary" variant="body1">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" variant="body2">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

// Loading skeleton for the table
function TableSkeleton() {
  return (
    <>
      {Array.from(new Array(5)).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Box>
                <Skeleton width={120} height={20} />
                <Skeleton width={80} height={16} />
              </Box>
            </Stack>
          </TableCell>
          <TableCell>
            <Skeleton width={150} />
          </TableCell>
          <TableCell>
            <Skeleton width={100} />
          </TableCell>
          <TableCell>
            <Skeleton width={120} />
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell align="right">
            <Skeleton width={40} height={40} variant="circular" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// Format date helper
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Get initials for avatar
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users data
  const loadUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: UsersApiResponse = await fetchUsers(
        page + 1, // API is 1-indexed
        rowsPerPage,
        debouncedSearchQuery || undefined,
        "name.first", // Sort by first name
        "week",
      );

      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchQuery]);

  // Load users on component mount and when dependencies change
  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset to first page when search changes
  React.useEffect(() => {
    setPage(0);
  }, [debouncedSearchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    loadUsers(); // Refresh the users list
  };

  const handleRefresh = () => {
    loadUsers();
  };

  // Statistics based on loaded users
  const statsData = React.useMemo(() => {
    const totalCount = totalUsers;
    const currentPageCount = users.length;
    const genderStats = users.reduce(
      (acc, user) => {
        if (user.gender === "male") acc.male++;
        else if (user.gender === "female") acc.female++;
        return acc;
      },
      { male: 0, female: 0 },
    );

    return {
      total: totalCount,
      showing: currentPageCount,
      male: genderStats.male,
      female: genderStats.female,
    };
  }, [users, totalUsers]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Customer Management
          </Typography>
          <Typography color="text.secondary">
            Manage your customer database and user profiles
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="contained" startIcon={<PersonAddIcon />}>
            Add Customer
          </Button>
        </Stack>
      </Stack>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={statsData.total.toLocaleString()}
            subtitle="In database"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Showing"
            value={statsData.showing}
            subtitle="On current page"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Male Customers"
            value={statsData.male}
            subtitle="Current page"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Female Customers"
            value={statsData.female}
            subtitle="Current page"
          />
        </Grid>
      </Grid>

      {/* Search and Controls */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <TextField
              placeholder="Search customers by name, email, or city..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ minWidth: { sm: 300 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
              >
                Filters
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card variant="outlined">
        <TableContainer>
          <Table aria-label="customers table">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton />
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {debouncedSearchQuery
                        ? "No customers found matching your search"
                        : "No customers found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.login.uuid} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={user.picture?.thumbnail}
                          alt={`${user.name?.first} ${user.name?.last}`}
                          sx={{ width: 40, height: 40 }}
                        >
                          {getInitials(user.name?.first, user.name?.last)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name?.title} {user.name?.first}{" "}
                            {user.name?.last}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.login?.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.location?.city}, {user.location?.state}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.location?.country}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatDate(user.registered?.date)}
                        </Typography>
                        <Chip
                          label={`${user.dob?.age} years old`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        aria-label={`Edit ${user.name?.first} ${user.name?.last}`}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showFirstButton
          showLastButton
        />
      </Card>

      {/* Edit User Modal */}
      <UserEditModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />
    </Box>
  );
}
