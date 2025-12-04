import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";

export type CrmStatCardProps = {
  title: string;
  value: string;
  interval: string;
  trend: "up" | "down";
  trendValue: string;
  data: number[];
};

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

export default function CrmStatCard({
  title,
  value,
  interval,
  trend,
  trendValue,
  data,
}: CrmStatCardProps) {
  const theme = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
  };

  const labelColors = {
    up: "success" as const,
    down: "error" as const,
  };

  const trendIcons = {
    up: <ArrowUpwardRoundedIcon fontSize="small" />,
    down: <ArrowDownwardRoundedIcon fontSize="small" />,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];
  const trendIcon = trendIcons[trend];

  return (
    <Card
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "visible",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-4px)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Typography
            component="h3"
            variant="subtitle2"
            color="text.secondary"
            fontWeight={500}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            sx={{
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack spacing={1}>
          {/* Value and Trend */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h3"
              component="p"
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {value}
            </Typography>
            <Chip
              size="small"
              color={color}
              label={trendValue}
              icon={trendIcon}
              sx={{
                fontWeight: 600,
                "& .MuiChip-icon": {
                  marginLeft: theme.spacing(0.625),
                  marginRight: theme.spacing(-0.5),
                },
              }}
            />
          </Stack>

          {/* Interval */}
          <Typography variant="caption" color="text.secondary">
            {interval}
          </Typography>

          {/* Chart */}
          <Box
            sx={{
              width: "100%",
              height: 60,
              mt: 1,
              position: "relative",
            }}
          >
            <SparkLineChart
              colors={[chartColor]}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: Array.from(
                  { length: data.length },
                  (_, i) => `Day ${i + 1}`
                ),
              }}
              height={60}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#area-gradient-${title.replace(/\s+/g, "-").toLowerCase()})`,
                },
              }}
            >
              <AreaGradient
                color={chartColor}
                id={`area-gradient-${title.replace(/\s+/g, "-").toLowerCase()}`}
              />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>

      {/* Decorative Corner Accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, transparent 100%)`,
          borderRadius: "0 8px 0 100%",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </Card>
  );
}
