import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DotLoading from "../Loading/DotLoading";
import AiBadge from "./AiBadge";
import { UI } from "./uiTokens";

export default function ProductCardGrid({
  sidebarFilteredProducts,
  filteredProducts,
  loading,
  page,
  rowsPerPage,
  wishlist,
  // toggleWishlist,
  handleDeleteProduct,
}) {
  return (
            <Box sx={{ width: "100%" }}>
              {loading ? (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <DotLoading />
                </Box>
              ) : filteredProducts.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Typography>No Data Found</Typography>
                </Box>
              ) : (
                <Grid 
  container 
  spacing={2} 
  sx={{ 
    width: "100%",
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
      lg: "repeat(4, 1fr)",
    },
    gap: 2,
  }}
>
                  {sidebarFilteredProducts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((product) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={product.id}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Card
                          sx={{
                            width: "100%",
                            maxWidth: 280,
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            backgroundColor: "#fff",
                            border: `1px solid ${UI.border}`,
                            borderRadius: "14px",
                            boxShadow: "none",
                            overflow: "hidden",
                            transition: "box-shadow 0.2s, transform 0.15s",
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: "0 10px 26px 0 rgba(17,24,39,0.10)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Link
                            to={`/details/${product.id}`}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <Box
                                sx={{
                                  height: 190,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#f6f7f2",
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={
                                    product.image_url &&
                                    (product.image_url.startsWith("http://") ||
                                      product.image_url.startsWith("https://"))
                                      ? product.image_url
                                      : "https://placehold.co/220x220?text=No+Img"
                                  }
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/220x220?text=No+Img";
                                  }}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </Box>

                              {/* AI badge, top-left, replaces status */}
                              {/* <Box sx={{ position: "absolute", top: 10, left: 10 }}>
                                <AiBadge used={!!product.ai_used} size="card" />
                              </Box> */}
                            </Box>

                            <CardContent
                              sx={{
                                flex: 1,
                                p: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.5,
                                paddingBottom: "16px !important",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  color: UI.muted,
                                  fontWeight: 600,
                                }}
                              >
                                {product.brand_name || "N/A"}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 13.5,
                                  fontWeight: 600,
                                  color: UI.ink,
                                  lineHeight: 1.35,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  minHeight: "36px",
                                }}
                              >
                                {product.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: UI.accent,
                                  mt: 0.25,
                                }}
                              >
                                ${product.price}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: UI.muted,
                                    fontFamily: "monospace, sans-serif",
                                  }}
                                >
                                  SKU: {product.sku}
                                </Typography>
                                <AiBadge used={!!product.ai_used} size="card" />
                              </Box>
                            </CardContent>
                          </Link>

                          {/* Wishlist Icon */}
                          {/* <IconButton
                            onClick={() => toggleWishlist(product.id)}
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              width: 30,
                              height: 30,
                              backgroundColor: wishlist.has(product.id)
                                ? UI.accent
                                : "#fff",
                              color: wishlist.has(product.id) ? "#fff" : "#000",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              "&:hover": {
                                backgroundColor: wishlist.has(product.id)
                                  ? UI.accentHover
                                  : "#f0f0f0",
                              },
                            }}
                          >
                            {wishlist.has(product.id) ? (
                              <FavoriteIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton> */}

                          {/* Delete Icon */}
                          {/* <IconButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteProduct(product.id);
                            }}
                            sx={{
                              position: "absolute",
                              bottom: 10,
                              right: 10,
                              width: 28,
                              height: 28,
                              backgroundColor: "#fff",
                              color: UI.faint,
                              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              "&:hover": { color: "#b91c1c" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 15 }} />
                          </IconButton> */}
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
  );
}