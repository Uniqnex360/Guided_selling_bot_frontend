import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DotLoading from "../Loading/DotLoading";
import AiBadge from "./AiBadge";
import { UI } from "./uiTokens";

export default function ProductTable({
  sidebarFilteredProducts,
  handleSidebarSort,
  sidebarSortConfig,
  loading,
  page,
  rowsPerPage,
  handleDeleteProduct,
}) {
  return (
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: "100%",
                border: `1px solid ${UI.border}`,
                borderRadius: "12px",
                boxShadow: "none",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      { label: "Product" },
                      { label: "SKU" },
                      { label: "Category", key: "category" },
                      { label: "Brand", key: "brand_name" },
                      { label: "Price", key: "price" },
                      { label: "AI Generated", key: "ai_used" },
                      { label: "" },
                    ].map((col, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          textAlign: index === 0 ? "left" : "center",
                          cursor: col.key ? "pointer" : "default",
                          fontWeight: 600,
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: UI.muted,
                          backgroundColor: "#fafbf7",
                          borderBottom: `1px solid ${UI.border}`,
                        }}
                        onClick={
                          col.key ? () => handleSidebarSort(col.key) : undefined
                        }
                      >
                        {col.label}{" "}
                        {col.key
                          ? sidebarSortConfig.key === col.key
                            ? sidebarSortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <DotLoading />
                      </TableCell>
                    </TableRow>
                  ) : sidebarFilteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No Data Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sidebarFilteredProducts
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((product) => (
                        <TableRow
                          key={product.id}
                          hover
                          sx={{
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          <TableCell
                            sx={{
                              borderBottom: `1px solid ${UI.border}`,
                              maxWidth: 340,
                            }}
                          >
                            <Link
                              to={`/details/${product.id}?page=${page}`}
                              style={{
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <img
                                src={
                                  product.image_url &&
                                  (product.image_url.startsWith("http://") ||
                                    product.image_url.startsWith("https://"))
                                    ? product.image_url
                                    : "https://placehold.co/44x44?text=No+Img"
                                }
                                alt={product.name}
                                style={{
                                  width: "44px",
                                  height: "44px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: `1px solid ${UI.border}`,
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/44x44?text=No+Img";
                                }}
                              />
                              <Typography
                                sx={{
                                  fontSize: 13.5,
                                  color: UI.ink,
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {product.name}
                              </Typography>
                            </Link>
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderBottom: `1px solid ${UI.border}`,
                              color: UI.muted,
                              fontSize: 12.5,
                            }}
                          >
                            {product.sku}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderBottom: `1px solid ${UI.border}`,
                              color: UI.ink,
                              fontSize: 13,
                            }}
                          >
                            {product.category}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderBottom: `1px solid ${UI.border}`,
                              color: UI.ink,
                              fontSize: 13,
                            }}
                          >
                            {product.brand_name || "N/A"}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderBottom: `1px solid ${UI.border}`,
                              color: UI.accent,
                              fontWeight: 700,
                              fontSize: 13.5,
                            }}
                          >
                            ${product.price}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              borderBottom: `1px solid ${UI.border}`,
                            }}
                          >
                            <AiBadge used={!!product.ai_used} size="table" />
                          </TableCell>
                          
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
  );
}