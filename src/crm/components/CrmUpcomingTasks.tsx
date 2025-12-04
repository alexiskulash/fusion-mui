import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";

// Sample data for upcoming tasks
const upcomingTasks = [
  {
    id: 1,
    task: "Follow up with TechSolutions Inc on cloud proposal",
    completed: false,
    priority: "high",
    dueDate: "Today, 2:00 PM",
  },
  {
    id: 2,
    task: "Prepare presentation for Global Media website project",
    completed: false,
    priority: "medium",
    dueDate: "Tomorrow, 10:00 AM",
  },
  {
    id: 3,
    task: "Call HealthCare Pro about contract details",
    completed: false,
    priority: "high",
    dueDate: "Today, 4:30 PM",
  },
  {
    id: 4,
    task: "Update CRM implementation timeline for RetailGiant",
    completed: true,
    priority: "medium",
    dueDate: "Yesterday",
  },
  {
    id: 5,
    task: "Send proposal documents to Acme Corp",
    completed: false,
    priority: "low",
    dueDate: "Sep 28, 2023",
  },
];

// Function to get priority color
const getPriorityColor = (
  priority: string
): "error" | "warning" | "default" => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    default:
      return "default";
  }
};

export default function CrmUpcomingTasks() {
  const [tasks, setTasks] = React.useState(upcomingTasks);
  const [showCompleted, setShowCompleted] = React.useState(true);

  const handleToggle = (id: number) => () => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ p: 2, pb: 1 }}
        >
          <Box>
            <Typography variant="h6" component="h3" fontWeight={600}>
              Upcoming Tasks
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeTasks.length} active, {completedTasks.length} completed
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            View All
          </Button>
        </Stack>

        <List sx={{ width: "100%", bgcolor: "background.paper", py: 0 }}>
          {/* Active Tasks */}
          {activeTasks.map((task) => {
            const labelId = `checkbox-list-label-${task.id}`;

            return (
              <ListItem
                key={task.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="more details"
                    size="small"
                    sx={{
                      opacity: 0.5,
                      "&:hover": { opacity: 1 },
                    }}
                  >
                    <ArrowForwardRoundedIcon fontSize="small" />
                  </IconButton>
                }
                disablePadding
                sx={{
                  borderLeft: 3,
                  borderColor:
                    task.priority === "high"
                      ? "error.main"
                      : task.priority === "medium"
                        ? "warning.main"
                        : "grey.300",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(task.id)}
                  dense
                  sx={{ pl: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          color: task.completed
                            ? "text.secondary"
                            : "text.primary",
                          fontWeight: 500,
                        }}
                      >
                        {task.task}
                      </Typography>
                    }
                    secondary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            "& .MuiChip-label": { px: 1, py: 0 },
                          }}
                        />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {task.dueDate}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <>
              <ListItem
                sx={{
                  py: 1,
                  px: 2,
                  bgcolor: "action.hover",
                  cursor: "pointer",
                }}
                onClick={() => setShowCompleted(!showCompleted)}
              >
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Completed ({completedTasks.length})
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    ml: "auto",
                    transform: showCompleted ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <ArrowForwardRoundedIcon fontSize="small" />
                </IconButton>
              </ListItem>

              <Collapse in={showCompleted}>
                {completedTasks.map((task) => {
                  const labelId = `checkbox-list-label-${task.id}`;

                  return (
                    <ListItem
                      key={task.id}
                      disablePadding
                      sx={{
                        opacity: 0.6,
                        "&:hover": {
                          bgcolor: "action.hover",
                          opacity: 1,
                        },
                      }}
                    >
                      <ListItemButton
                        role={undefined}
                        onClick={handleToggle(task.id)}
                        dense
                        sx={{ pl: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Checkbox
                            edge="start"
                            checked={task.completed}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ "aria-labelledby": labelId }}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          id={labelId}
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: "line-through",
                                color: "text.secondary",
                              }}
                            >
                              {task.task}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {task.dueDate}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Collapse>
            </>
          )}
        </List>
      </CardContent>
    </Card>
  );
}
