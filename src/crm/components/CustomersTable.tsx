import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid2";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

// Types derived from Users API documentation
interface ApiUser {
  login: {
    uuid: string;
    username: string;
    password?: string;
  };
  name: {
    title?: string;
    first: string;
    last: string;
  };
  gender?: string;
  location?: {
    street?: { number?: number; name?: string };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string | number;
  };
  email: string;
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
  span: string;
  effectivePage: number;
  data: ApiUser[];
}

interface EditFormState {
  email: string;
  first: string;
  last: string;
  city: string;
  country: string;
}

const API_BASE = "https://user-api.builder-io.workers.dev/api";

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function CustomersTable() {
  const [rows, setRows] = React.useState<ApiUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [genderFilter, setGenderFilter] = React.useState<string>("all");
  const [countryFilter, setCountryFilter] = React.useState<string>("all");

  const [editOpen, setEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<ApiUser | null>(null);
  const [editForm, setEditForm] = React.useState<EditFormState | null>(null);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/users`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("perPage", String(perPage));
      if (search.trim()) url.searchParams.set("search", search.trim());
      if (sortBy) url.searchParams.set("sortBy", sortBy);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const json = (await res.json()) as ApiResponse;
      setRows(json.data);
      setTotal(json.total);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortBy]);

  React.useEffect(() => {
    load();
  }, [load]);

  const countries = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((u) => {
      const c = u.location?.country?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    return rows.filter((u) => {
      const genderOk = genderFilter === "all" || (u.gender || "").toLowerCase() === genderFilter;
      const countryOk = countryFilter === "all" || (u.location?.country || "") === countryFilter;
      return genderOk && countryOk;
    });
  }, [rows, genderFilter, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  function handleOpenEdit(user: ApiUser) {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      first: user.name?.first || "",
      last: user.name?.last || "",
      city: user.location?.city || "",
      country: user.location?.country || "",
    });
    setEditOpen(true);
  }

  function handleCloseEdit() {
    setEditOpen(false);
    setEditingUser(null);
    setEditForm(null);
  }

  async function handleSaveEdit() {
    if (!editingUser || !editForm) return;
    setSaving(true);
    try {
      const id = editingUser.login?.uuid || editingUser.login?.username || editingUser.email;
      const payload: any = {};
      if (editForm.first !== editingUser.name?.first || editForm.last !== editingUser.name?.last) {
        payload.name = { ...(editingUser.name || {}), first: editForm.first, last: editForm.last };
      }
      if (editForm.email !== editingUser.email) {
        payload.email = editForm.email;
      }
      if (
        editForm.city !== (editingUser.location?.city || "") ||
        editForm.country !== (editingUser.location?.country || "")
      ) {
        payload.location = {
          ...(editingUser.location || {}),
          city: editForm.city,
          country: editForm.country,
        };
      }

      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to update user (${res.status})`);

      // Optimistically update local state
      setRows((prev) =>
        prev.map((u) =>
          (u.login?.uuid || u.login?.username || u.email) === id
            ? {
                ...u,
                email: editForm.email,
                name: { ...(u.name || {}), first: editForm.first, last: editForm.last },
                location: { ...(u.location || {}), city: editForm.city, country: editForm.country },
              }
            : u,
        ),
      );
      handleCloseEdit();
    } catch (e) {
      // Keep error unobtrusive but visible
      alert((e as Error).message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Customers</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              label="Search"
              placeholder="Name, email, city..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="sort-by-label">Sort by</InputLabel>
              <Select
                labelId="sort-by-label"
                label="Sort by"
                value={sortBy}
                onChange={(e) => {
                  setPage(1);
                  setSortBy(String(e.target.value));
                }}
              >
                <MenuItem value="name.first">First name</MenuItem>
                <MenuItem value="name.last">Last name</MenuItem>
                <MenuItem value="location.city">City</MenuItem>
                <MenuItem value="location.country">Country</MenuItem>
                <MenuItem value="dob.age">Age</MenuItem>
                <MenuItem value="registered.date">Registered date</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="gender-filter-label">Gender</InputLabel>
              <Select
                labelId="gender-filter-label"
                label="Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(String(e.target.value))}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="country-filter-label">Country</InputLabel>
              <Select
                labelId="country-filter-label"
                label="Country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(String(e.target.value))}
              >
                <MenuItem value="all">All</MenuItem>
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="per-page-label">Per page</InputLabel>
              <Select
                labelId="per-page-label"
                label="Per page"
                value={perPage}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setPerPage(v);
                  setPage(1);
                }}
              >
                {[10, 20, 50].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </CardContent>
      <TableContainer>
        <Table size="small" aria-label="customers table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading users…</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No results</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((u) => {
                const id = u.login?.uuid || u.login?.username || u.email;
                const fullName = `${u.name?.first || ""} ${u.name?.last || ""}`.trim();
                const locParts = [u.location?.city, u.location?.country].filter(Boolean);
                const location = locParts.join(", ");
                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar src={u.picture?.thumbnail} sx={{ width: 28, height: 28 }}>
                          {(u.name?.first?.[0] || "").toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {fullName || u.login?.username || "Unnamed"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{location}</TableCell>
                    <TableCell align="right">{u.dob?.age ?? "-"}</TableCell>
                    <TableCell>{formatDate(u.registered?.date)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="Edit user" onClick={() => handleOpenEdit(u)}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Page {page} of {totalPages} • {total.toLocaleString()} total
        </Typography>
        <Pagination
          color="primary"
          shape="rounded"
          page={page}
          onChange={(_e, p) => setPage(p)}
          count={totalPages}
          siblingCount={0}
          boundaryCount={1}
        />
      </Box>

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {editForm && (
            <Box component="form" autoComplete="off" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First name"
                    value={editForm.first}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), first: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last name"
                    value={editForm.last}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), last: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), email: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), city: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...(editForm as EditFormState), country: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
