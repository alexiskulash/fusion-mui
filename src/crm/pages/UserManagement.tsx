import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  status: "Active" | "Suspended";
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Prabodhan Fitzgerald",
    email: "prabodhan.f@example.com",
    location: "Izaiahport",
    status: "Active",
  },
  {
    id: "2",
    name: "Hiro Joyce",
    email: "hiro.joyce@example.com",
    location: "Strackeside",
    status: "Active",
  },
  {
    id: "3",
    name: "Lloyd Jefferson",
    email: "lloyd.j@example.com",
    location: "Texas City",
    status: "Active",
  },
  {
    id: "4",
    name: "Ceiran Mayo",
    email: "ceiran.mayo@example.com",
    location: "Lake Esmeralda",
    status: "Active",
  },
  {
    id: "5",
    name: "Thumbiko James",
    email: "thumbiko.james@example.com",
    location: "East Paige",
    status: "Suspended",
  },
];

export default function UserManagement() {
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("Name, email, etc...");
  const [attribute, setAttribute] = React.useState("Property");

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = mockUsers.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - mockUsers.length) : 0;

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 400,
            fontSize: "34px",
            color: "rgba(0, 0, 0, 0.87)",
          }}
        >
          User management
        </Typography>
      </Box>

      {/* Main Card */}
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Toolbar */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <TextField
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 300,
                "& .MuiOutlinedInput-input": {
                  fontSize: "16px",
                  padding: "16px 12px",
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
              label="Search"
            />
            <FormControl sx={{ width: 180 }}>
              <InputLabel>Attribute</InputLabel>
              <Select
                value={attribute}
                label="Attribute"
                onChange={(e) => setAttribute(e.target.value)}
                sx={{ fontSize: "16px" }}
              >
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Name">Name</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Location">Location</MenuItem>
              </Select>
            </FormControl>
            <IconButton>
              <FilterAltIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              sx={{ textTransform: "uppercase" }}
            >
              Action
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: "uppercase",
                boxShadow:
                  "0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.20)",
              }}
            >
              New
            </Button>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}>
                <TableCell padding="checkbox" sx={{ pl: 0.5 }}>
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < mockUsers.length
                    }
                    checked={
                      mockUsers.length > 0 &&
                      selected.length === mockUsers.length
                    }
                    onChange={handleSelectAllClick}
                  />
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, fontWeight: 500, fontSize: "14px" }}
                  >
                    User
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "14px" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "14px" }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "14px" }}>
                  Account status
                </TableCell>
                <TableCell sx={{ fontWeight: 500, fontSize: "14px" }}>
                  ID
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => {
                  const isItemSelected = isSelected(user.id);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, user.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={user.id}
                      selected={isItemSelected}
                      sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Checkbox color="primary" checked={isItemSelected} />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              ml: 1,
                            }}
                          >
                            <Avatar
                              sx={{ width: 40, height: 40, bgcolor: "#BDBDBD" }}
                            >
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: "14px" }}
                            >
                              {user.name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "14px" }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationOnIcon
                            sx={{
                              color: "rgba(0, 0, 0, 0.56)",
                              fontSize: "24px",
                            }}
                          />
                          <Typography variant="body2" sx={{ fontSize: "14px" }}>
                            {user.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="medium"
                          sx={{
                            backgroundColor:
                              user.status === "Active"
                                ? "rgba(0, 0, 0, 0.08)"
                                : "#EF6C00",
                            color:
                              user.status === "Active"
                                ? "rgba(0, 0, 0, 0.87)"
                                : "#FFF",
                            fontSize: "13px",
                            fontWeight: 400,
                            borderRadius: "100px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "14px" }}>
                          {user.id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={5} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={5}
                  count={mockUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    "& .MuiTablePagination-toolbar": {
                      fontSize: "12px",
                    },
                    "& .MuiTablePagination-selectLabel": {
                      fontSize: "12px",
                      color: "rgba(0, 0, 0, 0.60)",
                    },
                    "& .MuiTablePagination-displayedRows": {
                      fontSize: "12px",
                      color: "rgba(0, 0, 0, 0.87)",
                    },
                  }}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
