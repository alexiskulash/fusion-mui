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

interface UsersResponse {
  page: number;
  perPage: number;
  total: number;
  data: User[];
}

const API_BASE = "https://user-api.builder-io.workers.dev/api";

export default function CrmUsersTable() {
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
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
    setSelectedUser({ ...user });
    setEditModalOpen(true);
    setSaveError(null);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    setSaveError(null);
  };

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

      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!selectedUser) return;

    const keys = field.split(".");
    const updatedUser = { ...selectedUser };
    let current: any = updatedUser;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSelectedUser(updatedUser);
  };

  const getInitials = (user: User) => {
    return `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" component="h2">
                Users
              </Typography>
              <TextField
                placeholder="Search users..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 250 }}
              />
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.location?.city && user.location?.country
                                ? `${user.location.city}, ${user.location.country}`
                                : "N/A"}
                            </TableCell>
                            <TableCell>{user.phone || "N/A"}</TableCell>
                            <TableCell>{user.dob?.age || "N/A"}</TableCell>
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

            {saveError && <Alert severity="error">{saveError}</Alert>}

            {selectedUser && (
              <Grid container spacing={2}>
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

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                </Grid>

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
