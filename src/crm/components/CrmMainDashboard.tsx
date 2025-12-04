import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import Copyright from "../../dashboard/internals/components/Copyright";
import CrmStatCard from "./CrmStatCard";
import CrmRecentDealsTable from "./CrmRecentDealsTable";
import CrmUpcomingTasks from "./CrmUpcomingTasks";
import CrmSalesChart from "./CrmSalesChart";
import CrmLeadsBySourceChart from "./CrmLeadsBySourceChart";
import CrmActivitiesTimeline from "./CrmActivitiesTimeline";

// Sample data for stat cards with icons
const statCardsData = [
  {
    title: "Total Customers",
    value: "2,543",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+15%",
    data: [
      200, 240, 260, 280, 300, 320, 340, 360, 380, 400, 420, 440, 460, 480, 500,
      520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720, 740, 760, 780, 800,
    ],
    icon: GroupsRoundedIcon,
    color: "primary",
  },
  {
    title: "Deals Won",
    value: "$542K",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+23%",
    data: [
      400, 420, 440, 460, 480, 500, 520, 540, 560, 580, 600, 620, 640, 660, 680,
      700, 720, 740, 760, 780, 800, 820, 840, 860, 880, 900, 920, 940, 960, 980,
    ],
    icon: HandshakeRoundedIcon,
    color: "success",
  },
  {
    title: "New Leads",
    value: "456",
    interval: "Last 30 days",
    trend: "up",
    trendValue: "+12%",
    data: [
      300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440,
      450, 460, 470, 480, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590,
    ],
    icon: PersonAddRoundedIcon,
    color: "info",
  },
  {
    title: "Conversion Rate",
    value: "28%",
    interval: "Last 30 days",
    trend: "down",
    trendValue: "-5%",
    data: [
      35, 33, 32, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 29, 28, 27, 26, 25, 24, 23, 22,
    ],
    icon: PercentRoundedIcon,
    color: "warning",
  },
];

// Quick action cards
const quickActions = [
  {
    title: "Add New Lead",
    description: "Capture a new potential customer",
    icon: PersonAddRoundedIcon,
    color: "primary",
    action: "newLead",
  },
  {
    title: "Create Deal",
    description: "Start a new deal pipeline",
    icon: HandshakeRoundedIcon,
    color: "success",
    action: "newDeal",
  },
  {
    title: "View Reports",
    description: "Analyze your performance",
    icon: TrendingUpRoundedIcon,
    color: "info",
    action: "reports",
  },
];

export default function CrmMainDashboard() {
  const [selectedAction, setSelectedAction] = React.useState<string | null>(null);

  const handleQuickAction = (action: string) => {
    setSelectedAction(action);
    console.log(`Quick action: ${action}`);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4" component="h2" fontWeight={600} gutterBottom>
              Welcome back! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your business today
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              size="large"
              sx={{
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s",
              }}
            >
              New Lead
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              size="large"
            >
              New Deal
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Stats Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCardsData.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <CrmStatCard
              title={card.title}
              value={card.value}
              interval={card.interval}
              trend={card.trend as "up" | "down"}
              trendValue={card.trendValue}
              data={card.data}
            />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <Card
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-4px)",
                    borderColor: `${action.color}.main`,
                  },
                }}
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${action.color}.main`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <action.icon />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Performance Insights
          </Typography>
          <IconButton size="small">
            <MoreVertRoundedIcon />
          </IconButton>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <CrmSalesChart />
          </Grid>
          <Grid item xs={12} lg={4}>
            <CrmLeadsBySourceChart />
          </Grid>
        </Grid>
      </Box>

      {/* Activity & Tasks Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
          Activity Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <CrmRecentDealsTable />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              <CrmUpcomingTasks />
              <CrmActivitiesTimeline />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Copyright sx={{ mt: 4, mb: 4 }} />
    </Box>
  );
}
