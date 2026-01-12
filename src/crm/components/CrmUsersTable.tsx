import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

interface User {
  login: {
    uuid: string;
    username: string;
    password?: string;
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    timezone?: {
      offset: string;
      description: string;
    };
  };
  email: string;
  dob?: {
    date: string;
    age: number;
  };
  registered?: {
    date: string;
    age: number;
  };
  phone?: string;
  cell?: string;
  picture?: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  nat?: string;
}

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export default function CrmUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        perPage: String(paginationModel.pageSize),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      setUsers(data.data);
      setTotalRows(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData(user);
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditFormData({});
    setSaving(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/users/${selectedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      // Refresh the users list
      await fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      console.error("Error updating user:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setEditFormData((prev) => {
      const newData = { ...prev };
      const keys = field.split(".");
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.name.title} ${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
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
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.state}, ${row.location.country}`,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      valueGetter: (value, row) => row.dob?.age || "N/A",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row)}
          color="primary"
        />,
      ],
    },
  ];

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" component="h2">
            Users Management
          </Typography>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPaginationModel({ ...paginationModel, page: 0 }); // Reset to first page on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.login.uuid}
            pagination
            paginationMode="server"
            rowCount={totalRows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
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
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ mt: 1 }}>
            <Grid2 xs={12} sm={4}>
              <TextField
                fullWidth
                label="Title"
                value={editFormData.name?.title || ""}
                onChange={(e) => handleFormChange("name.title", e.target.value)}
              />
            </Grid2>
            <Grid2 xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.name?.first || ""}
                onChange={(e) => handleFormChange("name.first", e.target.value)}
              />
            </Grid2>
            <Grid2 xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.name?.last || ""}
                onChange={(e) => handleFormChange("name.last", e.target.value)}
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone || ""}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={editFormData.location?.city || ""}
                onChange={(e) =>
                  handleFormChange("location.city", e.target.value)
                }
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={editFormData.location?.state || ""}
                onChange={(e) =>
                  handleFormChange("location.state", e.target.value)
                }
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={editFormData.location?.country || ""}
                onChange={(e) =>
                  handleFormChange("location.country", e.target.value)
                }
              />
            </Grid2>
            <Grid2 xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postcode"
                value={editFormData.location?.postcode || ""}
                onChange={(e) =>
                  handleFormChange("location.postcode", e.target.value)
                }
              />
            </Grid2>
            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Street Name"
                value={editFormData.location?.street?.name || ""}
                onChange={(e) =>
                  handleFormChange("location.street.name", e.target.value)
                }
              />
            </Grid2>
            <Grid2 xs={12}>
              <TextField
                fullWidth
                label="Street Number"
                type="number"
                value={editFormData.location?.street?.number || ""}
                onChange={(e) =>
                  handleFormChange("location.street.number", parseInt(e.target.value))
                }
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
