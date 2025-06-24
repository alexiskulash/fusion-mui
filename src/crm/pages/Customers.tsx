import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { User, usersApi, UsersResponse } from "../services/usersApi";
import UserEditModal from "../components/UserEditModal";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color?: "primary" | "secondary" | "success" | "warning";
}

function StatCard({ title, value, icon, color = "primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Customers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newThisWeek: 0,
    activeUsers: 0,
    countries: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: UsersResponse = await usersApi.getUsers({
        page: paginationModel.page + 1,
        perPage: paginationModel.pageSize,
        search: searchTerm || undefined,
        sortBy: "name.first",
      });

      setUsers(response.data);
      setTotalUsers(response.total);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalUsers: response.total,
        newThisWeek: Math.floor(response.total * 0.05), // Approximate
        activeUsers: Math.floor(response.total * 0.8), // Approximate
        countries: new Set(response.data.map((user) => user.location.country))
          .size,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
    handleMenuClose();
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

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row?.picture?.thumbnail}
          alt={`${params.row?.name?.first || ""} ${params.row?.name?.last || ""}`}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      width: 200,
      valueGetter: (params) => {
        if (!params?.row?.name) return "";
        return `${params.row.name.title || ""} ${params.row.name.first || ""} ${params.row.name.last || ""}`.trim();
      },
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "username",
      headerName: "Username",
      width: 150,
      valueGetter: (params) => params?.row?.login?.username || "",
    },
    {
      field: "location",
      headerName: "Location",
      width: 200,
      valueGetter: (params) => {
        if (!params?.row?.location) return "";
        return `${params.row.location.city || ""}, ${params.row.location.country || ""}`;
      },
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
      valueGetter: (params) => params?.row?.dob?.age || "",
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || "Unknown"}
          size="small"
          color={params.value === "male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => {
        if (!params?.row) return [];
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditUser(params.row)}
          />,
          <GridActionsCellItem
            icon={<MoreVertIcon />}
            label="More"
            onClick={(event) =>
              handleMenuOpen(event, params.row.login?.uuid || "")
            }
          />,
        ];
      },
    },
  ];

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
          <StatCard
            title="Total Customers"
            value={stats.totalUsers.toLocaleString()}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="New This Week"
            value={stats.newThisWeek}
            icon={<PersonAddIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={<TrendingUpIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Countries"
            value={stats.countries}
            icon={<PublicIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Search and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search customers by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
              rows={users}
              columns={columns}
              getRowId={(row) => row.login.uuid}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              rowCount={totalUsers}
              paginationMode="server"
              loading={loading}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid rgba(224, 224, 224, 1)",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderBottom: "2px solid rgba(224, 224, 224, 1)",
                },
              }}
            />
          </Box>
        </CardContent>
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
          Edit User
        </MenuItem>
        <MenuItem
          onClick={() => menuUserId && handleDeleteUser(menuUserId)}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <UserEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />
    </Box>
  );
}
