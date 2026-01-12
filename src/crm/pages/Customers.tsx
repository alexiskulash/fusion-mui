import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

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
  location: UserLocation;
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
  picture?: {
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
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [editFormData, setEditFormData] = React.useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
  });

  const fetchUsers = React.useCallback(
    async (currentPage: number, search: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          perPage: "20",
        });

        if (search) {
          params.append("search", search);
        }

        const response = await fetch(
          `https://user-api.builder-io.workers.dev/api/users?${params}`
        );
        const data = await response.json();

        setUsers(data.data || []);
        setTotalUsers(data.total || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
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
      country: user.location.country,
    });
    setEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
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

      if (response.ok) {
        // Refresh the users list
        fetchUsers(page, searchQuery);
        handleCloseDialog();
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as User;
        const initials = `${user.name.first[0]}${user.name.last[0]}`.toUpperCase();

        return (
          <Avatar
            src={user.picture?.thumbnail}
            alt={`${user.name.first} ${user.name.last}`}
            sx={{ width: 32, height: 32 }}
          >
            {initials}
          </Avatar>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row: User) =>
        `${row.name.title} ${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1.2,
      minWidth: 180,
      valueGetter: (value, row: User) =>
        `${row.location.city}, ${row.location.country}`,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      valueGetter: (value, row: User) => row.dob.age,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const gender = params.value as string;
        return (
          <Chip
            label={gender.charAt(0).toUpperCase() + gender.slice(1)}
            size="small"
            color={gender === "male" ? "primary" : "secondary"}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as User;
        return (
          <IconButton
            size="small"
            onClick={() => handleEditClick(user)}
            color="primary"
            aria-label="edit user"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        );
      },
    },
  ];

  const rows = users.map((user) => ({
    id: user.login.uuid,
    ...user,
  }));

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>
      <Typography paragraph sx={{ mb: 3, color: "text.secondary" }}>
        Manage your customer data and user accounts.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name, email, or city..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </Stack>

      <Box sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[20]}
          paginationMode="server"
          rowCount={totalUsers}
          paginationModel={{ page: page - 1, pageSize: 20 }}
          onPaginationModelChange={(model) => setPage(model.page + 1)}
          disableColumnResize
          density="comfortable"
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            "& .even": {
              bgcolor: "action.hover",
            },
          }}
        />
      </Box>

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="First Name"
              fullWidth
              value={editFormData.firstName}
              onChange={(e) => handleFormChange("firstName", e.target.value)}
            />
            <TextField
              label="Last Name"
              fullWidth
              value={editFormData.lastName}
              onChange={(e) => handleFormChange("lastName", e.target.value)}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editFormData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
            />
            <TextField
              label="Phone"
              fullWidth
              value={editFormData.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
            />
            <TextField
              label="City"
              fullWidth
              value={editFormData.city}
              onChange={(e) => handleFormChange("city", e.target.value)}
            />
            <TextField
              label="Country"
              fullWidth
              value={editFormData.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
