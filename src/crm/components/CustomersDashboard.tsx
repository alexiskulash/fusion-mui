import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  TablePagination,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  TableSortLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useUsers, User } from '../hooks/useUsers';
import UserEditModal from './UserEditModal';

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Get user status (example logic based on registration age)
const getUserStatus = (user: User) => {
  const registeredAge = user.registered.age;
  if (registeredAge < 1) return { label: 'New', color: 'info' as const };
  if (registeredAge < 3) return { label: 'Active', color: 'success' as const };
  return { label: 'Veteran', color: 'primary' as const };
};

export default function CustomersDashboard() {
  const {
    users,
    loading,
    error,
    page,
    perPage,
    total,
    searchTerm,
    sortBy,
    setPage,
    setPerPage,
    setSearchTerm,
    setSortBy,
    updateUser,
    deleteUser,
  } = useUsers();

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [actionMenuUser, setActionMenuUser] = React.useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    setActionMenuAnchor(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name.first} ${user.name.last}?`)) {
      await deleteUser(user.login.uuid);
    }
    setActionMenuAnchor(null);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    if (!selectedUser) return { success: false };
    return await updateUser(selectedUser.login.uuid, userData);
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuUser(user);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  };

  const handleSort = (field: string) => {
    setSortBy(field);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage + 1); // API uses 1-based pagination
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  if (error) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="error">
            <Typography variant="h6">Error loading users</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6" component="h2">
              Customer Directory
            </Typography>
            <Chip label={`${total} customers`} variant="outlined" />
          </Stack>

          <TextField
            fullWidth
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer>
            <Table size="small" aria-label="customers table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'name.first'}
                      direction={sortBy === 'name.first' ? 'asc' : 'desc'}
                      onClick={() => handleSort('name.first')}
                    >
                      Customer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'location.city'}
                      direction={sortBy === 'location.city' ? 'asc' : 'desc'}
                      onClick={() => handleSort('location.city')}
                    >
                      Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'registered.date'}
                      direction={sortBy === 'registered.date' ? 'asc' : 'desc'}
                      onClick={() => handleSort('registered.date')}
                    >
                      Joined
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: perPage }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Box>
                            <Skeleton variant="text" width={120} />
                            <Skeleton variant="text" width={80} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell align="right"><Skeleton variant="circular" width={24} height={24} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  users.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <TableRow key={user.login.uuid} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={user.picture.thumbnail}
                              sx={{ width: 32, height: 32 }}
                            >
                              {user.name.first[0]}{user.name.last[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.name.first} {user.name.last}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
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
                          <Chip
                            label={status.label}
                            size="small"
                            color={status.color}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(user.registered.date)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleActionMenuOpen(e, user)}
                            aria-label="user actions"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page - 1} // Convert to 0-based for MUI
            onPageChange={handlePageChange}
            rowsPerPage={perPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            showFirstButton
            showLastButton
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => actionMenuUser && handleEditUser(actionMenuUser)}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => actionMenuUser && handleDeleteUser(actionMenuUser)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Modal */}
      <UserEditModal
        open={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />
    </Box>
  );
}
