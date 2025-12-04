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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";

// Sample data for recent deals
const recentDeals = [
  {
    id: 1,
    name: "Enterprise Software Package",
    customer: { name: "Acme Corp", avatar: "A" },
    value: 125000,
    stage: "Proposal",
    probability: 75,
    closingDate: "2023-09-30",
  },
  {
    id: 2,
    name: "Cloud Migration Service",
    customer: { name: "TechSolutions Inc", avatar: "T" },
    value: 87500,
    stage: "Negotiation",
    probability: 90,
    closingDate: "2023-10-15",
  },
  {
    id: 3,
    name: "Website Redesign Project",
    customer: { name: "Global Media", avatar: "G" },
    value: 45000,
    stage: "Discovery",
    probability: 60,
    closingDate: "2023-11-05",
  },
  {
    id: 4,
    name: "CRM Implementation",
    customer: { name: "RetailGiant", avatar: "R" },
    value: 95000,
    stage: "Closed Won",
    probability: 100,
    closingDate: "2023-09-15",
  },
  {
    id: 5,
    name: "IT Infrastructure Upgrade",
    customer: { name: "HealthCare Pro", avatar: "H" },
    value: 135000,
    stage: "Negotiation",
    probability: 85,
    closingDate: "2023-10-22",
  },
];

// Function to get color based on deal stage
const getStageColor = (
  stage: string
): "default" | "primary" | "success" | "warning" | "info" => {
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

// Get probability color
const getProbabilityColor = (probability: number): string => {
  if (probability >= 80) return "success.main";
  if (probability >= 60) return "warning.main";
  return "error.main";
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

export default function CrmRecentDealsTable() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" component="h3" fontWeight={600}>
              Recent Deals
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track your active deals and close rates
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            View All
          </Button>
          <IconButton size="small" sx={{ display: { xs: "flex", sm: "none" } }}>
            <ArrowForwardRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small" aria-label="recent deals table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Deal Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Value
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
              <TableCell sx={{ fontWeight: 600, display: { xs: "none", md: "table-cell" } }}>
                Probability
              </TableCell>
              <TableCell sx={{ fontWeight: 600, display: { xs: "none", lg: "table-cell" } }}>
                Closing Date
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentDeals.map((deal) => (
              <TableRow
                key={deal.id}
                onMouseEnter={() => setHoveredRow(deal.id)}
                onMouseLeave={() => setHoveredRow(null)}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover",
                    transform: "scale(1.01)",
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {deal.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                        bgcolor: "primary.main",
                      }}
                    >
                      {deal.customer.avatar}
                    </Avatar>
                    <Typography variant="body2">{deal.customer.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(deal.value)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={deal.stage}
                    size="small"
                    color={getStageColor(deal.stage)}
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  <Box sx={{ width: "100%", maxWidth: 100 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={deal.probability}
                        sx={{
                          flexGrow: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "action.hover",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: getProbabilityColor(deal.probability),
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={getProbabilityColor(deal.probability)}
                        sx={{ minWidth: 35 }}
                      >
                        {deal.probability}%
                      </Typography>
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(deal.closingDate)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label="more options"
                    sx={{
                      opacity: hoveredRow === deal.id ? 1 : 0.3,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
