import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { User } from '../hooks/useUsers';

interface UserEditModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export default function UserEditModal({ open, user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = React.useState<Partial<User>>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({});
    }
    setError(null);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);

    try {
      const result = await onSave(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...((prev as any)?.[keys[0]] || {}),
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...((prev as any)?.[keys[0]] || {}),
            [keys[1]]: {
              ...((prev as any)?.[keys[0]]?.[keys[1]] || {}),
              [keys[2]]: value,
            },
          },
        };
      }
      return prev;
    });
  };

  const getFieldValue = (field: string) => {
    const keys = field.split('.');
    let value: any = formData;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || '';
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Edit User
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.main" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Personal Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={getFieldValue('name.first')}
              onChange={(e) => handleFieldChange('name.first', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={getFieldValue('name.last')}
              onChange={(e) => handleFieldChange('name.last', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Title</InputLabel>
              <Select
                value={getFieldValue('name.title')}
                onChange={(e) => handleFieldChange('name.title', e.target.value)}
                label="Title"
              >
                <MenuItem value="Mr">Mr</MenuItem>
                <MenuItem value="Mrs">Mrs</MenuItem>
                <MenuItem value="Ms">Ms</MenuItem>
                <MenuItem value="Dr">Dr</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={getFieldValue('gender')}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Contact Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={getFieldValue('email')}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={getFieldValue('phone')}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cell Phone"
              value={getFieldValue('cell')}
              onChange={(e) => handleFieldChange('cell', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Location Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, fontWeight: 600 }}>
              Location
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Number"
              type="number"
              value={getFieldValue('location.street.number')}
              onChange={(e) => handleFieldChange('location.street.number', parseInt(e.target.value) || '')}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Street Name"
              value={getFieldValue('location.street.name')}
              onChange={(e) => handleFieldChange('location.street.name', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={getFieldValue('location.city')}
              onChange={(e) => handleFieldChange('location.city', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={getFieldValue('location.state')}
              onChange={(e) => handleFieldChange('location.state', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={getFieldValue('location.country')}
              onChange={(e) => handleFieldChange('location.country', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postal Code"
              value={getFieldValue('location.postcode')}
              onChange={(e) => handleFieldChange('location.postcode', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
