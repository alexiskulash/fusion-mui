import * as React from "react";
import { useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
  GridPaginationModel,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CustomerDialog from "./CustomerDialog";

interface Customer {
  id: string;
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  cell: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  picture: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  dob: {
    age: number;
  };
  registered: {
    date: string;
  };
  gender: string;
}

interface CustomersTableProps {
  searchTerm: string;
  refreshTrigger: number;
  onCustomerUpdate: () => void;
  onSearchChange: (term: string) => void;
}

const API_BASE_URL = "https://user-api.builder-io.workers.dev/api";

export default function CustomersTable({
  searchTerm,
  refreshTrigger,
  onCustomerUpdate,
  onSearchChange,
}: CustomersTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: (paginationModel.page + 1).toString(),
        perPage: paginationModel.pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`${API_BASE_URL}/users?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data = await response.json();
      setCustomers(data.data || []);
      setTotalRows(data.total || 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch customers",
      );
      setCustomers([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete customer: ${response.statusText}`);
      }

      // Refresh the table
      onCustomerUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete customer");
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleCustomerUpdated = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
    onCustomerUpdate();
  };

  // Contact actions
  const handleEmailCustomer = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const handleCallCustomer = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  useEffect(() => {
    fetchCustomers();
  }, [paginationModel, searchTerm, refreshTrigger]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getStatusColor = (age: number): "success" | "warning" | "info" => {
    if (age >= 50) return "success";
    if (age >= 30) return "info";
    return "warning";
  };

  const columns: GridColDef[] = [
    {
      field: "customer",
      headerName: "Customer",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={customer.picture?.thumbnail}
              sx={{ width: 32, height: 32 }}
            >
              {getInitials(customer.name.first, customer.name.last)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {customer.name.title} {customer.name.first} {customer.name.last}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              @{customer.login.username}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography variant="body2">
              {customer.location.city}, {customer.location.state}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "age",
      headerName: "Age",
      flex: 0.3,
      minWidth: 80,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <Chip
            label={customer.dob.age}
            size="small"
            color={getStatusColor(customer.dob.age)}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "registered",
      headerName: "Joined Date",
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => {
        const customer = params.row as Customer;
        return (
          <Typography variant="body2">
            {formatDate(customer.registered.date)}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 150,
      getActions: (params: GridRowParams) => {
        const customer = params.row as Customer;
        return [
          <GridActionsCellItem
            icon={<EmailRoundedIcon />}
            label="Email"
            onClick={() => handleEmailCustomer(customer.email)}
          />,
          <GridActionsCellItem
            icon={<PhoneRoundedIcon />}
            label="Call"
            onClick={() => handleCallCustomer(customer.phone)}
          />,
          <GridActionsCellItem
            icon={<EditRoundedIcon />}
            label="Edit"
            onClick={() => handleEditCustomer(customer)}
          />,
          <GridActionsCellItem
            icon={<DeleteRoundedIcon />}
            label="Delete"
            onClick={() => handleDeleteCustomer(customer.login.uuid)}
          />,
        ];
      },
    },
  ];

  if (error) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: 600,
          width: "100%",
          maxWidth: "none",
        }}
      >
        <CardContent sx={{ p: 0, height: "100%", width: "100%" }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h6" component="h3">
                Customer Directory
              </Typography>
              <TextField
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
            </Stack>
          </Box>
          <Box sx={{ height: "calc(100% - 60px)", width: "100%" }}>
            <DataGrid
              rows={customers}
              columns={columns}
              getRowId={(row) => row.login.uuid}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              paginationMode="server"
              rowCount={totalRows}
              loading={loading}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                width: "100%",
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "action.hover",
                },
                "& .MuiDataGrid-main": {
                  width: "100%",
                },
                "& .MuiDataGrid-root": {
                  width: "100%",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <CustomerDialog
          open={isEditDialogOpen}
          onClose={handleEditDialogClose}
          onSave={handleCustomerUpdated}
          mode="edit"
          customer={editingCustomer}
        />
      )}
    </>
  );
}
