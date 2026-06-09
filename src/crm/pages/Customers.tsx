import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const USERS_API = "https://user-api.builder-io.workers.dev/api/users";

const SORT_OPTIONS = [
  { label: "First Name", value: "name.first" },
  { label: "Last Name", value: "name.last" },
  { label: "City", value: "location.city" },
  { label: "Country", value: "location.country" },
  { label: "Age", value: "dob.age" },
  { label: "Registration Date", value: "registered.date" },
];

interface ApiUser {
  login: { uuid: string; username: string };
  name: { title: string; first: string; last: string };
  email: string;
  location: { city: string; country: string };
  dob: { age: number };
  registered: { age: number };
  picture: { thumbnail: string };
  cell: string;
}

function getUserInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function deriveAccountStatus(user: ApiUser): "Active" | "Suspended" {
  const lastChar = user.login.uuid.charCodeAt(user.login.uuid.length - 1);
  return lastChar % 7 === 0 ? "Suspended" : "Active";
}

export default function Customers() {
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page + 1),
          perPage: String(rowsPerPage),
          sortBy,
        });
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`${USERS_API}?${params}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setUsers(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    return () => controller.abort();
  }, [page, rowsPerPage, sortBy, debouncedSearch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? users.map((u) => u.login.uuid) : []);
  };

  const handleSelectRow = (uuid: string) => {
    setSelected((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0 && selected.length < users.length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{ py: 2, mb: 1, fontWeight: 400, letterSpacing: "0.25px", fontFamily: "K2D, sans-serif" }}
      >
        User management
      </Typography>

      <Paper elevation={1}>
        {/* Toolbar */}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ p: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={2}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 400 } }}
          >
            <TextField
              label="Search"
              placeholder="Name, email, etc..."
              variant="outlined"
              size="medium"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl
              variant="outlined"
              size="medium"
              sx={{ flex: 1, minWidth: 200 }}
            >
              <InputLabel id="attribute-label">Attribute</InputLabel>
              <Select
                labelId="attribute-label"
                value={sortBy}
                label="Attribute"
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton aria-label="filter users">
              <FilterAltIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" gap={2}>
            <Button variant="outlined" color="inherit" disabled={selected.length === 0}>
              ACTION
            </Button>
            <Button variant="contained" color="primary">
              NEW
            </Button>
            <IconButton aria-label="table settings">
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: "4px" }}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Checkbox
                      color="primary"
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={handleSelectAll}
                      inputProps={{ "aria-label": "select all users" }}
                    />
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontWeight: 500, letterSpacing: "0.17px" }}
                    >
                      User
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Account status</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ID</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isSelected = selected.includes(user.login.uuid);
                  const status = deriveAccountStatus(user);
                  const fullName = `${user.name.first} ${user.name.last}`;
                  const initials = getUserInitials(user.name.first, user.name.last);

                  return (
                    <TableRow key={user.login.uuid} selected={isSelected} hover>
                      <TableCell sx={{ pl: "4px" }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.login.uuid)}
                            inputProps={{ "aria-label": `select ${fullName}` }}
                          />
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "grey.400",
                              fontSize: "1.25rem",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fullName}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <LocationOnIcon
                            sx={{ color: "action.active", fontSize: 24, flexShrink: 0 }}
                          />
                          <Typography variant="body2">{user.location.city}</Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={status}
                          color={status === "Suspended" ? "warning" : "default"}
                          size="medium"
                          variant="filled"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            color: "text.secondary",
                          }}
                        >
                          {user.login.uuid}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
