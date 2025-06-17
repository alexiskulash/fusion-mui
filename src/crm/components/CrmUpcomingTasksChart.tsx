import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { BarChart } from "@mui/x-charts/BarChart";

// Sample data for upcoming tasks distribution
const taskStatusData = [
  { status: "Overdue", count: 3, color: "#f44336" },
  { status: "Due Today", count: 5, color: "#ff9800" },
  { status: "This Week", count: 12, color: "#2196f3" },
  { status: "Next Week", count: 8, color: "#4caf50" },
  { status: "Future", count: 15, color: "#9e9e9e" },
];

const priorityData = [
  { priority: "High", count: 8, color: "#f44336" },
  { priority: "Medium", count: 15, color: "#ff9800" },
  { priority: "Low", count: 20, color: "#4caf50" },
];

export default function CrmUpcomingTasksChart() {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Upcoming Tasks
          </Typography>
          <Button endIcon={<ArrowForwardRoundedIcon />} size="small">
            View All
          </Button>
        </Stack>

        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            height: "280px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Task Status Distribution */}
          <Box sx={{ height: "140px" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              By Due Date
            </Typography>
            <BarChart
              height={120}
              series={[
                {
                  data: taskStatusData.map((item) => item.count),
                  color: theme.palette.primary.main,
                },
              ]}
              xAxis={[
                {
                  data: taskStatusData.map((item) => item.status),
                  scaleType: "band",
                },
              ]}
              margin={{ left: 30, right: 10, top: 10, bottom: 30 }}
              slotProps={{
                bar: {
                  rx: 4,
                },
              }}
            />
          </Box>

          {/* Priority Distribution */}
          <Box sx={{ height: "140px" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              By Priority
            </Typography>
            <BarChart
              height={120}
              series={[
                {
                  data: priorityData.map((item) => item.count),
                  color: theme.palette.secondary.main,
                },
              ]}
              xAxis={[
                {
                  data: priorityData.map((item) => item.priority),
                  scaleType: "band",
                },
              ]}
              margin={{ left: 30, right: 10, top: 10, bottom: 30 }}
              slotProps={{
                bar: {
                  rx: 4,
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
