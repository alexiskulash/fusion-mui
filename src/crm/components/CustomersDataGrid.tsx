import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridToolbar,
  GridRowId,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { User } from "../services/customersApi";

interface CustomersDataGridProps {
  customers: User[];
  loading: boolean;
  onEditCustomer: (customer: User) => void;
  onDeleteCustomer: (customerId: string) => void;
  onRefresh: () => void;
}

export default function CustomersDataGrid({
  customers,
  loading,
  onEditCustomer,
  onDeleteCustomer,
  onRefresh,
}: CustomersDataGridProps) {
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Avatar
          src={params.row.picture?.thumbnail}
          sx={{ width: 40, height: 40 }}
        >
          {params.row.name.first?.[0]}{params.row.name.last?.[0]}
        </Avatar>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
      valueGetter: (value, row) => `${row.name.first} ${row.name.last}`,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.name.title} {params.row.name.first} {params.row.name.last}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{params.row.login.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 200,
      valueGetter: (value, row) => `${row.location.city}, ${row.location.country}`,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <LocationOnIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2">
              {params.row.location.city}, {params.row.location.state}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.location.country}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      type: "number",
      valueGetter: (value, row) => row.dob.age,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "male" ? "primary" : params.value === "female" ? "secondary" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "registered",
      headerName: "Member Since",
      width: 150,
      valueGetter: (value, row) => new Date(row.registered.date).toLocaleDateString(),
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {new Date(params.row.registered.date).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.registered.age} years ago
          </Typography>
        </Box>
      ),
    },
    {
      field: "nationality",
      headerName: "Nationality",
      width: 120,
      valueGetter: (value, row) => row.nat,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="filled"
          sx={{ minWidth: 50 }}
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit Customer">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => onEditCustomer(params.row as User)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={
            <Tooltip title="Delete Customer">
              <DeleteIcon />
            </Tooltip>
          }
          label="Delete"
          onClick={() => onDeleteCustomer(params.row.login.uuid)}
          sx={{ color: "error.main" }}
        />,
      ],
    },
  ];

  const rows = customers.map((customer) => ({
    id: customer.login.uuid,
    ...customer,
  }));

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{
          toolbar: () => (
            <Box sx={{ p: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="h6">
                  Customers ({customers.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Stack>
              <GridToolbar />
            </Box>
          ),
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          filter: {
            filterModel: {
              items: [],
              quickFilterValues: [],
            },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        density="comfortable"
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        sx={{
          "& .even": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          },
          "& .odd": {
            backgroundColor: "white",
          },
          "& .MuiDataGrid-cell": {
            borderRight: "1px solid rgba(224, 224, 224, 1)",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            fontSize: "0.875rem",
            fontWeight: 600,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
          },
        }}
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
  );
}
