import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Radio,
  Checkbox,
  IconButton,
  Button,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { API_BASE_URL } from "../../utils/config";

const COLORS = {
  page: "#f4f5f0",
  card: "#ffffff",
  border: "#e4e6df",
  chipBg: "#eef1e6",
  chipText: "#4b5442",
  finalBorder: "#cfe0d2",
  applyBg: "#1b4d3e",
  applyBgHover: "#143a2f",
  generateBg: "#b8720f",
  generateBgHover: "#9c6009",
  tagBg: "#929786",
  tagBgHover: "#7f8574",
  tabActive: "#1b4d3e",
  muted: "#8a8f80",
};

const FIELD_META = {
  title: { label: "Product Title", singular: "title", countUnit: "characters" },
  features: {
    label: "Features",
    singular: "feature set",
    countUnit: "bullets",
  },
  description: {
    label: "Description",
    singular: "description",
    countUnit: "characters",
  },
};

const MAX_GENERATIONS = 3;

const asFeatureBullets = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export default function ContentStudio({
  id,
  product,
  productTab,
  setProductTab,
  onSnackbar,
  onApplyToProduct
}) {
  const [tabIndex, setTabIndex] = useState(0);
  const fieldKeys = ["title", "features", "description"];
  const field = fieldKeys[tabIndex];
  const maxRewriteLimit = Number(process.env.REACT_APP_MAX_REWRITE_COUNT);
  const [historyOpen, setHistoryOpen] = useState(false);
const [history, setHistory] = useState({ title: [], features: [], description: [] });
const [loadingHistory, setLoadingHistory] = useState(false);


  const versions = productTab?.[field] || [];

  const generationsLeft = Math.max(0, maxRewriteLimit - versions.length);
  const isLimitReached = versions.length >= maxRewriteLimit;
  const [customPrompt, setCustomPrompt] = useState({
    title: "",
    features: "",
    description: "",
  });
  const fetchHistory = () => {
  setLoadingHistory(true);
  fetch(`${API_BASE_URL}/fetchAiHistory/${id}`)
    .then((res) => res.json())
    .then((data) => {
      const payload = data?.data || data || {};
      setHistory({
        title: payload.title_history || [],
        features: payload.features_history || [],
        description: payload.description_history || [],
      });
    })
    .catch((err) => console.error("History fetch error:", err))
    .finally(() => setLoadingHistory(false));
};
  const isFirstGeneration = versions.length === 0;
  const isPromptEmpty =
    !isFirstGeneration &&
    (!customPrompt[field] || customPrompt[field].trim() === "");
  const [generating, setGenerating] = useState({
    title: false,
    features: false,
    description: false,
  });
  const [applying, setApplying] = useState({
    title: false,
    features: false,
    description: false,
  });
  const [selectedVersionIndex, setSelectedVersionIndex] = useState({
    title: null,
    features: null,
    description: null,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [checkedBullets, setCheckedBullets] = useState(new Set());

  useEffect(() => {
    if (field === "features") {
      setCheckedBullets((prev) => {
        if (prev.size === 0) {
          const initial = new Set();
          versions.forEach((v, vi) => {
            if (v.checked) {
              asFeatureBullets(v.value).forEach((_, bi) =>
                initial.add(`${vi}:${bi}`),
              );
            }
          });
          return initial;
        }
        return prev;
      });
    } else {
      const checkedIdx = versions.findIndex((v) => v.checked);
      setSelectedVersionIndex((prev) => ({
        ...prev,
        [field]:
          checkedIdx !== -1 ? checkedIdx : versions.length > 0 ? 0 : null,
      }));
    }
    setEditingIndex(null);
  }, [field]);

  const currentValue = useMemo(() => {
    if (field === "title") return product?.product_name || "";
    if (field === "description") return product?.long_description || "";
    if (field === "features") return product?.features || [];
    return "";
  }, [field, product]);

  const finalPreview = useMemo(() => {
    if (field === "features") {
      const bullets = [];
      versions.forEach((v, vi) => {
        asFeatureBullets(v.value).forEach((text, bi) => {
          if (checkedBullets.has(`${vi}:${bi}`))
            bullets.push({ text, version: vi + 1 });
        });
      });
      return bullets;
    }
    const idx = selectedVersionIndex[field];
    return idx != null && versions[idx] ? versions[idx].value : "";
  }, [field, versions, checkedBullets, selectedVersionIndex]);

  const finalCharCount =
    field === "features"
      ? finalPreview.reduce((sum, b) => sum + b.text.length, 0)
      : (finalPreview || "").length;

  const persist = (updatedFields) => {
    return fetch(`${API_BASE_URL}/updategeneratedContent/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id, ...updatedFields }),
    }).catch((err) => console.error("Error persisting content:", err));
  };

  const handleSelectVersion = (idx) => {
    setSelectedVersionIndex((prev) => ({ ...prev, [field]: idx }));
  };

  const handleToggleBullet = (versionIndex, bulletIndex) => {
    const key = `${versionIndex}:${bulletIndex}`;
    setCheckedBullets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditValue(versions[idx]?.value || "");
  };
  const saveEdit = (idx) => {
    const updated = versions.map((v, i) =>
      i === idx ? { ...v, value: editValue } : v,
    );
    setProductTab({ ...productTab, [field]: updated });
    setEditingIndex(null);
  };

  const handleApply = async () => {
    setApplying((p) => ({ ...p, [field]: true }));
    let updated;

    if (field === "features") {
      if (finalPreview.length === 0) {
        onSnackbar?.("warning", "Select at least one bullet to apply.");
        setApplying((p) => ({ ...p, [field]: false }));
        return;
      }
      const mergedEntry = {
        value: finalPreview.map((b) => b.text),
        checked: true,
        type: "merged",
      };
      updated = [
        ...versions.map((v) => ({ ...v, checked: false })),
        mergedEntry,
      ];
    } else {
      const idx = selectedVersionIndex[field];
      if (idx == null) {
        onSnackbar?.(
          "warning",
          `Select a ${FIELD_META[field].singular} to apply.`,
        );
        setApplying((p) => ({ ...p, [field]: false }));
        return;
      }
      updated = versions.map((v, i) => ({ ...v, checked: i === idx }));
    }

    setProductTab({ ...productTab, [field]: updated });
    await persist({ [field]: updated });
    const valueToPush =
  field === "features"
    ? finalPreview.map((b) => b.text)
    : versions[selectedVersionIndex[field]]?.value || "";
await onApplyToProduct?.(field, valueToPush);
    setApplying((p) => ({ ...p, [field]: false }));
    onSnackbar?.("success", `${FIELD_META[field].label} applied.`);
  };

 const handleGenerate = async () => {
  if (isLimitReached) return;
  const promptText = customPrompt[field].trim();
  setGenerating((p) => ({ ...p, [field]: true }));

  const isFirstGeneration = versions.length === 0;

  try {
    if (isFirstGeneration) {
      const res = await fetch(`${API_BASE_URL}/fetchAiContent/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: id,
          title: field === "title",
          features: field === "features",
          description: field === "description",
        }),
      });
      const responseData = await res.json();
      const newVersions = responseData?.data?.[field] || responseData?.[field] || [];
      setProductTab((prev) => ({ ...prev, [field]: newVersions }));
      onSnackbar?.("success", "First version generated.");
    } else {
      let baseSelection = [];

      if (field === "features") {
        // Collect checked bullets from checkedBullets Set
        const selectedBullets = [];
        versions.forEach((v, vi) => {
          asFeatureBullets(v.value).forEach((text, bi) => {
            if (checkedBullets.has(`${vi}:${bi}`)) {
              selectedBullets.push(text);
            }
          });
        });

        const targetIndex = selectedVersionIndex[field] ?? 0;
        const featureValue =
          selectedBullets.length > 0
            ? selectedBullets
            : asFeatureBullets(versions[targetIndex]?.value);

        baseSelection = [{ value: featureValue, checked: true }];
      } else {
        const targetIndex = selectedVersionIndex[field] ?? 0;
        baseSelection = versions
          .filter((_, i) => i === targetIndex)
          .map((v) => ({ ...v, checked: true }));
      }

      const payload = {
        product_id: id,
        option: promptText || "Generate another version",
        title: field === "title" ? baseSelection : [],
        description: field === "description" ? baseSelection : [],
        features: field === "features" ? baseSelection : [],
      };

      const res = await fetch(`${API_BASE_URL}/regenerateAiContents/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      const apiError = result?.data?.error || result?.error;
      if (apiError) {
        onSnackbar?.("warning", apiError);
        return;
      }

      const newlyGenerated = result?.data?.[field] || result?.[field] || [];

      if (newlyGenerated.length === 0) {
        onSnackbar?.("warning", "No new content returned from server.");
        return;
      }

      // Append newly generated version to existing versions
      if (newlyGenerated.length > 0) {
  setProductTab((prev) => ({ ...prev, [field]: newlyGenerated }));
}

      onSnackbar?.("success", "New version generated.");
    }

    setCustomPrompt((p) => ({ ...p, [field]: "" }));
  } catch (err) {
    console.error("Generate error:", err);
    onSnackbar?.("error", "Could not generate a new version.");
  } finally {
    setGenerating((p) => ({ ...p, [field]: false }));
  }
};
  const quickTags = [
    "Make it short",
    "Make it long",
    "Make it brief",
    "Make it punchy",
    "Add keywords",
    "More technical",
  ];

  return (
    <Box sx={{ bgcolor: COLORS.page, borderRadius: 3, p: { xs: 2, sm: 3 } }}>
      <Typography
        sx={{
          fontSize: 11,
          letterSpacing: "0.08em",
          color: "#6b7280",
          fontWeight: 600,
          fontFamily: "monospace, sans-serif",
        }}
      >
        CONTENT STUDIO
      </Typography>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 100,
          color: "#111827",
          mt: 0.5,
          fontSize: "1.5rem",
        }}
      >
        Product content
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#6b7280",
          fontSize: "0.875rem",
          mt: 0.5,
          mb: 2.5,
        }}
      >
        Compare your existing content with AI-generated versions, then choose or
        assemble your final version.
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(e, v) => setTabIndex(v)}
        sx={{
          minHeight: 36,
          mb: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          "& .MuiTab-root": {
            minHeight: 36,
            textTransform: "none",
            fontWeight: 400,
            color: COLORS.muted,
          },
          "& .Mui-selected": { color: `${COLORS.tabActive} !important` },
          "& .MuiTabs-indicator": { backgroundColor: COLORS.tabActive },
        }}
      >
        <Tab label="Product title" />
        <Tab label="Features" />
        <Tab label="Description" />
      </Tabs>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT COLUMN */}
        <Box sx={{ flex: 1, width: "100%" }}>
          {/* Current */}
          <Box
            sx={{
              bgcolor: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "#6b7280",
                  fontWeight: 600,
                  fontFamily: "monospace, sans-serif",
                }}
              >
                CURRENT {FIELD_META[field].label.toUpperCase()}
              </Typography>
              <Chip
                label="Existing"
                size="small"
                sx={{
                  bgcolor: "#eef1e6",
                  color: "#576352",
                  fontWeight: 600,
                  fontSize: 11,
                  borderRadius: "5px",
                  height: 22,
                  fontFamily: "monospace, sans-serif",
                }}
              />
            </Box>

            {field === "features" ? (
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {(currentValue || []).length > 0 ? (
                  currentValue.map((f, i) => (
                    <Typography
                      component="li"
                      key={i}
                      sx={{
                        fontSize: "0.875rem",
                        color: "#374151",
                        lineHeight: 1.5,
                        fontWeight: 400,
                        mb: 0.75,
                      }}
                    >
                      {f}
                    </Typography>
                  ))
                ) : (
                  <Typography
                    sx={{
                      color: "#9ca3af",
                      fontStyle: "italic",
                      fontSize: "0.875rem",
                    }}
                  >
                    No features available.
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#374151",
                  lineHeight: 1.5,
                  fontWeight: 400,
                  whiteSpace: "pre-line",
                }}
              >
                {currentValue || (
                  <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                    Not set.
                  </span>
                )}
              </Typography>
            )}

            <Typography
              sx={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "monospace, sans-serif",
                textAlign: "right",
                mt: 1.5,
              }}
            >
              {field === "features"
                ? `${(currentValue || []).length} bullets`
                : `${(currentValue || "").length} characters`}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              AI Generated Versions
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "monospace, sans-serif",
              }}
            >
              {versions.length}/{maxRewriteLimit} generated
            </Typography>
          </Box>

          {versions.map((v, vi) => {
            const bullets =
              field === "features" ? asFeatureBullets(v.value) : null;
            const isEditing = editingIndex === vi;
            return (
              <Box
                key={vi}
                sx={{
                  bgcolor: COLORS.card,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                  p: 2,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      color: COLORS.applyBg,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Version {vi + 1}
                  </Typography>
                  {!isEditing && (
                    <Box>
                      {isEditing ? null : (
                        <IconButton size="small" onClick={() => startEdit(vi)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>

                {isEditing ? (
                  <Box
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <TextField
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                    />
                    <IconButton size="small" onClick={() => saveEdit(vi)}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setEditingIndex(null)}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : field === "features" ? (
                  <Box>
                    {bullets.map((b, bi) => (
                      <Box
                        key={bi}
                        sx={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <Checkbox
                          size="small"
                          checked={checkedBullets.has(`${vi}:${bi}`)}
                          onChange={() => handleToggleBullet(vi, bi)}
                          sx={{
                            color: COLORS.applyBg,
                            "&.Mui-checked": { color: COLORS.applyBg },
                            p: 0.5,
                            mr: 0.5,
                          }}
                        />
                        <Typography sx={{ fontSize: 15, pt: "9px" }}>
                          {b}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                  >
                    <Radio
                      size="small"
                      checked={selectedVersionIndex[field] === vi}
                      onClick={() => handleSelectVersion(vi)}
                      sx={{
                        color: COLORS.applyBg,
                        "&.Mui-checked": { color: COLORS.applyBg },
                        p: 0.5,
                        mt: "-4px",
                      }}
                    />
                    <Typography sx={{ fontSize: 15, whiteSpace: "pre-line" }}>
                      {v.value}
                    </Typography>
                  </Box>
                )}

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#6b7280",
                    fontFamily: "monospace, sans-serif",
                    textAlign: "right",
                    mt: 1,
                  }}
                >
                  {field === "features"
                    ? `${bullets.length} bullets • ${bullets.join(" ").length} characters`
                    : `${(v.value || "").length} characters`}
                </Typography>
              </Box>
            );
          })}

          {versions.length === 0 && (
            <Typography
              sx={{
                color: COLORS.muted,
                fontStyle: "italic",
                fontSize: 14,
                mb: 1.5,
              }}
            >
              No AI versions yet — generate one below.
            </Typography>
          )}

          {/* Generate version N */}
          <Box
            sx={{
              border: `1.5px dashed ${COLORS.border}`,
              borderRadius: 2,
              p: 2,
              bgcolor: "#fafbf6",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
           <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
  🪄&nbsp; {isLimitReached ? "Rewrite limit reached" : `Generate version ${versions.length + 1}`}
</Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontFamily: "monospace, sans-serif",
                }}
              >
                {generationsLeft} generation{generationsLeft === 1 ? "" : "s"}{" "}
                left
              </Typography>
            </Box>

            <TextField
              placeholder="Enter a custom prompt (e.g. emphasize energy efficiency)…"
              value={customPrompt[field]}
              onChange={(e) =>
                setCustomPrompt((p) => ({ ...p, [field]: e.target.value }))
              }
              fullWidth
              size="small"
              sx={{ bgcolor: "white", mb: 1.5 }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                mb: 2,
              }}
            >
              <EmojiObjectsOutlinedIcon
                fontSize="small"
                sx={{ color: "#c9a227" }}
              />
              <Typography sx={{ fontSize: 13, color: COLORS.muted, mr: 0.5 }}>
                Quick tags:
              </Typography>
              {quickTags.map((tag) => (
                <Button
                  key={tag}
                  size="small"
                  onClick={() =>
                    setCustomPrompt((p) => ({ ...p, [field]: tag }))
                  }
                  sx={{
                    bgcolor: "white",
                    color: "#4b5563",
                    border: "1px solid #d1d5db",
                    borderRadius: "5px",
                    textTransform: "none",
                    fontSize: 12,
                    px: 1.5,
                    py: 0.25,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#f9fafb", borderColor: "#9ca3af" },
                  }}
                >
                  {tag}
                </Button>
              ))}
            </Box>

            <Button
              fullWidth
              onClick={handleGenerate}
              disabled={generating[field] || isLimitReached || isPromptEmpty}
              startIcon={
                generating[field] ? (
                  <CircularProgress size={16} sx={{ color: "white" }} />
                ) : (
                  <AutoFixHighIcon fontSize="small" />
                )
              }
              sx={{
                bgcolor: COLORS.generateBg,
                color: "white",
                textTransform: "none",
                fontWeight: 700,
                py: 1,
                borderRadius: "8px",
                "&:hover": { bgcolor: COLORS.generateBgHover },
                "&.Mui-disabled": { bgcolor: "#e0decf", color: "#a3a396" },
              }}
            >
              {generating[field]
                ? "Generating…"
                : isLimitReached
                  ? "Rewrite limit reached (3/3)"
                  : `Generate version ${versions.length + 1}`}
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            position: { md: "sticky" },
            top: { md: 16 },
          }}
        >
          <Box
            sx={{
              bgcolor: COLORS.card,
              border: `1px solid ${COLORS.finalBorder}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "#6b7280",
                  fontWeight: 600,
                  fontFamily: "monospace, sans-serif",
                }}
              >
                FINAL {FIELD_META[field].label.toUpperCase()}
              </Typography>
              <Chip
                icon={
                  <CheckIcon
                    sx={{ fontSize: 13, color: `#1b4d3e !important` }}
                  />
                }
                label="PREVIEW"
                size="small"
                sx={{
                  bgcolor: "#e2f0e7",
                  color: "#1b4d3e",
                  fontWeight: 700,
                  fontSize: 11,
                  borderRadius: "5px",
                  height: 22,
                  fontFamily: "monospace, sans-serif",
                  letterSpacing: "0.05em",
                }}
              />
            </Box>

            {field === "features" ? (
              <Box>
                <Box
                  sx={{ display: "flex", gap: 1, mb: 1.5, color: "#8a6d1f" }}
                >
                  <EmojiObjectsOutlinedIcon fontSize="small" />
                  <Typography sx={{ fontSize: 13 }}>
                    Checkboxes in each version let you mix bullets from
                    different versions.
                  </Typography>
                </Box>
                {finalPreview.length > 0 ? (
                  finalPreview.map((b, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.75,
                      }}
                    >
                      <Typography sx={{ fontSize: 15 }}>• {b.text}</Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: COLORS.muted,
                          whiteSpace: "nowrap",
                          ml: 1,
                        }}
                      >
                        V{b.version}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontStyle: "italic",
                      fontSize: 14,
                    }}
                  >
                    Check bullets from a version to build your final feature
                    list.
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography
                sx={{ fontSize: 15, whiteSpace: "pre-line", minHeight: 60 }}
              >
                {finalPreview || (
                  <span style={{ color: COLORS.muted, fontStyle: "italic" }}>
                    Select a version on the left to preview it here.
                  </span>
                )}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Typography sx={{ fontSize: 12, color: COLORS.muted }}>
                {field === "features"
                  ? `${finalPreview.length} bullets • ${finalCharCount} characters`
                  : `${finalCharCount} characters`}
              </Typography>
              <Button
                onClick={handleApply}
                disabled={applying[field]}
                endIcon={
                  applying[field] ? (
                    <CircularProgress size={14} sx={{ color: "white" }} />
                  ) : (
                    <CheckIcon fontSize="small" />
                  )
                }
                sx={{
                  bgcolor: COLORS.applyBg,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  "&:hover": { bgcolor: COLORS.applyBgHover },
                }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
