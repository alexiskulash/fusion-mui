import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridPaginationModel,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Phone, Email } from "@mui/icons-material";
import { User, UserService, UsersApiResponse } from "../services/userService";

interface UsersDataGridProps {
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  searchQuery: string;
}

export default function UsersDataGrid({
  onEditUser,
  onDeleteUser,
  searchQuery,
}: UsersDataGridProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [totalRows, setTotalRows] = React.useState(0);
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      page: 0,
      pageSize: 25,
    });

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const response: UsersApiResponse = await UserService.getUsers({
        page: paginationModel.page + 1,
        perPage: paginationModel.pageSize,
        search: searchQuery || undefined,
        sortBy: "name.first",
      });
      setUsers(response.data);
      setTotalRows(response.total);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeleteUser = async (user: User) => {
    try {
      await UserService.deleteUser(user.login.uuid);
      loadUsers();
      onDeleteUser(user);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "picture",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture?.thumbnail}
          alt={`${params.row.name?.first} ${params.row.name?.last}`}
          sx={{ width: 32, height: 32 }}
        >
          {params.row.name?.first?.charAt(0)}
          {params.row.name?.last?.charAt(0)}
        </Avatar>
      ),
    },
    {
      field: "fullName",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) =>
        `${row.name?.first || ""} ${row.name?.last || ""}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.row.name?.title} {params.row.name?.first}{" "}
            {params.row.name?.last}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.login?.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Email fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) =>
        `${row.location?.city || ""}, ${row.location?.country || ""}`,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.location?.city}, {params.row.location?.country}
        </Typography>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 140,
      renderCell: (params) => (
        <Tooltip title={params.row.cell || "No mobile number"}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        </Tooltip>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      valueGetter: (value, row) => row.dob?.age || "",
      headerAlign: "center",
      align: "center",
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
      width: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Edit user">
            <IconButton
              size="small"
              onClick={() => onEditUser(params.row)}
              sx={{ color: "primary.main" }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user">
            <IconButton
              size="small"
              onClick={() => handleDeleteUser(params.row)}
              sx={{ color: "error.main" }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows: GridRowsProp = users.map((user) => ({
    id: user.login.uuid,
    ...user,
  }));

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      rowCount={totalRows}
      pageSizeOptions={[10, 25, 50, 100]}
      disableColumnResize
      density="comfortable"
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
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
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "action.hover",
        },
      }}
    />
  );
}
