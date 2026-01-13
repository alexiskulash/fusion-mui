import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

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
  };
  email: string;
  dob: {
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

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  state: string;
  country: string;
  phone: string;
}

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        perPage: String(paginationModel.pageSize),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      const data = await response.json();

      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle edit button click
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      city: user.location.city,
      state: user.location.state,
      country: user.location.country,
      phone: user.phone,
    });
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
        fetchUsers();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete user",
        severity: "error",
      });
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: formData.firstName,
              last: formData.lastName,
            },
            email: formData.email,
            location: {
              city: formData.city,
              state: formData.state,
              country: formData.country,
            },
            phone: formData.phone,
          }),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
        setEditDialogOpen(false);
        fetchUsers();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setSnackbar({
        open: true,
        message: "Failed to update user",
        severity: "error",
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "picture",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture.thumbnail}
          alt={`${params.row.name.first} ${params.row.name.last}`}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.state}, ${row.location.country}`,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      valueGetter: (value, row) => row.dob.age,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            aria-label="Edit user"
            color="primary"
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.login.uuid)}
            aria-label="Delete user"
            color="error"
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3, color: "text.secondary" }}>
        Manage your customer database, search users, and update their
        information.
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.login.uuid}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          rowCount={total}
          paginationMode="server"
          loading={loading}
          density="compact"
          disableColumnResize
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
