import React from "react";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";

const hexToRgb = (hex) => {
  const normalizedHex = hex.replace("#", "");
  const value = parseInt(normalizedHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const getRelativeLuminance = ({ r, g, b }) => {
  const channels = [r, g, b].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const getContrastRatio = (first, second) => {
  const firstLuminance = getRelativeLuminance(first);
  const secondLuminance = getRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const StatCard = ({ title, value, color, tooltip }) => {
  const accentColor = color || "#0F766E";
  const accentRgb = hexToRgb(accentColor);
  const valueColor =
    getContrastRatio(accentRgb, { r: 255, g: 255, b: 255 }) >= 4.5
      ? accentColor
      : "#102A27";

  const card = (
    <Card
      tabIndex={0}
      aria-label={tooltip ? `${title}. ${tooltip}` : title}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.34)`,
        boxShadow: "0 18px 40px rgba(16, 42, 39, 0.08)",
        background:
          `linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.14) 100%)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 24px 50px rgba(16, 42, 39, 0.12)",
        },
        "&:focus-visible": {
          outline: `3px solid ${accentColor}`,
          outlineOffset: 3,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 42,
            height: 8,
            borderRadius: 999,
            background: accentColor,
            mb: 2,
          }}
        />
        <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: valueColor, fontWeight: 800, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (!tooltip) {
    return card;
  }

  return (
    <Tooltip title={tooltip} arrow enterTouchDelay={0} describeChild>
      {card}
    </Tooltip>
  );
};

export default StatCard;
