import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbar,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { User } from "../services/usersApi";

interface UserDataGridProps {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearch: (search: string) => void;
  onSortChange: (sortBy: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onRefresh: () => void;
  pageSize: number;
}

export default function UserDataGrid({
  users,
  loading,
  error,
  totalUsers,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSortChange,
  onEditUser,
  onDeleteUser,
  onRefresh,
  pageSize,
}: UserDataGridProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onSortChange(newSort);
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
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
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.name.title} {params.row.name.first}{" "}
            {params.row.name.last}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.login.username}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      renderCell: (params) => (
        <Typography variant="body2">{params.value}</Typography>
      ),
    },
    {
      field: "location",
      headerName: "Location",
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            {params.row.location.city}, {params.row.location.state}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.location.country}
          </Typography>
        </Box>
      ),
    },
    {
      field: "age",
      headerName: "Age",
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.dob.age}</Typography>
      ),
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            Cell: {params.row.cell}
          </Typography>
        </Box>
      ),
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
      field: "registeredDate",
      headerName: "Registered",
      width: 120,
      renderCell: (params) => {
        const date = new Date(params.row.registered.date);
        return (
          <Typography variant="body2">{date.toLocaleDateString()}</Typography>
        );
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEditUser(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => onDeleteUser(params.row)}
          color="error"
        />,
      ],
    },
  ];

  const rows = users.map((user) => ({
    id: user.login.uuid,
    ...user,
  }));

  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Customer Database ({totalUsers} users)
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ flexGrow: 1 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search users by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchTerm("");
                        onSearch("");
                      }}
                    >
                      ×
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit(e);
                }
              }}
            />
          </Box>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <MenuItem value="name.first">First Name</MenuItem>
              <MenuItem value="name.last">Last Name</MenuItem>
              <MenuItem value="location.city">City</MenuItem>
              <MenuItem value="location.country">Country</MenuItem>
              <MenuItem value="dob.age">Age</MenuItem>
              <MenuItem value="registered.date">Registration Date</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </CardContent>

      <Box sx={{ flexGrow: 1, p: 2, pt: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={totalUsers}
          page={currentPage - 1}
          pageSize={pageSize}
          onPageChange={(newPage) => onPageChange(newPage + 1)}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          density="comfortable"
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell": {
              borderColor: "divider",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "background.paper",
              borderColor: "divider",
            },
            "& .MuiDataGrid-footerContainer": {
              borderColor: "divider",
            },
          }}
        />
      </Box>
    </Card>
  );
}
