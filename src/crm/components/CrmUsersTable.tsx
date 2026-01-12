import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CrmUserEditModal from "./CrmUserEditModal";

// User type based on the API
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
  data: User[];
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function CrmUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page + 1), // API pages start at 1
        perPage: String(pageSize),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: ApiResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search with debounce
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Handle edit button click
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  // Handle user update success
  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the list
    handleModalClose();
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture?.thumbnail}
          alt={`${params.row.name?.first} ${params.row.name?.last}`}
          sx={{ width: 32, height: 32 }}
        />
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1.5,
      minWidth: 180,
      valueGetter: (value, row) =>
        `${row.name?.title || ""} ${row.name?.first || ""} ${row.name?.last || ""}`.trim(),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 120,
      valueGetter: (value, row) => row.login?.username || "",
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) =>
        `${row.location?.city || ""}, ${row.location?.country || ""}`,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row.dob?.age || 0,
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
      field: "phone",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => handleEditClick(params.row)}
          aria-label="edit user"
        >
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" component="h3">
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {totalUsers}
            </Typography>
          </Stack>

          <TextField
            placeholder="Search users by name, email, or city..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Stack>
      </CardContent>

      <Box sx={{ flexGrow: 1, minHeight: 400 }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.login?.uuid}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalUsers}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnResize
          density="compact"
          getRowClassName={(params: GridRowParams) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          slotProps={{
            loadingOverlay: {
              variant: "skeleton",
              noRowsVariant: "skeleton",
            },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Box>

      {selectedUser && (
        <CrmUserEditModal
          open={editModalOpen}
          user={selectedUser}
          onClose={handleModalClose}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Card>
  );
}
