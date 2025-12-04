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

/**
 * Activity interface representing a single timeline activity entry.
 * 
 * Each activity represents an action or event that occurred in the CRM system,
 * such as sending an email, making a phone call, scheduling a meeting, or adding a note.
 * 
 * Properties:
 * - id: Unique identifier for the activity
 * - type: Category of activity (email, call, meeting, note)
 * - title: Main heading/summary of the activity
 * - description: Detailed description of what happened
 * - time: When the activity occurred (formatted string)
 * - icon: React element representing the activity type visually
 * - color: MUI color palette key for theming (primary, success, warning, info)
 */
interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactElement;
  color: "primary" | "success" | "warning" | "info";
}

/**
 * Sample activities data for demonstration purposes.
 * 
 * In a production environment, this would be fetched from an API endpoint
 * that returns recent activities from the CRM database. Activities are
 * typically ordered by timestamp (most recent first).
 * 
 * Activity types included:
 * - Email: Communication sent to customers/leads
 * - Call: Phone conversations with customers
 * - Meeting: Scheduled or completed meetings
 * - Note: Internal notes and documentation
 */
const activities: Activity[] = [
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

/**
 * CrmActivitiesTimeline Component
 * 
 * Displays a visual timeline of recent CRM activities with the following features:
 * 
 * 1. **Timeline Visualization**: Vertical timeline with connecting lines between activities
 * 2. **Activity Icons**: Color-coded avatars representing different activity types
 * 3. **Hover Effects**: Interactive hover states on activity avatars
 * 4. **Responsive Design**: Adapts layout for different screen sizes
 * 5. **Visual Hierarchy**: Clear title, description, and timestamp for each activity
 * 
 * The component uses a pseudo-element (::before) to create a vertical line connecting
 * all activities except the last one, creating a continuous timeline effect.
 * 
 * Avatar colors correspond to activity types:
 * - Primary (blue): Emails
 * - Success (green): Calls
 * - Warning (orange): Meetings
 * - Info (light blue): Notes
 * 
 * @returns A card component containing the activities timeline
 */
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
        {/* Header Section with Title and Action Button */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ p: 2, pb: 1 }}
        >
          {/* Title and Subtitle */}
          <Box>
            <Typography variant="h6" component="h3" fontWeight={600}>
              Recent Activities
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest updates from your team
            </Typography>
          </Box>

          {/* View All Button - Hidden on mobile screens */}
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            View All
          </Button>
        </Stack>

        {/* Activities Timeline Container */}
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          {activities.map((activity, index) => (
            <Box
              key={activity.id}
              sx={{
                display: "flex",
                // Remove bottom margin from the last item to prevent extra spacing
                mb: index === activities.length - 1 ? 0 : 2.5,
                gap: 2,
                alignItems: "flex-start",
                position: "relative",
                /**
                 * Timeline Connector Line
                 * 
                 * Uses a ::before pseudo-element to create a vertical line connecting
                 * activities. The line is positioned absolutely and extends from the
                 * bottom of each avatar to the top of the next one.
                 * 
                 * Positioning:
                 * - left: 19px (centered on the 38px wide avatar)
                 * - top: 38px (starts at the bottom of the avatar)
                 * - bottom: -20px (extends down to the next activity)
                 * - width: 2px (thin line)
                 * 
                 * The last activity doesn't get a connector line since there's
                 * nothing below it to connect to.
                 */
                "&::before":
                  index === activities.length - 1
                    ? {}
                    : {
                        content: '""',
                        position: "absolute",
                        left: 19, // Centers on 38px avatar (19px = half of 38px)
                        top: 38, // Height of avatar
                        bottom: -20, // Extends beyond this activity
                        width: 2,
                        bgcolor: "divider",
                      },
              }}
            >
              {/* Activity Type Avatar */}
              {/* 
                Circular avatar displaying an icon representing the activity type.
                Background color is set dynamically based on the activity.color property.
                
                Features:
                - Color-coded by activity type (email/call/meeting/note)
                - Box shadow for depth
                - Hover animation that scales up the avatar
                - Smooth transition for all hover effects
              */}
              <Avatar
                sx={{
                  bgcolor: `${activity.color}.main`,
                  width: 38,
                  height: 38,
                  boxShadow: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)", // 10% scale increase on hover
                    boxShadow: 4, // Increased shadow on hover
                  },
                }}
              >
                {activity.icon}
              </Avatar>

              {/* Activity Content Area */}
              {/*
                Contains the activity title, timestamp, and description.
                Uses flexGrow to take up remaining space and minWidth: 0 to allow
                text truncation within flexbox layout.
              */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* Title and Timestamp Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 0.5,
                  }}
                >
                  {/* Activity Title */}
                  <Typography variant="subtitle2" component="span" fontWeight={600}>
                    {activity.title}
                  </Typography>

                  {/* Timestamp - Right-aligned */}
                  {/*
                    Displays when the activity occurred.
                    flexShrink: 0 prevents the timestamp from being compressed
                    ml: 1 adds left margin to separate from title
                  */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, ml: 1 }}
                  >
                    {activity.time}
                  </Typography>
                </Box>

                {/* Activity Description */}
                {/*
                  Displays detailed information about the activity.
                  Uses CSS clamp to limit text to 2 lines with ellipsis overflow.
                  
                  WebkitLineClamp technique:
                  - overflow: hidden - Hides overflowing content
                  - textOverflow: ellipsis - Adds "..." at the end
                  - display: -webkit-box - Required for line clamping
                  - WebkitLineClamp: 2 - Limits to 2 lines
                  - WebkitBoxOrient: vertical - Sets box orientation for clamping
                */}
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
