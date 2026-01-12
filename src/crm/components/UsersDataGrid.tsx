import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import EditUserModal from "./EditUserModal";

// User type based on the API
interface User {
  id: string;
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

// Format date helper
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function UsersDataGrid() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 20,
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  // Fetch users from API
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(paginationModel.page + 1),
        perPage: String(paginationModel.pageSize),
        sortBy: "name.first",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users?${params}`,
      );
      const data: ApiResponse = await response.json();

      setUsers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditUser(null);
  };

  // Handle save user
  const handleSaveUser = async (updatedUser: User) => {
    try {
      const response = await fetch(
        `https://user-api.builder-io.workers.dev/api/users/${updatedUser.login.uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        },
      );

      if (response.ok) {
        // Refresh the users list
        await fetchUsers();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Define columns
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture.thumbnail}
          alt={`${params.row.name.first} ${params.row.name.last}`}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.name.title} ${row.name.first} ${row.name.last}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) => row.login.username,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1.2,
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.location.city}, ${row.location.country}`,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.dob.age,
    },
    {
      field: "registered",
      headerName: "Registered",
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => formatDate(row.registered.date),
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
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleEditUser(params.row)}
          aria-label="edit user"
        >
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Transform users to rows
  const rows: GridRowsProp = users.map((user) => ({
    ...user,
    id: user.login.uuid,
  }));

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search users by name, email, or city..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ maxWidth: 500 }}
        />
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 20, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="server"
        rowCount={total}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        density="compact"
        disableColumnResize
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
        sx={{
          height: 600,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />

      {editUser && (
        <EditUserModal
          open={isEditModalOpen}
          user={editUser}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
        />
      )}
    </Box>
  );
}
