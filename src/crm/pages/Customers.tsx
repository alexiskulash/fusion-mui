import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
}

interface UserName {
  title: string;
  first: string;
  last: string;
}

interface UserLogin {
  uuid: string;
  username: string;
}

interface User {
  login: UserLogin;
  name: UserName;
  email: string;
  phone: string;
  cell: string;
  location: UserLocation;
  gender: string;
  dob: {
    date: string;
    age: number;
  };
  registered: {
    date: string;
    age: number;
  };
  picture?: {
    thumbnail?: string;
  };
  nat: string;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "",
  });
  const [saving, setSaving] = React.useState(false);

  const fetchUsers = React.useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("https://user-api.builder-io.workers.dev/api/users");
      url.searchParams.set("perPage", "100");
      if (search) {
        url.searchParams.set("search", search);
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    fetchUsers(searchQuery);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      phone: user.phone,
      city: user.location.city,
      state: user.location.state,
      country: user.location.country,
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: {
              first: editFormData.firstName,
              last: editFormData.lastName,
            },
            email: editFormData.email,
            phone: editFormData.phone,
            location: {
              city: editFormData.city,
              state: editFormData.state,
              country: editFormData.country,
            },
          }),
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
                  state: editFormData.state,
                  country: editFormData.country,
                },
              }
            : user
        )
      );

      handleEditClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      renderCell: (params: GridRenderCellParams<User>) => {
        const user = params.row;
        return (
          <Avatar
            src={user.picture?.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 32, height: 32 }}
          >
            {user.name.first.charAt(0)}
            {user.name.last.charAt(0)}
          </Avatar>
        );
      },
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 250,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.state}, ${row.location.country}`,
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
      renderCell: (params: GridRenderCellParams<User>) => {
        const gender = params.row.gender;
        return (
          <Chip
            label={gender.charAt(0).toUpperCase() + gender.slice(1)}
            size="small"
            color={gender === "male" ? "primary" : "secondary"}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params: GridRenderCellParams<User>) => (
        <IconButton
          size="small"
          onClick={() => handleEditClick(params.row)}
          aria-label="edit user"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3 }}>
        Manage your customer database. Search, view, and edit customer
        information.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or city..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={handleSearchSubmit} variant="contained">
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.login.uuid}
          loading={loading}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 20 } },
          }}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnResize
          density="compact"
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: {
                  variant: "outlined",
                  size: "small",
                },
                columnInputProps: {
                  variant: "outlined",
                  size: "small",
                  sx: { mt: "auto" },
                },
                operatorInputProps: {
                  variant: "outlined",
                  size: "small",
                  sx: { mt: "auto" },
                },
                valueInputProps: {
                  InputComponentProps: {
                    variant: "outlined",
                    size: "small",
                  },
                },
              },
            },
          }}
        />
      </Box>

      <Dialog
        open={editDialogOpen}
        onClose={handleEditClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.firstName}
                onChange={(e) => handleFormChange("firstName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.lastName}
                onChange={(e) => handleFormChange("lastName", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={editFormData.state}
                onChange={(e) => handleFormChange("state", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                value={editFormData.country}
                onChange={(e) => handleFormChange("country", e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
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
