import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, type GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

// Types for the Users API response
interface ApiUser {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    title?: string;
    first: string;
    last: string;
  };
  email: string;
  gender?: string;
  location?: {
    street?: { number?: number; name?: string };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string | number;
  };
  dob?: { date?: string; age?: number };
  registered?: { date?: string; age?: number };
  phone?: string;
  cell?: string;
  picture?: { large?: string; medium?: string; thumbnail?: string };
  nat?: string;
}

interface ApiResponse {
  page: number;
  perPage: number;
  total: number;
  span?: string;
  effectivePage?: number;
  data: ApiUser[];
}

// Row model for the DataGrid
interface CustomerRow {
  id: string; // stable id for DataGrid
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  country?: string;
  age?: number;
  registeredDate?: string;
  phone?: string;
  avatar?: string;
  raw: ApiUser;
}

function buildUsersApiUrl(params: {
  page: number; // 1-based for API
  perPage: number;
  search?: string;
  sortBy?: string;
}) {
  const url = new URL("https://user-api.builder-io.workers.dev/api/users");
  url.searchParams.set("page", String(params.page));
  url.searchParams.set("perPage", String(params.perPage));
  if (params.search) url.searchParams.set("search", params.search);
  if (params.sortBy) url.searchParams.set("sortBy", params.sortBy);
  return url.toString();
}

// Map DataGrid columns to API sort fields
const sortFieldMap: Record<string, string> = {
  firstName: "name.first",
  lastName: "name.last",
  city: "location.city",
  country: "location.country",
  age: "dob.age",
  registeredDate: "registered.date",
  email: "email",
  username: "login.username",
};

export default function Customers() {
  const [rows, setRows] = React.useState<CustomerRow[]>([]);
  const [rowCount, setRowCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([{ field: "firstName", sort: "asc" as const }]);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<ApiUser | null>(null);
  const [editFirst, setEditFirst] = React.useState("");
  const [editLast, setEditLast] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editCity, setEditCity] = React.useState("");
  const [editCountry, setEditCountry] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>(
    { open: false, message: "", severity: "success" }
  );

  // Debounce search
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  // Fetch data on params change
  React.useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const pageForApi = paginationModel.page + 1; // API is 1-based
        const activeSort = sortModel[0];
        const sortBy = activeSort ? sortFieldMap[activeSort.field] : undefined;
        const url = buildUsersApiUrl({
          page: pageForApi,
          perPage: paginationModel.pageSize,
          search: debouncedSearch || undefined,
          sortBy,
        });
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json: ApiResponse = await res.json();
        const nextRows: CustomerRow[] = json.data.map((u) => ({
          id: u.login?.uuid || u.login?.username || u.email,
          username: u.login?.username || "",
          name: `${u.name?.first ?? ""} ${u.name?.last ?? ""}`.trim(),
          firstName: u.name?.first ?? "",
          lastName: u.name?.last ?? "",
          email: u.email,
          city: u.location?.city,
          country: u.location?.country,
          age: u.dob?.age,
          registeredDate: u.registered?.date,
          phone: u.phone,
          avatar: u.picture?.thumbnail,
          raw: u,
        }));
        setRows(nextRows);
        setRowCount(json.total);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Failed to load users", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, sortModel]);

  const handleEdit = (user: ApiUser) => {
    setEditUser(user);
    setEditFirst(user.name?.first ?? "");
    setEditLast(user.name?.last ?? "");
    setEditEmail(user.email ?? "");
    setEditCity(user.location?.city ?? "");
    setEditCountry(user.location?.country ?? "");
    setEditPhone(user.phone ?? "");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    const id = editUser.login?.username || editUser.login?.uuid || editUser.email;
    try {
      const body: Record<string, unknown> = {};
      if (editFirst !== (editUser.name?.first ?? "")) body.name = { ...(body.name as object), first: editFirst };
      if (editLast !== (editUser.name?.last ?? "")) body.name = { ...(body.name as object), ...(body.name || {}), last: editLast };
      if (editEmail !== (editUser.email ?? "")) body.email = editEmail;
      if (editCity !== (editUser.location?.city ?? "")) body.location = { ...(body.location as object), city: editCity };
      if (editCountry !== (editUser.location?.country ?? "")) body.location = { ...(body.location as object), ...(body.location || {}), country: editCountry };
      if (editPhone !== (editUser.phone ?? "")) body.phone = editPhone;

      const res = await fetch(`https://user-api.builder-io.workers.dev/api/users/${encodeURIComponent(String(id))}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      setSnackbar({ open: true, message: "User updated successfully", severity: "success" });
      setEditOpen(false);
      setEditUser(null);

      // Refresh current page
      setPaginationModel((m) => ({ ...m }));
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Failed to update user", severity: "error" });
    }
  };

  const columns = React.useMemo<GridColDef<CustomerRow>[]>(
    () => [
      {
        field: "avatar",
        headerName: "",
        width: 56,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<string, CustomerRow>) => (
          <Avatar alt={params.row.name} src={params.value || undefined} sx={{ width: 32, height: 32 }} />
        ),
      },
      { field: "firstName", headerName: "First name", flex: 1, minWidth: 120 },
      { field: "lastName", headerName: "Last name", flex: 1, minWidth: 120 },
      { field: "email", headerName: "Email", flex: 1.4, minWidth: 200 },
      { field: "city", headerName: "City", flex: 1, minWidth: 120 },
      { field: "country", headerName: "Country", flex: 1, minWidth: 140 },
      { field: "age", headerName: "Age", width: 90, type: "number" },
      { field: "registeredDate", headerName: "Registered", flex: 1, minWidth: 180, valueGetter: (p) => p.value ? new Date(p.value as string).toLocaleDateString() : "" },
      {
        field: "actions",
        headerName: "Actions",
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(params.row.raw)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ], []);

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Customers
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2, width: "100%" }}>
        <TextField
          label="Search users"
          placeholder="Search by name, email, or city"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPaginationModel((m) => ({ ...m, page: 0 }));
          }}
          fullWidth
          size="small"
        />
      </Stack>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={(m) => setSortModel(m.length ? m : [{ field: "firstName", sort: "asc" }])}
          disableRowSelectionOnClick
          sx={{ border: 1, borderColor: "divider" }}
        />
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="First name" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} fullWidth />
              <TextField label="Last name" value={editLast} onChange={(e) => setEditLast(e.target.value)} fullWidth />
            </Stack>
            <TextField label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="City" value={editCity} onChange={(e) => setEditCity(e.target.value)} fullWidth />
              <TextField label="Country" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} fullWidth />
            </Stack>
            <TextField label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
