import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";
import FilterListIcon from "@mui/icons-material/FilterList";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";

// Sample data for deals management
const dealsData = [
  {
    id: 1,
    name: "Enterprise Software Package",
    customer: { name: "Acme Corp", avatar: "A", location: "New York" },
    email: "contact@acmecorp.com",
    value: 125000,
    stage: "Proposal",
    probability: 75,
    closingDate: "2023-09-30",
    lastActivity: "2023-09-15",
  },
  {
    id: 2,
    name: "Cloud Migration Service",
    customer: { name: "TechSolutions Inc", avatar: "T", location: "San Francisco" },
    email: "deals@techsolutions.com",
    value: 87500,
    stage: "Negotiation",
    probability: 90,
    closingDate: "2023-10-15",
    lastActivity: "2023-09-14",
  },
  {
    id: 3,
    name: "Website Redesign Project",
    customer: { name: "Global Media", avatar: "G", location: "Los Angeles" },
    email: "projects@globalmedia.com",
    value: 45000,
    stage: "Discovery",
    probability: 60,
    closingDate: "2023-11-05",
    lastActivity: "2023-09-13",
  },
  {
    id: 4,
    name: "CRM Implementation",
    customer: { name: "RetailGiant", avatar: "R", location: "Chicago" },
    email: "systems@retailgiant.com",
    value: 95000,
    stage: "Closed Won",
    probability: 100,
    closingDate: "2023-09-15",
    lastActivity: "2023-09-15",
  },
  {
    id: 5,
    name: "IT Infrastructure Upgrade",
    customer: { name: "HealthCare Pro", avatar: "H", location: "Boston" },
    email: "it@healthcarepro.com",
    value: 135000,
    stage: "Negotiation",
    probability: 85,
    closingDate: "2023-10-22",
    lastActivity: "2023-09-12",
  },
  {
    id: 6,
    name: "Mobile App Development",
    customer: { name: "StartupXYZ", avatar: "S", location: "Austin" },
    email: "dev@startupxyz.com",
    value: 65000,
    stage: "Proposal",
    probability: 70,
    closingDate: "2023-11-10",
    lastActivity: "2023-09-11",
  },
  {
    id: 7,
    name: "Security Audit Service",
    customer: { name: "FinanceCorp", avatar: "F", location: "Miami" },
    email: "security@financecorp.com",
    value: 55000,
    stage: "Discovery",
    probability: 65,
    closingDate: "2023-10-30",
    lastActivity: "2023-09-10",
  },
];

// Function to get color based on deal stage
const getStageColor = (stage: string): "default" | "primary" | "success" | "warning" | "info" => {
  switch (stage) {
    case "Discovery":
      return "info";
    case "Proposal":
      return "primary";
    case "Negotiation":
      return "warning";
    case "Closed Won":
      return "success";
    default:
      return "default";
  }
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export default function Deals() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterProperty, setFilterProperty] = React.useState("stage");

  // Filter deals based on search term
  const filteredDeals = dealsData.filter((deal) =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredDeals.map((deal) => deal.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Calculate the deals to show on current page
  const paginatedDeals = filteredDeals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Deal Management
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Card variant="outlined" sx={{ width: "100%" }}>
        {/* Toolbar */}
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            py: 2,
          }}
        >
          {/* Search and Filter Controls */}
          <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
            <TextField
              size="medium"
              placeholder="Name, customer, email, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              label="Search"
              variant="outlined"
            />
            <FormControl size="medium" sx={{ width: 180 }}>
              <InputLabel>Attribute</InputLabel>
              <Select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                label="Attribute"
              >
                <MenuItem value="stage">Stage</MenuItem>
                <MenuItem value="value">Value</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="date">Closing Date</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="large">
              <FilterListIcon />
            </IconButton>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="inherit">
              Action
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              color="primary"
            >
              New Deal
            </Button>
            <IconButton size="large">
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Toolbar>

        {/* Data Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < filteredDeals.length}
                    checked={filteredDeals.length > 0 && selected.length === filteredDeals.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Deal</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Closing Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDeals.map((deal) => {
                const isItemSelected = isSelected(deal.id);
                return (
                  <TableRow
                    hover
                    key={deal.id}
                    selected={isItemSelected}
                    onClick={() => handleClick(deal.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {deal.customer.avatar}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {deal.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {deal.customer.location}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatCurrency(deal.value)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={deal.stage}
                        size="medium"
                        color={getStageColor(deal.stage)}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(deal.closingDate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Table Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDeals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
