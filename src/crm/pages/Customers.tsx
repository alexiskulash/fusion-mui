import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

const API_BASE = "https://user-api.builder-io.workers.dev/api";

interface User {
  login: { uuid: string; username: string };
  name: { title: string; first: string; last: string };
  email: string;
  location: { city: string; country: string };
  dob: { age: number };
  registered: { age: number };
  picture: { thumbnail: string };
}

const SORT_OPTIONS = [
  { label: "First Name", value: "name.first" },
  { label: "Last Name", value: "name.last" },
  { label: "City", value: "location.city" },
  { label: "Country", value: "location.country" },
  { label: "Age", value: "dob.age" },
  { label: "Registered Date", value: "registered.date" },
];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function getAccountStatus(user: User): "Active" | "Suspended" {
  return user.registered.age <= 1 ? "Suspended" : "Active";
}

export default function Customers() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name.first");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = React.useCallback(
    async (currentPage: number, perPage: number, searchVal: string, sort: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage + 1),
          perPage: String(perPage),
          sortBy: sort,
        });
        if (searchVal) params.set("search", searchVal);
        const res = await fetch(`${API_BASE}/users?${params}`);
        const data = await res.json();
        setUsers(data.data ?? []);
        setTotal(data.total ?? 0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchUsers(page, rowsPerPage, search, sortBy);
  }, [page, rowsPerPage, sortBy, fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    setPage(0);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(0, rowsPerPage, val, sortBy);
    }, 400);
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? users.map((u) => u.login.uuid) : []);
  };

  const handleSelectRow = (uuid: string) => {
    setSelected((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    );
  };

  const allSelected = users.length > 0 && selected.length === users.length;
  const someSelected = selected.length > 0 && selected.length < users.length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Box sx={{ py: 2, mb: 1 }}>
        <Typography variant="h4" component="h1">
          User management
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 1 }}>
        {/* Toolbar */}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ p: 2 }}
        >
          <Stack direction="row" alignItems="center" gap={2} sx={{ flex: 1, minWidth: 400 }}>
            <TextField
              label="Search"
              variant="outlined"
              size="medium"
              placeholder="Name, email, etc..."
              value={search}
              onChange={handleSearchChange}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl variant="outlined" size="medium" sx={{ flex: 1, minWidth: 200 }}>
              <InputLabel id="attribute-sort-label">Attribute</InputLabel>
              <Select
                labelId="attribute-sort-label"
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
            <IconButton aria-label="filter">
              <FilterAltRoundedIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 242 }}>
            <Button variant="outlined" color="inherit">
              Action
            </Button>
            <Button variant="contained" color="primary">
              New
            </Button>
            <IconButton aria-label="settings">
              <SettingsRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ pl: "4px" }}>
                  <Checkbox
                    color="primary"
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: 500, ml: 1 }}
                  >
                    User
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Account status</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const uuid = user.login.uuid;
                  const isSelected = selected.includes(uuid);
                  const status = getAccountStatus(user);
                  return (
                    <TableRow
                      key={uuid}
                      hover
                      selected={isSelected}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleSelectRow(uuid)}
                    >
                      <TableCell padding="checkbox" sx={{ pl: "4px" }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleSelectRow(uuid)}
                          />
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "grey.400",
                              fontSize: "1.1rem",
                            }}
                          >
                            {getInitials(user.name.first, user.name.last)}
                          </Avatar>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                          >
                            {user.name.first} {user.name.last}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <LocationOnRoundedIcon
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                          <Typography variant="body2">{user.location.city}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          size="medium"
                          color={status === "Suspended" ? "warning" : "default"}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {uuid}
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
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
}
