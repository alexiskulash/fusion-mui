import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

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

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Fetch users from API
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "https://user-api.builder-io.workers.dev/api/users?perPage=100"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.data || []);
      setFilteredUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
      const email = user.email.toLowerCase();
      const city = user.location.city.toLowerCase();
      const country = user.location.country.toLowerCase();
      const username = user.login.username.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        city.includes(query) ||
        country.includes(query) ||
        username.includes(query)
      );
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      phone: user.phone,
      city: user.location.city,
      country: user.location.country,
    });
    setOpenEditModal(true);
  };

  const handleCloseModal = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
    setSuccessMessage(null);
  };

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError(null);

      const updatePayload = {
        name: {
          first: editFormData.firstName,
          last: editFormData.lastName,
        },
        email: editFormData.email,
        phone: editFormData.phone,
        location: {
          city: editFormData.city,
          country: editFormData.country,
        },
      };

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.login.uuid === selectedUser.login.uuid
            ? {
                ...user,
                name: {
                  ...user.name,
                  first: editFormData.firstName,
                  last: editFormData.lastName,
                },
                email: editFormData.email,
                phone: editFormData.phone,
                location: {
                  ...user.location,
                  city: editFormData.city,
                  country: editFormData.country,
                },
              }
            : user
        )
      );

      setSuccessMessage("User updated successfully!");
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
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
      minWidth: 180,
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.8,
      minWidth: 120,
      valueGetter: (value, row) => row.login.username,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => `${row.location.city}, ${row.location.country}`,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 0.8,
      minWidth: 140,
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
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={() => handleEditClick(params.row)}
          aria-label="Edit user"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer data, search users, and update information
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          placeholder="Search by name, email, city, country, or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row.login.uuid}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            disableRowSelectionOnClick
            density="comfortable"
            sx={{
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
              },
            }}
          />
        </Box>
      </Stack>

      {/* Edit User Modal */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 2 }}>
            {successMessage && (
              <Alert severity="success">{successMessage}</Alert>
            )}
            {error && (
              <Alert severity="error">{error}</Alert>
            )}
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={editFormData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={editFormData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
                fullWidth
                required
              />
            </Stack>
            <TextField
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="City"
                value={editFormData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                fullWidth
              />
              <TextField
                label="Country"
                value={editFormData.country}
                onChange={(e) => handleFormChange("country", e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
