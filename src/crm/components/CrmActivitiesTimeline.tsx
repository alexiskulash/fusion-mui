import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

// Sample activities data
const activities = [
  {
    id: 1,
    type: "email",
    title: "Email sent to Acme Corp",
    description: "Proposal follow-up email sent",
    time: "11:30 AM",
    icon: <EmailRoundedIcon fontSize="small" />,
    color: "primary",
  },
  {
    id: 2,
    type: "call",
    title: "Call with TechSolutions Inc",
    description: "Discussed implementation timeline",
    time: "10:15 AM",
    icon: <PhoneRoundedIcon fontSize="small" />,
    color: "success",
  },
  {
    id: 3,
    type: "meeting",
    title: "Meeting scheduled",
    description: "Demo for Global Media next Monday",
    time: "Yesterday",
    icon: <MeetingRoomRoundedIcon fontSize="small" />,
    color: "warning",
  },
  {
    id: 4,
    type: "note",
    title: "Note added",
    description: "Added details about RetailGiant requirements",
    time: "Yesterday",
    icon: <EditNoteRoundedIcon fontSize="small" />,
    color: "info",
  },
];

export default function CrmActivitiesTimeline() {
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
              Recent Activities
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest updates from your team
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

        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          {activities.map((activity, index) => (
            <Box
              key={activity.id}
              sx={{
                display: "flex",
                mb: index === activities.length - 1 ? 0 : 2.5,
                gap: 2,
                alignItems: "flex-start",
                position: "relative",
                "&::before":
                  index === activities.length - 1
                    ? {}
                    : {
                        content: '""',
                        position: "absolute",
                        left: 19,
                        top: 38,
                        bottom: -20,
                        width: 2,
                        bgcolor: "divider",
                      },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: `${activity.color}.main`,
                  width: 38,
                  height: 38,
                  boxShadow: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: 4,
                  },
                }}
              >
                {activity.icon}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle2" component="span" fontWeight={600}>
                    {activity.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, ml: 1 }}
                  >
                    {activity.time}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {activity.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
