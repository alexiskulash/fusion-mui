import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { User, UsersApiService, UsersResponse } from "../services/usersApi";
import UserEditModal from "./UserEditModal";

export default function UsersDataGrid() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [total, setTotal] = React.useState(0);
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: 20,
    });

  // Modal state
  const [editModal, setEditModal] = React.useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  const [searchDebounceTimer, setSearchDebounceTimer] =
    React.useState<NodeJS.Timeout | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const response: UsersResponse = await UsersApiService.getUsers({
        page: paginationModel.page + 1, // API is 1-indexed
        perPage: paginationModel.pageSize,
        search: search || undefined,
        sortBy: "name.first",
      });

      // Add id field for DataGrid
      const usersWithId = response.data.map((user) => ({
        ...user,
        id: user.login.uuid,
      }));

      setUsers(usersWithId);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);

    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to first page
    }, 500);

    setSearchDebounceTimer(timer);
  };

  const handleEditUser = (user: User) => {
    setEditModal({
      open: true,
      user,
    });
  };

  const handleDeleteUser = async (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.name.first} ${user.name.last}?`,
      )
    ) {
      try {
        await UsersApiService.deleteUser(user.login.uuid);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleCloseModal = () => {
    setEditModal({
      open: false,
      user: null,
    });
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getGenderColor = (
    gender: string,
  ): "primary" | "secondary" | "default" => {
    switch (gender.toLowerCase()) {
      case "male":
        return "primary";
      case "female":
        return "secondary";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    {
      field: "picture",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        if (!params?.row?.picture || !params?.row?.name?.first) return null;
        return (
          <Avatar
            src={params.row.picture.thumbnail}
            sx={{ width: 32, height: 32 }}
          >
            {params.row.name.first.charAt(0).toUpperCase()}
          </Avatar>
        );
      },
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      sortable: false,
      valueGetter: (params) => {
        if (!params?.row?.name) return "";
        return `${params.row.name.title} ${params.row.name.first} ${params.row.name.last}`;
      },
      renderCell: (params) => {
        if (!params?.row?.name || !params?.row?.login) return null;
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.name.title} {params.row.name.first}{" "}
              {params.row.name.last}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{params.row.login.username}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 250,
      sortable: false,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Chip
            label={params.value}
            size="small"
            color={getGenderColor(params.value)}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 200,
      sortable: false,
      valueGetter: (params) => {
        if (!params?.row?.location) return "";
        return `${params.row.location.city}, ${params.row.location.state}, ${params.row.location.country}`;
      },
      renderCell: (params) => {
        if (!params?.row?.location) return null;
        return (
          <Box>
            <Typography variant="body2">
              {params.row.location.city}, {params.row.location.state}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.location.country}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      sortable: false,
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      sortable: false,
      valueGetter: (params) => {
        if (!params?.row?.dob) return 0;
        return params.row.dob.age;
      },
    },
    {
      field: "registered",
      headerName: "Registered",
      width: 120,
      sortable: false,
      valueGetter: (params) => {
        if (!params?.row?.registered) return "";
        return params.row.registered.date;
      },
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Typography variant="body2">{formatDate(params.value)}</Typography>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit User">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete User">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteUser(params.row)}
        />,
      ],
    },
  ];

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Users ({total} total)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUsers} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </CardContent>

      <Box sx={{ flexGrow: 1, p: 2, pt: 0 }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={total}
          paginationMode="server"
          pageSizeOptions={[10, 20, 50, 100]}
          density="compact"
          disableColumnMenu
          disableRowSelectionOnClick
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "grey.50",
              borderColor: "divider",
            },
            "& .MuiDataGrid-row.even": {
              backgroundColor: "grey.50",
            },
          }}
        />
      </Box>

      <UserEditModal
        open={editModal.open}
        user={editModal.user}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </Card>
  );
}
