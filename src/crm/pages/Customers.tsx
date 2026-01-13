import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TableFooter from "@mui/material/TableFooter";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";

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

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState<Partial<User>>({});
  const [saving, setSaving] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          page: (page + 1).toString(), // API uses 1-based pages
          perPage: rowsPerPage.toString(),
        });

        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }

        const response = await fetch(`${API_BASE_URL}/users?${params}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: ApiResponse = await response.json();
        setUsers(data.data);
        setTotalUsers(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, rowsPerPage, debouncedSearch]);

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
    setEditingUser(user);
    setEditFormData({
      name: { ...user.name },
      email: user.email,
      location: {
        ...user.location,
        street: { ...user.location.street },
      },
      phone: user.phone,
      cell: user.cell,
    });
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditFormData({});
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/users/${editingUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.login.uuid === editingUser.login.uuid
            ? { ...user, ...editFormData }
            : user
        )
      );

      handleCloseEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Customers
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Search by name, email, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer>
              <Table size="small" aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="right">Age</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
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
                              src={user.picture.thumbnail}
                              alt={`${user.name.first} ${user.name.last}`}
                              sx={{ width: 36, height: 36 }}
                            />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                          <Typography variant="body2">{user.phone}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.cell}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip label={user.dob.age} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.registered.date)}
                          </Typography>
                        </TableCell>
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
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={totalUsers}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      showFirstButton
                      showLastButton
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Stack>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="First Name"
              value={editFormData.name?.first || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  name: { ...editFormData.name!, first: e.target.value },
                })
              }
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editFormData.name?.last || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  name: { ...editFormData.name!, last: e.target.value },
                })
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editFormData.email || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="City"
              value={editFormData.location?.city || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  location: {
                    ...editFormData.location!,
                    city: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="State"
              value={editFormData.location?.state || ""}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  location: {
                    ...editFormData.location!,
                    state: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label="Phone"
              value={editFormData.phone || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, phone: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Cell"
              value={editFormData.cell || ""}
              onChange={(e) =>
                setEditFormData({ ...editFormData, cell: e.target.value })
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
