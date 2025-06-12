import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useUsers } from "../hooks/useUsers";
import UserDataGrid from "../components/UserDataGrid";
import UserEditModal from "../components/UserEditModal";
import { User, UpdateUserData } from "../services/usersApi";

export default function Customers() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

  const {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    refreshUsers,
    updateUser,
    deleteUser,
  } = useUsers({
    page,
    perPage: pageSize,
    search,
    sortBy,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleSaveUser = async (id: string, userData: UpdateUserData) => {
    await updateUser(id, userData);
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.login.uuid);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  // Calculate summary statistics
  const averageAge =
    users.length > 0
      ? Math.round(
          users.reduce((sum, user) => sum + user.dob.age, 0) / users.length,
        )
      : 0;

  const countryDistribution = users.reduce(
    (acc, user) => {
      acc[user.location.country] = (acc[user.location.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const genderDistribution = users.reduce(
    (acc, user) => {
      acc[user.gender] = (acc[user.gender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Customer Management Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {totalUsers.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {averageAge}
                  </Typography>
                  <Typography color="text.secondary">Average Age</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <LocationOnIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {Object.keys(countryDistribution).length}
                  </Typography>
                  <Typography color="text.secondary">Countries</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {users.length}
                  </Typography>
                  <Typography color="text.secondary">Showing Now</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Countries
              </Typography>
              <Stack spacing={1}>
                {topCountries.map(([country, count]) => (
                  <Stack
                    key={country}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">{country}</Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              <Stack spacing={1}>
                {Object.entries(genderDistribution).map(([gender, count]) => (
                  <Stack
                    key={gender}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {gender}
                    </Typography>
                    <Chip
                      label={count}
                      size="small"
                      color={gender === "male" ? "primary" : "secondary"}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Data Grid */}
      <Box sx={{ height: 600 }}>
        <UserDataGrid
          users={users}
          loading={loading}
          error={error}
          totalUsers={totalUsers}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onRefresh={refreshUsers}
        />
      </Box>

      {/* Edit User Modal */}
      <UserEditModal
        open={editModalOpen}
        user={selectedUser}
        onClose={handleCloseEditModal}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {userToDelete && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar src={userToDelete.picture.thumbnail} />
              <Box>
                <Typography variant="subtitle1">
                  {userToDelete.name.first} {userToDelete.name.last}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userToDelete.email}
                </Typography>
              </Box>
            </Box>
          )}
          <Alert severity="warning">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
