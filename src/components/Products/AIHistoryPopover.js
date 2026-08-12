
import React, { useMemo } from "react";
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import Popover from "@mui/material/Popover";

const normalizeToArray = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);

export default function AIHistoryPopover({
  anchorEl,
  context, 
  onClose,
  aiHistory,
  onApplyTitle,
  onApplyFeatures,
  onApplyDescription,
  width = 380,
  maxHeight = 260,
}) {
  const open = Boolean(anchorEl);

  const entries = useMemo(() => {
    if (!context?.type) return [];
    if (context.type === "title") return aiHistory?.title || [];
    if (context.type === "features") return aiHistory?.features || [];
    if (context.type === "description") return aiHistory?.description || [];
    return [];
  }, [aiHistory, context]);

  const handleApply = (entry) => {
    if (!context) return;

    if (context.type === "title") {
      onApplyTitle?.(entry.value, context.rowIndex);
    } else if (context.type === "features") {
      onApplyFeatures?.(normalizeToArray(entry.value), context.rowIndex);
    } else if (context.type === "description") {
      onApplyDescription?.(entry.value, context.rowIndex);
    }
    onClose?.();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width,
          maxWidth: "92vw",
          maxHeight,
          overflowY: "auto",
          p: 1,
          borderRadius: 1,
        },
      }}
    >
      {entries.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ p: 1 }}>
          No history available.
        </Typography>
      ) : (
        <RadioGroup>
          {entries.map((entry, idx) => {
            
            const radioValue =
              context?.type === "features"
                ? JSON.stringify(normalizeToArray(entry.value))
                : String(entry.value ?? "");

            return (
              <Box
                key={idx}
                sx={{
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#f5f5f5" },
                  px: 0.5,
                }}
              >
                <FormControlLabel
                  value={radioValue}
                  control={<Radio size="small" />}
                  onChange={() => handleApply(entry)}   
                  label={
                    <Box sx={{ py: 0.75 }}>
                      {context?.type === "features" ? (
                        normalizeToArray(entry.value).map((line, i) => (
                          <Typography key={i} variant="body2">
                            • {line}
                          </Typography>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              context?.type === "description" ? "pre-line" : "normal",
                          }}
                        >
                          {entry.value}
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {entry.type}
                        {entry.option ? ` • ${entry.option}` : ""}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            );
          })}
        </RadioGroup>
      )}
    </Popover>
  );
}