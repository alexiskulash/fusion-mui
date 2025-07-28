import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Typography,
  MenuItem,
} from "@mui/material";
import { User, CustomersApi } from "../services/customersApi";

interface CustomerEditModalProps {
  open: boolean;
  onClose: () => void;
  customer: User | null;
  onCustomerUpdated: () => void;
}

const titles = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"];
const genders = ["male", "female", "other"];

export default function CustomerEditModal({
  open,
  onClose,
  customer,
  onCustomerUpdated,
}: CustomerEditModalProps) {
  const [formData, setFormData] = React.useState<Partial<User>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({});
    }
    setError(null);
    setSuccess(false);
  }, [customer, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }
      
      // Handle nested fields like name.first, location.city
      const result = { ...prev };
      let current: any = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return result;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setLoading(true);
    setError(null);

    try {
      await CustomersApi.updateCustomer(customer.login.uuid, formData);
      setSuccess(true);
      onCustomerUpdated();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = (field: string) => {
    const keys = field.split('.');
    let value: any = formData;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || '';
  };

  const getFullName = () => {
    const first = getFieldValue('name.first');
    const last = getFieldValue('name.last');
    return `${first} ${last}`.trim();
  };

  if (!customer) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={customer.picture?.medium}
            sx={{ width: 56, height: 56 }}
          >
            {customer.name.first?.[0]}{customer.name.last?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">Edit Customer</Typography>
            <Typography variant="body2" color="text.secondary">
              {getFullName() || 'Customer Details'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Customer updated successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Title"
                value={getFieldValue('name.title')}
                onChange={(e) => handleInputChange('name.title', e.target.value)}
                size="small"
              >
                {titles.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                value={getFieldValue('name.first')}
                onChange={(e) => handleInputChange('name.first', e.target.value)}
                required
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                value={getFieldValue('name.last')}
                onChange={(e) => handleInputChange('name.last', e.target.value)}
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={getFieldValue('email')}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={getFieldValue('gender')}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                size="small"
              >
                {genders.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={getFieldValue('phone')}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell Phone"
                value={getFieldValue('cell')}
                onChange={(e) => handleInputChange('cell', e.target.value)}
                size="small"
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Street Number"
                type="number"
                value={getFieldValue('location.street.number')}
                onChange={(e) => handleInputChange('location.street.number', parseInt(e.target.value) || 0)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Street Name"
                value={getFieldValue('location.street.name')}
                onChange={(e) => handleInputChange('location.street.name', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={getFieldValue('location.city')}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                value={getFieldValue('location.state')}
                onChange={(e) => handleInputChange('location.state', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Postal Code"
                value={getFieldValue('location.postcode')}
                onChange={(e) => handleInputChange('location.postcode', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Country"
                value={getFieldValue('location.country')}
                onChange={(e) => handleInputChange('location.country', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Updating...' : 'Update Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
