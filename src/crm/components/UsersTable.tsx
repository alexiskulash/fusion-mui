import * as React from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { User, UsersApiParams } from "../types/User";
import { usersApi } from "../services/usersApi";

interface UsersTableProps {
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

type SortField =
  | "name.first"
  | "name.last"
  | "location.city"
  | "location.country"
  | "dob.age"
  | "registered.date";

export default function UsersTable({
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<SortField>("name.first");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, page, rowsPerPage, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UsersApiParams = {
        page: page + 1, // API uses 1-based pagination
        perPage: rowsPerPage,
        search: searchQuery || undefined,
        sortBy: sortBy,
      };

      const response = await usersApi.getUsers(params);
      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFullName = (user: User) => {
    return `${user.name.first} ${user.name.last}`;
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Users Management
        </Typography>
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "name.first"}
                  direction={sortBy === "name.first" ? sortOrder : "asc"}
                  onClick={() => handleSort("name.first")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "location.city"}
                  direction={sortBy === "location.city" ? sortOrder : "asc"}
                  onClick={() => handleSort("location.city")}
                >
                  Location
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "dob.age"}
                  direction={sortBy === "dob.age" ? sortOrder : "asc"}
                  onClick={() => handleSort("dob.age")}
                >
                  Age
                </TableSortLabel>
              </TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "registered.date"}
                  direction={sortBy === "registered.date" ? sortOrder : "asc"}
                  onClick={() => handleSort("registered.date")}
                >
                  Registered
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No users found matching your search."
                      : "No users available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.login.uuid} hover>
                  <TableCell>
                    <Avatar
                      src={user.picture.thumbnail}
                      alt={getFullName(user)}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {getFullName(user)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.login.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {user.location.city}, {user.location.state}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.location.country}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${user.dob.age} years`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{user.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.cell}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.registered.date)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onEditUser(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDeleteUser(user)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
