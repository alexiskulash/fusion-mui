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
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import InputBase from "@mui/material/InputBase";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alpha, styled } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import EditUserDialog from "./EditUserDialog";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface User {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  gender: string;
  email: string;
  phone: string;
  cell: string;
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  dob?: {
    date: string;
    age: number;
  };
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

const SearchWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
  ...theme.applyStyles("dark", {
    backgroundColor: alpha(theme.palette.common.white, 0.06),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.1),
    },
  }),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
}));

export default function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page + 1), // API uses 1-based pagination
        perPage: String(rowsPerPage),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${updatedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  const getInitials = (user: User) => {
    return `${user.name.first.charAt(0)}${user.name.last.charAt(0)}`.toUpperCase();
  };

  const formatPhoneNumber = (phone: string) => {
    return phone || "N/A";
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ pb: 0 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" component="h2">
              Users
            </Typography>
            <SearchWrapper>
              <SearchIconWrapper>
                <SearchRoundedIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search users…"
                inputProps={{ "aria-label": "search users" }}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </SearchWrapper>
          </Stack>
        </CardContent>

        {error && (
          <Box sx={{ px: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.login.uuid} hover>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                          >
                            <Avatar
                              src={user.picture?.thumbnail}
                              sx={{ width: 36, height: 36, fontSize: "0.875rem" }}
                            >
                              {getInitials(user)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
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
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.location.city}, {user.location.state}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.location.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatPhoneNumber(user.phone)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {user.gender}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label="edit user"
                            onClick={() => handleEditClick(user)}
                            color="primary"
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
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalUsers}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>

      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        onClose={handleCloseDialog}
        onSave={handleSaveUser}
      />
    </>
  );
}
