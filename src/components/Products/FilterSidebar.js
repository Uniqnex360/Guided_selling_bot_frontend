import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Divider,
  Grid,
  Chip,
  Slider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { UI } from "./uiTokens";

export default function FilterSidebar({
  sidebarCategories,
  sidebarSelected,
  sidebarCategorySearch,
  sidebarShowAll,
  showCategorySearch,
  showAllCategories,
  sidebarBrands,
  sidebarBrandSelected,
  sidebarBrandSearch,
  showBrandSearch,
  showAllBrands,
  sidebarMinPrice,
  sidebarMaxPrice,
  sidebarPriceRange,
  handleSidebarCategorySearchChange,
  handleSidebarCategorySelect,
  handleSidebarBrandSearchChange,
  handleSidebarBrandSelect,
  handleClearFilters,
  setShowCategorySearch,
  setSidebarCategorySearch,
  setShowAllCategories,
  setShowBrandSearch,
  setSidebarBrandSearch,
  setShowAllBrands,
  setSidebarSelected,
  setSidebarBrandSelected,
  setSidebarShowAll,
  setSidebarPriceRange,
}) {
  return (
      <Box
        sx={{
          width: 220,
          backgroundColor: "#fff",
          borderRight: `1px solid ${UI.border}`,
          padding: 2,
          overflow: "auto",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.2,
          fontFamily: "Roboto, Arial, sans-serif",
        }}
      >
        <Box
          sx={{
            mb: 1.2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "8px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: "14px",
              color: "#333",
              fontFamily: "Roboto, Arial, sans-serif",
            }}
          >
            FILTERS
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={handleClearFilters}
            sx={{
              textTransform: "none",
              fontSize: "13px",
              padding: "4px 8px",
              color: "#2563EB",
              fontWeight: "bold",
              fontFamily: "Roboto, Arial, sans-serif",
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                color: "#1e4baf",
              },
            }}
          >
            CLEAR ALL
          </Button>
        </Box>

        {/* Sidebar Categories Section */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              height: 36,
            }}
          >
            {!showCategorySearch && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "13px",
                    color: "#333",
                    fontFamily: "Roboto, Arial, sans-serif",
                    flex: 1,
                    zIndex: 1,
                  }}
                >
                  Categories
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowCategorySearch(true)}
                  sx={{
                    ml: 1,
                    p: 0.5,
                    background: "#f6f6f6",
                    "&:hover": { background: "#ececec" },
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </>
            )}
            {showCategorySearch && (
              <TextField
                autoFocus
                placeholder="Search for Category"
                variant="outlined"
                size="small"
                value={sidebarCategorySearch}
                onChange={handleSidebarCategorySearchChange}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: 32,
                  background: "#f6f6f6",
                  borderRadius: "18px",
                  fontFamily: "Roboto, Arial, sans-serif",
                  mr: 1,
                  mb: 2,
                  zIndex: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "18px",
                    fontSize: 12,
                    paddingRight: 0,
                    background: "#f6f6f6",
                    border: "none",
                    height: 32,
                  },
                  "& fieldset": { border: "none" },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSidebarCategorySearch("");
                        setShowCategorySearch(false);
                      }}
                      sx={{
                        mr: 0.5,
                        color: "#bdbdbd",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            )}
          </Box>
          <Box sx={{ mt: 1 }}>
            <FormGroup>
              {(sidebarShowAll
                ? sidebarCategories.filter(
                    (c) =>
                      !sidebarCategorySearch ||
                      c.name
                        .toLowerCase()
                        .includes(sidebarCategorySearch.toLowerCase()),
                  )
                : sidebarCategories
                    .filter(
                      (c) =>
                        !sidebarCategorySearch ||
                        c.name
                          .toLowerCase()
                          .includes(sidebarCategorySearch.toLowerCase()),
                    )
                    .slice(0, 5)
              ).map((category) => (
                <FormControlLabel
                  key={category.id}
                  control={
                    <Checkbox
                      checked={sidebarSelected.has(category.name)}
                      onChange={() =>
                        handleSidebarCategorySelect(category.name)
                      }
                      size="small"
                      sx={{
                        color: "#2563EB",
                        "&.Mui-checked": { color: "#2563EB" },
                        p: "0px",
                        fontSize: 16,
                        "& .MuiSvgIcon-root": { fontSize: 16 },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#222",
                        fontWeight: 500,
                        fontFamily: "Roboto, Arial, sans-serif",
                        ml: 2,
                      }}
                    >
                      {category.name}{" "}
                      <span style={{ color: "#888", fontWeight: 400 }}>
                        ({category.count})
                      </span>
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    py: 0.1,
                    pl: 0.5,
                    minHeight: 20,
                    ml: 1,
                  }}
                />
              ))}
            </FormGroup>
            {sidebarCategories.length > 5 && !sidebarShowAll && (
              <Button
                variant="text"
                size="small"
                onClick={() => setShowAllCategories(true)}
                sx={{
                  color: "#2563EB",
                  fontSize: 12,
                  mt: 0.3,
                  textTransform: "none",
                  pl: 0,
                  fontWeight: 600,
                  fontFamily: "Roboto, Arial, sans-serif",
                }}
              >
                {`+ ${sidebarCategories.length - 5} View all categories`}
              </Button>
            )}
          </Box>
        </Box>

        {/* Dialog for all categories (Sidebar) */}
        <Dialog
          open={showAllCategories}
          onClose={() => setShowAllCategories(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 15 }}>
                Select Categories
              </Typography>
              <IconButton onClick={() => setShowAllCategories(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search categories..."
              variant="outlined"
              value={sidebarCategorySearch}
              onChange={handleSidebarCategorySearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <DialogContent dividers sx={{ p: 0, maxHeight: "60vh" }}>
            {(() => {
              const grouped = {};
              sidebarCategories
                .filter(
                  (c) =>
                    !sidebarCategorySearch ||
                    c.name
                      .toLowerCase()
                      .includes(sidebarCategorySearch.toLowerCase()),
                )
                .forEach((category) => {
                  const letter = category.name?.charAt(0)?.toUpperCase() || "";
                  if (!grouped[letter]) grouped[letter] = [];
                  grouped[letter].push(category);
                });
              const letters = Object.keys(grouped).sort();

              return letters.length > 0 ? (
                letters.map((letter) => (
                  <Box key={letter}>
                    <Box sx={{ p: 0.2, backgroundColor: "#f5f5f5" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {letter}
                      </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={-10}>
                      {grouped[letter].map((category) => (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={sidebarSelected.has(category.name)}
                                onChange={() =>
                                  handleSidebarCategorySelect(category.name)
                                }
                                color="primary"
                              />
                            }
                            label={
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: 11,
                                    pl: 0.5,
                                    pb: 0,
                                  }}
                                >
                                  {category.name}
                                </Typography>
                                {category.count !== undefined && (
                                  <Chip
                                    label={`${category.count}`}
                                    size="small"
                                    sx={{ ml: 1, height: 18, fontSize: 11 }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{
                              px: 1,
                              py: 0.5,
                              width: "100%",
                              m: 0,
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography>
                    No categories match your search criteria
                  </Typography>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSidebarSelected(new Set());
                setSidebarCategorySearch("");
              }}
              color="error"
              variant="outlined"
              sx={{ fontSize: 12 }}
            >
              Reset
            </Button>
            <Button
              onClick={() => setShowAllCategories(false)}
              color="primary"
              variant="contained"
              sx={{ fontSize: 12 }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: 1 }} />
        {/* Brands Section (Sidebar) */}

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              height: 36,
            }}
          >
            {!showBrandSearch && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "13px",
                    color: "#333",
                    fontFamily: "Roboto, Arial, sans-serif",
                    flex: 1,
                    zIndex: 1,
                  }}
                >
                  Brands
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowBrandSearch(true)}
                  sx={{
                    ml: 1,
                    p: 0.5,
                    background: "#f6f6f6",
                    "&:hover": { background: "#ececec" },
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </>
            )}
            {showBrandSearch && (
              <TextField
                autoFocus
                placeholder="Search for Brand"
                variant="outlined"
                size="small"
                value={sidebarBrandSearch}
                onChange={handleSidebarBrandSearchChange}
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: 32,
                  background: "#f6f6f6",
                  borderRadius: "18px",
                  fontFamily: "Roboto, Arial, sans-serif",
                  mr: 1,
                  mb: 2,
                  zIndex: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "18px",
                    fontSize: 12,
                    paddingRight: 0,
                    background: "#f6f6f6",
                    border: "none",
                    height: 32,
                  },
                  "& fieldset": { border: "none" },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSidebarBrandSearch("");
                        setShowBrandSearch(false);
                      }}
                      sx={{
                        mr: 0.5,
                        color: "#bdbdbd",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            )}
          </Box>
          <Box sx={{ mt: 1 }}>
            <FormGroup>
              {sidebarBrands
                .filter(
                  (b) =>
                    !sidebarBrandSearch ||
                    b.name
                      .toLowerCase()
                      .includes(sidebarBrandSearch.toLowerCase()),
                )
                .slice(0, 5)
                .map((brand) => (
                  <FormControlLabel
                    key={brand.id}
                    control={
                      <Checkbox
                        checked={sidebarBrandSelected.has(brand.name)}
                        onChange={() => handleSidebarBrandSelect(brand.name)}
                        size="small"
                        sx={{
                          color: "#2563EB",
                          "&.Mui-checked": { color: "#2563EB" },
                          p: "0px",
                          fontSize: 16,
                          "& .MuiSvgIcon-root": { fontSize: 16 },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#222",
                          fontWeight: 500,
                          fontFamily: "Roboto, Arial, sans-serif",
                          ml: 2,
                        }}
                      >
                        {brand.name}{" "}
                        <span style={{ color: "#888", fontWeight: 400 }}>
                          ({brand.count})
                        </span>
                      </Typography>
                    }
                    sx={{
                      m: 0,
                      py: 0.1,
                      pl: 0.5,
                      minHeight: 20,
                      ml: 1,
                    }}
                  />
                ))}
            </FormGroup>
            {sidebarBrands.length > 5 && (
              <Button
                variant="text"
                size="small"
                onClick={() => setShowAllBrands(true)}
                sx={{
                  color: "#2563EB",
                  fontSize: 12,
                  mt: 0.3,
                  textTransform: "none",
                  pl: 0,
                  fontWeight: 600,
                  fontFamily: "Roboto, Arial, sans-serif",
                }}
              >
                {`+ ${sidebarBrands.length - 5} View all brands`}
              </Button>
            )}
          </Box>
        </Box>

        {/* Dialog for all brands */}
        <Dialog
          open={showAllBrands}
          onClose={() => setShowAllBrands(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          <DialogTitle sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 15 }}>
                Select Brands
              </Typography>
              <IconButton onClick={() => setShowAllBrands(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search brands..."
              variant="outlined"
              value={sidebarBrandSearch}
              onChange={handleSidebarBrandSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <DialogContent dividers sx={{ p: 0, maxHeight: "60vh" }}>
            {(() => {
              const grouped = {};
              sidebarBrands
                .filter(
                  (b) =>
                    !sidebarBrandSearch ||
                    b.name
                      .toLowerCase()
                      .includes(sidebarBrandSearch.toLowerCase()),
                )
                .forEach((brand) => {
                  const letter = brand.name?.charAt(0)?.toUpperCase() || "";
                  if (!grouped[letter]) grouped[letter] = [];
                  grouped[letter].push(brand);
                });
              const letters = Object.keys(grouped).sort();

              return letters.length > 0 ? (
                letters.map((letter) => (
                  <Box key={letter}>
                    <Box sx={{ p: 0.2, backgroundColor: "#f5f5f5" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {letter}
                      </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={-10}>
                      {grouped[letter].map((brand) => (
                        <Grid item xs={12} sm={6} md={4} key={brand.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={sidebarBrandSelected.has(brand.name)}
                                onChange={() =>
                                  handleSidebarBrandSelect(brand.name)
                                }
                                size="small"
                                color="primary"
                              />
                            }
                            label={
                              <Box display="flex" alignItems="center">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: 11,
                                    pl: 0.5,
                                    pb: 0,
                                  }}
                                >
                                  {brand.name}
                                </Typography>
                                {brand.count !== undefined && (
                                  <Chip
                                    label={`${brand.count} `}
                                    size="small"
                                    sx={{ ml: 1, height: 18, fontSize: 11 }}
                                  />
                                )}
                              </Box>
                            }
                            sx={{
                              px: 1,
                              py: 0.5,
                              width: "100%",
                              m: 0,
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography>No brands match your search criteria</Typography>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setSidebarBrandSelected(new Set());
                setSidebarBrandSearch("");
              }}
              color="error"
              variant="outlined"
              sx={{ fontSize: 12 }}
            >
              Reset
            </Button>
            <Button
              onClick={() => setShowAllBrands(false)}
              color="primary"
              variant="contained"
              sx={{ fontSize: 12 }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        <Divider sx={{ my: -1 }} />
        {/* Price Range Section */}
        <Box sx={{ mb: 1, mt: 3 }}>
          <Box
            sx={{
              fontWeight: "bold",
              fontSize: 13,
              mb: 0.5,
              color: "#333",
              fontFamily: "Roboto, Arial, sans-serif",
            }}
          >
            Price
          </Box>
          <Slider
            value={sidebarPriceRange}
            onChange={(event, newValue) => setSidebarPriceRange(newValue)}
            valueLabelDisplay="off"
            min={sidebarMinPrice}
            max={sidebarMaxPrice}
            sx={{
              color: "#2563EB",
              height: 4,
              mt: 0.5,
              "& .MuiSlider-thumb": {
                width: 18,
                height: 18,
                backgroundColor: "#fff",
                border: "2px solid #2563EB",
                boxShadow: "0 2px 6px 0 rgba(0,0,0,0.15)",
              },
              "& .MuiSlider-rail": { backgroundColor: "#f6f6f6" },
              "& .MuiSlider-track": { backgroundColor: "#2563EB" },
            }}
          />
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mt: 0.1 }}
          >
            <Typography sx={{ fontSize: 12, color: "#222", fontWeight: 400 }}>
              ${sidebarPriceRange[0]}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#222", fontWeight: 400 }}>
              ${sidebarPriceRange[1]}
            </Typography>
          </Box>
        </Box>
      </Box>
  );
}