import React from "react";
import { Box, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { UI } from "./uiTokens";

export default function AiBadge({ used, size = "table" }) {
  const dim = size === "table" ? 26 : 24;
  const iconSize = size === "table" ? 16 : 15;
  return (
    <Tooltip title={used ? "AI content generated" : "No AI content yet"}>
      <Box
        sx={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: used ? UI.aiYes : UI.aiNo,
          mx: size === "table" ? "auto" : 0,
        }}
      >
        {used ? (
          <CheckIcon sx={{ color: UI.aiYesIcon, fontSize: iconSize }} />
        ) : (
          <CloseIcon sx={{ color: UI.aiNoIcon, fontSize: iconSize }} />
        )}
      </Box>
    </Tooltip>
  );
}