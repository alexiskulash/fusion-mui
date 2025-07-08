import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Pagination from "@mui/material/Pagination";
import Skeleton from "@mui/material/Skeleton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Product Designer",
    company: "Acme • Atlanta, GA / Remote / San Francisco, CA",
    location: "Atlanta, GA",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
  {
    id: "2",
    title: "Tech Lead",
    company: "Acme • London, England / Remote",
    location: "London, England",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
  {
    id: "3",
    title: "Product Marketing Designer / Developer",
    company: "Acme • London, England / Remote",
    location: "London, England",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
];

export default function Jobs() {
  const [viewMode, setViewMode] = React.useState("grid");
  const [sortBy, setSortBy] = React.useState("latest");
  const [searchQuery, setSearchQuery] = React.useState("Senior");
  const [location, setLocation] = React.useState("19904");
  const [status, setStatus] = React.useState("");
  const [contractType, setContractType] = React.useState<string[]>([]);
  const [level, setLevel] = React.useState<string[]>([]);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: string,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleContractTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setContractType((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLevel((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1152, mx: "auto", py: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 400, fontSize: "24px" }}
        >
          Latest Jobs
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                border: "1px solid rgba(0, 0, 0, 0.12)",
                px: 1,
              },
            }}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              value={sortBy}
              label="Sort"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ fontSize: "16px" }}
            >
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="salary">Salary</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={3}>
        {/* Filters Sidebar */}
        <Box sx={{ width: 368, flexShrink: 0 }}>
          <Stack spacing={2}>
            <TextField
              label="Search by title"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              }}
            />
            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StarIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1,
                fontSize: "15px",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              ACTION
            </Button>

            {/* Status Filter */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  color: "text.secondary",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Status
              </Typography>
              <RadioGroup
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <FormControlLabel
                  value="active"
                  control={<Radio />}
                  label="Label"
                />
                <FormControlLabel
                  value="pending"
                  control={<Radio />}
                  label="Label"
                />
                <FormControlLabel
                  value="closed"
                  control={<Radio />}
                  label="Label"
                />
              </RadioGroup>
            </Box>

            {/* Contract Type Filter */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  color: "text.secondary",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Contract type
              </Typography>
              <Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contractType.includes("fulltime")}
                      onChange={handleContractTypeChange}
                      value="fulltime"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contractType.includes("parttime")}
                      onChange={handleContractTypeChange}
                      value="parttime"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contractType.includes("contract")}
                      onChange={handleContractTypeChange}
                      value="contract"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={contractType.includes("freelance")}
                      onChange={handleContractTypeChange}
                      value="freelance"
                    />
                  }
                  label="Label"
                />
              </Stack>
            </Box>

            {/* Level Filter */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  color: "text.secondary",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Level
              </Typography>
              <Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={level.includes("entry")}
                      onChange={handleLevelChange}
                      value="entry"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={level.includes("mid")}
                      onChange={handleLevelChange}
                      value="mid"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={level.includes("senior")}
                      onChange={handleLevelChange}
                      value="senior"
                    />
                  }
                  label="Label"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={level.includes("lead")}
                      onChange={handleLevelChange}
                      value="lead"
                    />
                  }
                  label="Label"
                />
              </Stack>
            </Box>

            <Box sx={{ p: 1 }}>
              <Link
                href="#"
                underline="always"
                sx={{ fontSize: "16px", color: "primary.main" }}
              >
                Link
              </Link>
            </Box>
          </Stack>
        </Box>

        {/* Jobs Content */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            {/* Loading Skeleton */}
            <Card
              sx={{
                borderRadius: 1,
                boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.12)",
              }}
            >
              <CardHeader
                avatar={<Skeleton variant="circular" width={40} height={40} />}
                title={<Skeleton variant="text" height={24} />}
                subheader={<Skeleton variant="text" height={12} width="60%" />}
              />
              <CardContent>
                <Skeleton variant="text" height={12} />
                <Skeleton variant="text" height={12} />
                <Skeleton variant="text" height={12} />
              </CardContent>
            </Card>

            {/* Job Cards */}
            {mockJobs.map((job) => (
              <Card
                key={job.id}
                sx={{
                  borderRadius: 1,
                  boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.12)",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "#BDBDBD", width: 32, height: 32 }}>
                      <PersonIcon sx={{ color: "white" }} />
                    </Avatar>
                  }
                  title={
                    <Typography
                      variant="h6"
                      sx={{ fontSize: "16px", fontWeight: 400 }}
                    >
                      {job.title}
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "14px" }}
                  >
                    {job.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      color: "primary.main",
                    }}
                  >
                    ACTION
                  </Button>
                </CardActions>
              </Card>
            ))}

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={7}
                page={1}
                shape="circular"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "14px",
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
