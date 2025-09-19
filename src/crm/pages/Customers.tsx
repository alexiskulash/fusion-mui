import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CrmSearch from "../components/CrmSearch";
import CrmCustomersTable from "../components/CrmCustomersTable";
import CrmEditUserDialog, { type ApiUser } from "../components/CrmEditUserDialog";

const API_BASE = "https://user-api.builder-io.workers.dev/api";

export default function Customers() {
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0); // 0-indexed for UI, API is 1-indexed
  const [perPage, setPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [editUser, setEditUser] = React.useState<ApiUser | null>(null);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("perPage", String(perPage));
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("sortBy", "name.first");
      const res = await fetch(`${API_BASE}/users?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
      const data = await res.json();
      setUsers(Array.isArray(data?.data) ? data.data : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
    } catch (e) {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getKey = (u: ApiUser | null) => u?.login?.uuid || u?.login?.username || u?.email || "";
  const handleSaved = (updated: ApiUser) => {
    setUsers((prev) => prev.map((u) => (getKey(u) === getKey(updated)
      ? { ...u, ...updated, name: { ...u.name, ...updated.name }, location: { ...u.location, ...updated.location } }
      : u
    )));
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">Customers</Typography>
        <CrmSearch value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search users" />
      </Stack>

      <CrmCustomersTable
        users={users}
        total={total}
        page={page}
        perPage={perPage}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(pp) => { setPerPage(pp); setPage(0); }}
        onEdit={(u) => setEditUser(u)}
      />

      <CrmEditUserDialog open={Boolean(editUser)} user={editUser} onClose={() => setEditUser(null)} onSaved={handleSaved} />
    </Box>
  );
}
