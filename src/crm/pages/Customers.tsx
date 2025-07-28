import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { CustomersApi, User, CustomerFilters } from "../services/customersApi";
import CustomersDataGrid from "../components/CustomersDataGrid";
import CustomerEditModal from "../components/CustomerEditModal";

// Stats card component
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

function StatsCard({ title, value, change, changeType = "neutral" }: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive": return "success.main";
      case "negative": return "error.main";
      default: return "text.secondary";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        {change && (
          <Typography variant="body2" sx={{ color: getChangeColor(), mt: 1 }}>
            {change}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Customers() {
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [customerToDelete, setCustomerToDelete] = React.useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  // Pagination and filters state
  const [totalCustomers, setTotalCustomers] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState<CustomerFilters>({
    page: 1,
    perPage: 50,
    search: "",
  });

  const fetchCustomers = React.useCallback(async (newFilters?: CustomerFilters) => {
    setLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters;
      const response = await CustomersApi.getCustomers(filtersToUse);
      setCustomers(response.data);
      setTotalCustomers(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = React.useCallback((term: string) => {
    const newFilters = { ...filters, search: term, page: 1 };
    setFilters(newFilters);
    fetchCustomers(newFilters);
  }, [filters, fetchCustomers]);

  // Debounced search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        handleSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);



  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await CustomersApi.deleteCustomer(customerToDelete);
      setSnackbar({
        open: true,
        message: "Customer deleted successfully",
        severity: "success",
      });
      fetchCustomers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : "Failed to delete customer",
        severity: "error",
      });
    }

    setDeleteConfirmOpen(false);
    setCustomerToDelete(null);
  };

  const handleCustomerUpdated = () => {
    fetchCustomers();
    setSnackbar({
      open: true,
      message: "Customer updated successfully",
      severity: "success",
    });
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const exportCustomers = () => {
    const csvContent = [
      "Name,Email,Phone,City,Country,Age,Gender,Registered",
      ...customers.map(customer => 
        `"${customer.name.first} ${customer.name.last}","${customer.email}","${customer.phone}","${customer.location.city}","${customer.location.country}","${customer.dob.age}","${customer.gender}","${new Date(customer.registered.date).toLocaleDateString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalCount = totalCustomers;
    const avgAge = customers.length > 0 
      ? Math.round(customers.reduce((sum, c) => sum + c.dob.age, 0) / customers.length)
      : 0;
    
    const genderDistribution = customers.reduce((acc, customer) => {
      acc[customer.gender] = (acc[customer.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countries = new Set(customers.map(c => c.location.country)).size;

    return {
      total: totalCount.toLocaleString(),
      averageAge: `${avgAge} years`,
      countries: `${countries} countries`,
      maleCount: genderDistribution.male || 0,
      femaleCount: genderDistribution.female || 0,
    };
  }, [customers, totalCustomers]);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database with search, filter, and edit capabilities
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportCustomers}
            disabled={customers.length === 0}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Customers"
            value={stats.total}
            change="+12% from last month"
            changeType="positive"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Average Age"
            value={stats.averageAge}
            change="2 years younger"
            changeType="neutral"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Global Reach"
            value={stats.countries}
            change="5 new countries"
            changeType="positive"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Gender Distribution"
            value={`${Math.round((stats.maleCount / customers.length) * 100 || 0)}% M`}
            change={`${Math.round((stats.femaleCount / customers.length) * 100 || 0)}% F`}
            changeType="neutral"
          />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search customers by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
              size="small"
            />
            {searchTerm && (
              <Chip
                label={`${customers.length} results`}
                color="primary"
                variant="outlined"
              />
            )}
            {loading && <CircularProgress size={24} />}
          </Stack>
        </CardContent>
      </Card>

      {/* Customers Data Grid */}
      <Card>
        <CustomersDataGrid
          customers={customers}
          loading={loading}
          onEditCustomer={handleEditCustomer}
          onDeleteCustomer={handleDeleteCustomer}
          onRefresh={handleRefresh}
        />
      </Card>

      {/* Edit Customer Modal */}
      <CustomerEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
