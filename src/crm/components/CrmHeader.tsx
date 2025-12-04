import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuButton from "../../dashboard/components/MenuButton";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import CrmSearch from "./CrmSearch";
import CrmNavbarBreadcrumbs from "./CrmNavbarBreadcrumbs";
import Button from "@mui/material/Button";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";

export default function CrmHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
        pb: 1,
      }}
      spacing={2}
    >
      {/* Left Section - Breadcrumbs and Title */}
      <Stack direction="column" spacing={1} sx={{ flexGrow: 1 }}>
        <CrmNavbarBreadcrumbs />
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" component="h1" fontWeight={700}>
            CRM Dashboard
          </Typography>
          <Chip
            label="Live"
            size="small"
            color="success"
            sx={{
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": {
                  opacity: 1,
                },
                "50%": {
                  opacity: 0.7,
                },
              },
            }}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {currentDate}
        </Typography>
      </Stack>

      {/* Right Section - Actions */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          flexShrink: 0,
        }}
      >
        <CrmSearch />
        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarTodayRoundedIcon />}
          sx={{
            display: { xs: "none", lg: "flex" },
            whiteSpace: "nowrap",
          }}
        >
          This Month
        </Button>
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
