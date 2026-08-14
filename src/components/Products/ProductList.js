import React, { useEffect, useState, useCallback } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import MinimizeOutlinedIcon from "@mui/icons-material/MinimizeOutlined";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import ImportProducts from "./ImportProducts";

import DeleteProducts from "./DeleteProducts";

import {
  Typography,
  Box,
  TextField,
  IconButton,
  Button,
  Tooltip,
  FormControlLabel,
  Select,
  MenuItem,
  Checkbox,
  Dialog,
  DialogActions,
  InputAdornment,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import TablePagination from "@mui/material/TablePagination";
import {
  ListAlt as ListAltIcon,
  GridView as GridViewIcon,
} from "@mui/icons-material";
import { API_BASE_URL } from "../../utils/config";
import SearchIcon from "@mui/icons-material/Search";
import { UI } from "./uiTokens";
import FilterSidebar from "./FilterSidebar";
import ProductTable from "./ProductTable";
import ProductCardGrid from "./ProductCardGrid";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [sortConfig, setSortConfig] = useState({
    key: "sku",
    direction: "asc",
  });
  const [loading, setLoading] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [importOpen, setImportOpen] = useState(false);

  
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const [selectedFilters, setSelectedFilters] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const queryParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(queryParams.get("page"), 10) || 0;
  const [page, setPage] = useState(initialPage);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [maximized, setMaximized] = useState(true);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(140);
  const [priceRange, setPriceRange] = useState([0, 140]);
  const [allBrandOptions, setAllBrandOptions] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [categorySearch, setCategorySearch] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showBrandSearch, setShowBrandSearch] = useState(false);
  const [showCategorySearch, setShowCategorySearch] = useState(false);
  const [brandSortBy, setBrandSortBy] = useState("name");
  const [brandProductCountFilter, setBrandProductCountFilter] = useState("all");

  
  const [sidebarCategories, setSidebarCategories] = useState([]);
  const [sidebarSelected, setSidebarSelected] = useState(new Set());
  const [sidebarCategorySearch, setSidebarCategorySearch] = useState("");
  const [sidebarShowAll, setSidebarShowAll] = useState(false);
  

  const [sidebarBrands, setSidebarBrands] = useState([]);
  const [sidebarBrandSelected, setSidebarBrandSelected] = useState(new Set());
  const [sidebarBrandSearch, setSidebarBrandSearch] = useState("");

  const [sidebarMinPrice, setSidebarMinPrice] = useState(0);
  const [sidebarMaxPrice, setSidebarMaxPrice] = useState(1000);
  const [sidebarPriceRange, setSidebarPriceRange] = useState([0, 1000]);

  const [sidebarSortConfig, setSidebarSortConfig] = useState({
    key: "null",
    direction: "asc",
  });
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);

  let sidebarFilteredProducts = products;

  
  
  if (sidebarBrandSelected.size > 0 || sidebarSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter(
      (p) =>
        sidebarBrandSelected.has(p.brand_name) ||
        sidebarSelected.has(p.category_id) ||
        sidebarSelected.has(p.category),
    );
  } else if (sidebarBrandSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter((p) =>
      sidebarBrandSelected.has(p.brand_name),
    );
  } else if (sidebarSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter(
      (p) =>
        sidebarSelected.has(p.category_id) || sidebarSelected.has(p.category),
    );
  }

  
  sidebarFilteredProducts = sidebarFilteredProducts.filter(
    (p) =>
      (!sidebarPriceRange[0] || p.price >= sidebarPriceRange[0]) &&
      (!sidebarPriceRange[1] || p.price <= sidebarPriceRange[1]),
  );

  
  if (sidebarSortConfig.key) {
    sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => {
      if (a[sidebarSortConfig.key] < b[sidebarSortConfig.key])
        return sidebarSortConfig.direction === "asc" ? -1 : 1;
      if (a[sidebarSortConfig.key] > b[sidebarSortConfig.key])
        return sidebarSortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  
  const handleSidebarSort = (key) => {
    setSidebarSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  
  const getFilteredSortedBrands = () => {
    let brands = allBrandOptions.filter(
      (b) =>
        !brandSearch ||
        b.name.toLowerCase().includes(brandSearch.toLowerCase()),
    );

    
    brands = brands.filter((brand) => {
      if (brandProductCountFilter === "high") return (brand.count || 0) > 50;
      if (brandProductCountFilter === "medium")
        return (brand.count || 0) > 10 && (brand.count || 0) <= 50;
      if (brandProductCountFilter === "low") return (brand.count || 0) <= 10;
      return true;
    });

    
    brands = [...brands].sort((a, b) => {
      if (brandSortBy === "name") return a.name.localeCompare(b.name);
      if (brandSortBy === "count") return (b.count || 0) - (a.count || 0);
      return 0;
    });

    return brands;
  };
  useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 400);

  return () => {
    clearTimeout(handler);
  };
}, [searchQuery]);
  const fetchSidebarCategories = (search = "") => {
    fetch(`${API_BASE_URL}/fetch_categories/?q=${encodeURIComponent(search)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setSidebarCategories(data.categories || []);
      })
      .catch((error) => {
        console.error("Error fetching sidebar categories:", error);
      });
  };

  const fetchSidebarBrands = (search = "") => {
    fetch(`${API_BASE_URL}/fetch_brands/?q=${encodeURIComponent(search)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setSidebarBrands(data.brands || []);
      })
      .catch((error) => {
        console.error("Error fetching sidebar brands:", error);
      });
  };

  const fetchSidebarPriceRange = (categoryId = "") => {
    let url = `${API_BASE_URL}/fetch_price_range/?`;
    if (categoryId) url += `category_id=${encodeURIComponent(categoryId)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSidebarMinPrice(data.min_price ?? 0);
        setSidebarMaxPrice(data.max_price ?? 0);
        setSidebarPriceRange([data.min_price ?? 0, data.max_price ?? 0]);
      })
      .catch(() => {
        setSidebarMinPrice(0);
        setSidebarMaxPrice(0);
        setSidebarPriceRange([0, 0]);
      });
  };

  const groupBrandsByLetter = (brands) => {
    const grouped = {};
    brands.forEach((brand) => {
      const letter = brand.name?.charAt(0)?.toUpperCase() || "";
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(brand);
    });
    return grouped;
  };

  const groupedBrands = groupBrandsByLetter(getFilteredSortedBrands());

  const handleSidebarBrandSearchChange = (e) => {
    setSidebarBrandSearch(e.target.value);
  };

  

  const handleDeleteProduct = (productId) => {
    setDeleteProductId(productId);
  };
  const handleProductDeleted = () => {
    setSnackbarMessage("Product deleted successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setDeleteProductId(null);
    fetchProducts();
    fetchSidebarCategories(sidebarCategorySearch);
    fetchSidebarBrands(sidebarBrandSearch);
  };

  
//   const toggleWishlist = (productId) => {
//     setWishlist((prevWishlist) => {
//       const newWishlist = new Set(prevWishlist);
//       if (newWishlist.has(productId)) {
//         newWishlist.delete(productId);
//       } else {
//         newWishlist.add(productId);
//       }
//       return newWishlist;
//     });
//   };

  const handleSidebarCategorySearchChange = (e) => {
    setSidebarCategorySearch(e.target.value);
  };
  const handleSidebarBrandSelect = (brandName) => {
    setSidebarBrandSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brandName)) {
        newSet.delete(brandName);
      } else {
        newSet.add(brandName);
      }
      setSelectedBrands(new Set(newSet));
      return newSet;
    });
  };

  const handleSidebarCategorySelect = (categoryName) => {
    setSidebarSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      setSelectedCategories(new Set(newSet));
      if (newSet.size === 1) setSelectedCategoryId(Array.from(newSet)[0]);
      else setSelectedCategoryId("");
      return newSet;
    });
  };

  
  const toggleDialogSize = () => setMaximized((prev) => !prev);

  const getSortSymbol = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "↕";
  };

  
  const getAppliedFilterChips = useCallback(() => {
    const chips = [];

    const addChip = (chip) => {
      if (!chips.some((c) => c.label === chip.label)) {
        chips.push(chip);
      }
    };

    Array.from(selectedCategories).forEach((id) => {
      const category = categoryOptions.find((c) => c.id === id);
      if (category) {
        addChip({
          key: `category-${id}`,
          label: `${category.name}`,
          type: "Category",
          value: id,
        });
      }
    });

    Array.from(sidebarSelected).forEach((name) => {
      const category =
        sidebarCategories.find((c) => c.name === name) ||
        categoryOptions.find((c) => c.name === name);
      if (
        category &&
        !selectedCategories.has(category.id) &&
        !chips.some(
          (c) =>
            c.label === category.name || c.key === `category-${category.id}`,
        )
      ) {
        addChip({
          key: `category-${name}`,
          label: category.name,
          type: "SidebarCategory",
          value: name,
        });
      }
    });

    Array.from(new Set([...selectedBrands, ...sidebarBrandSelected])).forEach(
      (name) => {
        const brand =
          sidebarBrands.find((b) => b.name === name) ||
          allBrandOptions.find((b) => b.name === name);
        if (brand) {
          addChip({
            key: `brand-${name}`,
            label: brand.name,
            type: "Brand",
            value: name,
          });
        }
      },
    );

    if (
      sidebarPriceRange[0] !== sidebarMinPrice ||
      sidebarPriceRange[1] !== sidebarMaxPrice
    ) {
      chips.push({
        key: "sidebar-price",
        label: `$${sidebarPriceRange[0]} - $${sidebarPriceRange[1]}`,
        type: "SidebarPriceRange",
        value: null,
      });
    }

    Array.from(selectedBrands).forEach((name) => {});

    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
      addChip({
        key: "price",
        label: `$${priceRange[0]} - $${priceRange[1]}`,
        type: "Price Range",
        value: null,
      });
    }

    Object.entries(selectedFilters).forEach(([filterName, values]) => {
      if (values.length > 0) {
        values.forEach((value) => {
          addChip({
            key: `attr-${filterName}-${value}`,
            label: `${filterName}: ${value}`,
            type: "Attribute",
            filterName: filterName,
            value: value,
          });
        });
      }
    });

    return chips;
  }, [
    sidebarSelected,
    sidebarCategories,
    sidebarBrandSelected,
    sidebarBrands,
    sidebarPriceRange,
    sidebarMinPrice,
    sidebarMaxPrice,
    selectedCategories,
    categoryOptions,
    selectedBrands,
    allBrandOptions,
    priceRange,
    minPrice,
    maxPrice,
    selectedFilters,
    searchQuery,
  ]);

  const handleRemoveFilter = (filterType, value, filterName = null) => {
    if (filterType === "SidebarCategory" || filterType === "Category") {
      let categoryId = value;
      if (filterType === "SidebarCategory") {
        const category = categoryOptions.find((c) => c.name === value);
        if (category) categoryId = category.id;
      }
      setSelectedCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(categoryId);
        return newSet;
      });
      const category = categoryOptions.find((c) => c.id === categoryId);
      if (category) {
        setSidebarSelected((prev) => {
          const newSet = new Set(prev);
          newSet.delete(category.name);
          return newSet;
        });
      }
    } else if (filterType === "SidebarBrand" || filterType === "Brand") {
      setSidebarBrandSelected((prev) => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
      });
      setSelectedBrands((prev) => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
      });
    } else if (filterType === "SidebarPriceRange") {
      setSidebarPriceRange([sidebarMinPrice, sidebarMaxPrice]);
    } else if (filterType === "Attribute" && filterName) {
      setSelectedFilters((prev) => {
        const newFilters = { ...prev };
        newFilters[filterName] = newFilters[filterName].filter(
          (v) => v !== value,
        );
        if (newFilters[filterName].length === 0) {
          delete newFilters[filterName];
        }
        return newFilters;
      });
    } else if (filterType === "Price Range") {
      setPriceRange([minPrice, maxPrice]);
    } else if (filterType === "Search Query") {
      setSearchQuery("");
    }
  };

  const fetchCategories = () => {
    fetch(`${API_BASE_URL}/fourth_level_categories/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setCategoryOptions(data.data.categories || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  };

  const fetchFilters = (categoryId) => {
    setLoading(true);
    fetch(`${API_BASE_URL}/category_filters/?category_id=${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Filter fetch error:", data.error);
          setCategoryFilters([]);
          setLoading(false);
          return;
        }
        const filters = data.data.filters;
        const filtersWithCheckbox = filters.map((filter) => ({
          ...filter,
          options: filter.config.options.map((option) => ({
            label: option.toString().trim(),
            checked: false,
          })),
        }));

        setCategoryFilters(filtersWithCheckbox);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching filters:", error);
        setLoading(false);
      });
  };

  const handleDialogCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);
    setSelectedCategories(new Set([categoryId]));

    const category = categoryOptions.find((c) => c.id === categoryId);
    if (category) {
      setSidebarSelected(new Set([category.name]));
    } else {
      setSidebarSelected(new Set());
    }

    if (categoryId) {
      fetchFilters(categoryId);
      setSnackbarMessage("Category selected successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchProducts();
    }
  };

  const handleDialogFilterChange = (filterName, option) => {
    const newFilters = { ...selectedFilters };
    if (newFilters[filterName]) {
      if (newFilters[filterName].includes(option)) {
        newFilters[filterName] = newFilters[filterName].filter(
          (f) => f !== option,
        );
      } else {
        newFilters[filterName].push(option);
      }
    } else {
      newFilters[filterName] = [option];
    }
    setSelectedFilters(newFilters);
  };

  const handleDialogClearFilters = () => {
    setSelectedCategoryId("");
    setSelectedCategoryName("");
    setSelectedFilters({});
    setCategoryFilters([]);

    setSelectedCategories(new Set());
    setSelectedBrands(new Set());
    setPriceRange([minPrice, maxPrice]);
    setSearchQuery("");

    fetchProducts();

    setSnackbarMessage("Reset successfully!");
    setSnackbarSeverity("Success");
    setSnackbarOpen(true);
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);

    const categoryIds =
      Array.from(selectedCategories).length > 0
        ? Array.from(selectedCategories)
        : selectedCategoryId
          ? [selectedCategoryId]
          : [];

    const requestBody = {
      ...(categoryIds.length > 0 && { category_ids: categoryIds }),
      search_query: searchQuery?.trim() || "",
      ...(selectedBrands.size > 0 && { brands: Array.from(selectedBrands) }),
    };

    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
      requestBody.price_min = priceRange[0];
      requestBody.price_max = priceRange[1];
    }

    if (
      categoryIds.length > 0 &&
      selectedFilters &&
      Object.keys(selectedFilters).length > 0 &&
      Object.values(selectedFilters).some(
        (arr) => Array.isArray(arr) && arr.length > 0,
      )
    ) {
      requestBody.attributes = selectedFilters;
    }

    fetch(`${API_BASE_URL}/productList/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((responseData) => {
        let productList = responseData.data?.products || [];

        const allBrands = [
          ...new Set(productList.map((product) => product.brand_name)),
        ].filter(Boolean);
        const allBrandsWithCount = allBrands.map((brandName) => ({
          id: brandName,
          name: brandName,
          count: productList.filter((p) => p.brand_name === brandName).length,
        }));
        setAllBrandOptions(allBrandsWithCount);

        if (productList.length > 0) {
          const prices = productList.map((p) => p.price);
          const newMinPrice = Math.min(...prices);
          const newMaxPrice = Math.max(...prices);
        } else {
          setMinPrice(0);
          setMaxPrice(0);
          setPriceRange([0, 0]);
        }

        setFilteredProducts(productList);
        setProducts(productList);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        setLoading(false);
      });
  }, [
    selectedCategories,
    selectedCategoryId,
     debouncedSearchQuery,
    searchQuery,
    selectedBrands,
    priceRange,
    minPrice,
    maxPrice,
    selectedFilters,
  ]);

  const handleSidebarCategoryChange = (categoryId) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(categoryId)) {
      newCategories.delete(categoryId);
    } else {
      newCategories.add(categoryId);
    }
    setSelectedCategories(newCategories);

    if (newCategories.size === 1)
      setSelectedCategoryId(Array.from(newCategories)[0]);
    else if (newCategories.size === 0) setSelectedCategoryId("");
    else setSelectedCategoryId("");

    setSnackbarMessage("Category selection updated!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedFilters({});
    setSelectedBrands(new Set());
    setPriceRange([minPrice, maxPrice]);
    setCategoryFilters([]);
    setSearchQuery("");
    setPage(0);
    setSortConfig({ key: "sku", direction: "asc" });
    fetchProducts();

    setSidebarSelected(new Set());
    setSidebarBrandSelected(new Set());
    setSidebarPriceRange([sidebarMinPrice, sidebarMaxPrice]);
    setSidebarCategorySearch("");
    setSidebarBrandSearch("");

    fetchProducts();

    setSnackbarMessage("Filters reset successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const sortProducts = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sorted = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    setFilteredProducts(sorted);
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value) {
      setSelectedCategories(new Set());
      setSelectedCategoryId("");
    }
    setPage(0);
  };

  const handleClearSearch = () => {
    setSelectedCategories(new Set());
    setSelectedCategoryId("");
    setSearchQuery("");
    setPage(0);
    setSortConfig({ key: "sku", direction: "asc" });
    fetchProducts();

    setSnackbarMessage("Search reset successfully!");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  const toggleViewMode = (mode) => setViewMode(mode);

  useEffect(() => {
    fetchProducts();
  }, [
    selectedCategories,
    selectedFilters,
    debouncedSearchQuery,
    searchQuery,
    selectedBrands,
    priceRange,
  ]); 

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSidebarBrands(sidebarBrandSearch);
  }, [sidebarBrandSearch]);

  useEffect(() => {
    fetchSidebarCategories(sidebarCategorySearch);
  }, [sidebarCategorySearch]);

  useEffect(() => {
    const categoryId = Array.from(sidebarSelected)[0] || "";
    fetchSidebarPriceRange(categoryId);
  }, [sidebarSelected]);

  useEffect(() => {
    fetchSidebarCategories(categorySearch);
    
  }, [categorySearch]);

  const appliedChips = getAppliedFilterChips();
  const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);
if (sortConfig.key !== "sku") {
  sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}
  if (appliedChips.length > 0) {
    if (sidebarBrandSelected.size > 0) {
      const selectedArray = Array.from(sidebarBrandSelected);
      sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => {
        const aIdx = selectedArray.indexOf(a.brand_name);
        const bIdx = selectedArray.indexOf(b.brand_name);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return bIdx - aIdx;
      });
    } else if (sidebarSelected.size > 0) {
      sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
        String(b.category).localeCompare(String(a.category)),
      );
    } else {
      const latestChip = appliedChips[appliedChips.length - 1];
      if (
        latestChip.type === "Price Range" ||
        latestChip.type === "SidebarPriceRange"
      ) {
        sidebarFilteredProducts = [...sidebarFilteredProducts].sort(
          (a, b) => b.price - a.price,
        );
      } else if (latestChip.type === "Search Query") {
        sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
          String(b.name).localeCompare(String(a.name)),
        );
      } else if (latestChip.type === "Attribute" && latestChip.filterName) {
        sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
          String(b[latestChip.filterName]).localeCompare(
            String(a[latestChip.filterName]),
          ),
        );
      }
    }
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: UI.page }}>
      {deleteProductId && (
        <DeleteProducts
          productId={deleteProductId}
          onDeleted={handleProductDeleted}
        />
      )}

      {/* Left Sidebar */}
      <FilterSidebar
        sidebarCategories={sidebarCategories}
        sidebarSelected={sidebarSelected}
        sidebarCategorySearch={sidebarCategorySearch}
        sidebarShowAll={sidebarShowAll}
        showCategorySearch={showCategorySearch}
        showAllCategories={showAllCategories}
        sidebarBrands={sidebarBrands}
        sidebarBrandSelected={sidebarBrandSelected}
        sidebarBrandSearch={sidebarBrandSearch}
        showBrandSearch={showBrandSearch}
        showAllBrands={showAllBrands}
        sidebarMinPrice={sidebarMinPrice}
        sidebarMaxPrice={sidebarMaxPrice}
        sidebarPriceRange={sidebarPriceRange}
        handleSidebarCategorySearchChange={handleSidebarCategorySearchChange}
        handleSidebarCategorySelect={handleSidebarCategorySelect}
        handleSidebarBrandSearchChange={handleSidebarBrandSearchChange}
        handleSidebarBrandSelect={handleSidebarBrandSelect}
        handleClearFilters={handleClearFilters}
        setShowCategorySearch={setShowCategorySearch}
        setSidebarCategorySearch={setSidebarCategorySearch}
        setShowAllCategories={setShowAllCategories}
        setShowBrandSearch={setShowBrandSearch}
        setSidebarBrandSearch={setSidebarBrandSearch}
        setShowAllBrands={setShowAllBrands}
        setSidebarSelected={setSidebarSelected}
        setSidebarBrandSelected={setSidebarBrandSelected}
        setSidebarShowAll={setSidebarShowAll}
        setSidebarPriceRange={setSidebarPriceRange}
      />

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Page header */}
        <Box sx={{ px: 3, pt: 3, pb: 1, backgroundColor: UI.page }}>
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: UI.muted,
              fontWeight: 600,
              fontFamily: "monospace, sans-serif",
            }}
          >
            PRODUCT LISTING
          </Typography>
          <Typography
            sx={{
              fontSize: "2rem",
              fontWeight: 400,
              color: UI.ink,
              lineHeight: 1.15,
              mt: 0.25,
            }}
          >
            Products
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: UI.muted, mt: 0.5 }}>
            {sidebarFilteredProducts.length} product
            {sidebarFilteredProducts.length === 1 ? "" : "s"} in your catalogue
          </Typography>
        </Box>

        {/* Toolbar: search / filters / sort / view toggle / import */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            pb: 2,
            gap: 2,
            flexWrap: "wrap",
            backgroundColor: UI.page,
          }}
        >
       <TextField
  placeholder="Search by title, brand, or SKU..."
  variant="outlined"
  size="small"
  value={searchQuery}
  onChange={handleSearchChange}
  sx={{
    flex: "1 1 320px",
    maxWidth: 420,
    background: "#fff",
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontSize: 13,
      background: "#fff",
      "& fieldset": { borderColor: UI.border },
      "&:hover fieldset": { borderColor: "#c9cdc0" },
      "&.Mui-focused fieldset": { borderColor: UI.accent },
    },
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ color: UI.faint, fontSize: 19 }} />
      </InputAdornment>
    ),
    endAdornment: searchQuery ? (
      <InputAdornment position="end">
        <IconButton
          size="small"
          onClick={handleClearSearch}
          sx={{
            color: "#888",
            padding: "2px",
            "&:hover": { color: "#000", backgroundColor: "#f0f0f0" },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </InputAdornment>
    ) : null,
  }}
/>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Button
              variant="outlined"
              startIcon={<TuneIcon sx={{ fontSize: 17 }} />}
              onClick={() => setFiltersOpen((prev) => !prev)}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
                color: UI.ink,
                borderColor: UI.border,
                backgroundColor: "#fff",
                borderRadius: "10px",
                px: 1.75,
                "&:hover": { borderColor: "#c9cdc0", backgroundColor: "#fff" },
              }}
            >
              Filters
            </Button>

            <Select
              value={sortConfig.key === "sku" ? "featured" : sortConfig.key}
              size="small"
              displayEmpty
              onChange={(e) => {
                const v = e.target.value;
                if (v === "featured") {
                  setSortConfig({ key: "sku", direction: "asc" });
                } else {
                  sortProducts(v);
                }
              }}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                borderRadius: "10px",
                backgroundColor: "#fff",
                minWidth: 140,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: UI.border,
                },
              }}
            >
              <MenuItem value="featured" sx={{ fontSize: 13 }}>
                Featured
              </MenuItem>
              <MenuItem value="price" sx={{ fontSize: 13 }}>
                Price
              </MenuItem>
              <MenuItem value="name" sx={{ fontSize: 13 }}>
                Title
              </MenuItem>
              <MenuItem value="brand_name" sx={{ fontSize: 13 }}>
                Brand
              </MenuItem>
            </Select>

            <Box
              sx={{
                display: "flex",
                border: `1px solid ${UI.border}`,
                borderRadius: "10px",
                backgroundColor: "#fff",
                overflow: "hidden",
              }}
            >
              <IconButton
                onClick={() => toggleViewMode("card")}
                sx={{
                  borderRadius: 0,
                  backgroundColor:
                    viewMode === "card" ? UI.page : "transparent",
                  color: UI.ink,
                }}
              >
                <GridViewIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => toggleViewMode("list")}
                sx={{
                  borderRadius: 0,
                  borderLeft: `1px solid ${UI.border}`,
                  backgroundColor:
                    viewMode === "list" ? UI.page : "transparent",
                  color: UI.ink,
                }}
              >
                <ListAltIcon fontSize="small" />
              </IconButton>
            </Box>

            <Button
              variant="outlined"
              onClick={() => setImportOpen(true)}
              sx={{
                minWidth: 0,
                width: 40,
                height: 40,
                borderRadius: "10px",
                borderColor: UI.border,
                backgroundColor: "#fff",
                "&:hover": { borderColor: "#c9cdc0", backgroundColor: "#fff" },
              }}
            >
              <FileDownloadOutlinedIcon sx={{ color: UI.accent }} />
            </Button>
            <ImportProducts
              open={importOpen}
              onClose={() => setImportOpen(false)}
              onSuccess={fetchProducts}
            />
          </Box>
        </Box>

        {/* Applied Filters Section (CHIPS) */}
        {appliedChips.length > 0 && (
          <Box
            sx={{
              px: 3,
              pb: 1.5,
              backgroundColor: UI.page,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {appliedChips.map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() =>
                  handleRemoveFilter(
                    filter.type,
                    filter.value,
                    filter.filterName,
                  )
                }
                size="small"
                sx={{
                  backgroundColor: "#fff",
                  color: "#444",
                  fontWeight: 400,
                  fontSize: "12px",
                  border: `1px solid ${UI.border}`,
                  "& .MuiChip-deleteIcon": {
                    color: "#555",
                    "&:hover": { color: "#000" },
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: "auto", px: 3, pb: 2 }}>
          {viewMode === "list" ? (
            <ProductTable
              sidebarFilteredProducts={sidebarFilteredProducts}
              handleSidebarSort={handleSidebarSort}
              sidebarSortConfig={sidebarSortConfig}
              loading={loading}
              page={page}
              rowsPerPage={rowsPerPage}
              handleDeleteProduct={handleDeleteProduct}
            />
          ) : (
            <ProductCardGrid
              sidebarFilteredProducts={sidebarFilteredProducts}
              filteredProducts={filteredProducts}
              loading={loading}
              page={page}
              rowsPerPage={rowsPerPage}
              wishlist={wishlist}
            //   toggleWishlist={toggleWishlist}
              handleDeleteProduct={handleDeleteProduct}
            />
          )}
        </Box>

        {/* Pagination and Rows per page */}
        <Box
          sx={{
            paddingRight: "35px",
            backgroundColor: "white",
            borderTop: `1px solid ${UI.border}`,
          }}
        >
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={sidebarFilteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            sx={{
              "& .MuiTablePagination-actions": {
                marginRight: "28px",
              },
            }}
          />
        </Box>

        {/* Floating Product Finder Button */}
        <Button
          variant="contained"
          color="primary"
          style={{
            position: "fixed",
            bottom: "15px",
            right: "10px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            fontSize: "24px",
            zIndex: 9999,
          }}
          onClick={() => {
            setShowPopup(true);
            setSearchQuery("");
            setPage(0);
          }}
        >
          ❓
        </Button>

        {/* Product Finder Dialog */}
        <Dialog
          open={showPopup}
          onClose={() => setShowPopup(false)}
          maxWidth={false}
          fullWidth={false}
          hideBackdrop={false}
          PaperProps={{
            style: {
              position: "fixed",
              top: "100px",
              right: "20px",
              margin: 0,
              zIndex: 1300,
              borderRadius: "12px",
              width: isMobile ? "95%" : maximized ? 400 : 250,
              height: isMobile ? "85%" : maximized ? 450 : 60,
              transition: "all 0.3s ease",
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            style={{
              backgroundColor: UI.accent,
              textAlign: "center",
              fontWeight: "bold",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: "40px",
            }}
          >
            <Typography
              sx={{
                marginTop: "5px",
                fontSize: maximized ? "18px" : "14px",
                fontWeight: 600,
                color: "white",
              }}
            >
              Product Finder
            </Typography>

            <Box
              sx={{
                position: "absolute",
                right: 10,
                top: 10,
                display: "flex",
                gap: "4px",
                alignItems: "center",
              }}
            >
              <Tooltip title="Minimize">
                <span>
                  <Button
                    size="small"
                    onClick={() => maximized && toggleDialogSize()}
                    disabled={!maximized}
                    sx={{
                      minWidth: "32px",
                      color: "white",
                      height: "32px",
                      padding: "4px",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MinimizeOutlinedIcon
                      fontSize="small"
                      sx={{ mt: "-6px" }}
                    />
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="Maximize">
                <span>
                  <Button
                    size="small"
                    onClick={() => !maximized && toggleDialogSize()}
                    disabled={maximized}
                    sx={{
                      minWidth: "32px",
                      height: "32px",
                      marginTop: "5px",
                      color: "white",
                      padding: "4px",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CropSquareIcon fontSize="small" />
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="Close">
                <Button
                  onClick={() => setShowPopup(false)}
                  size="small"
                  sx={{
                    marginTop: "5px",
                    color: "white",
                    minWidth: "32px",
                    height: "32px",
                    padding: "4px",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </Button>
              </Tooltip>
            </Box>
          </DialogTitle>

          {maximized && (
            <>
              <DialogContent dividers>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ fontSize: "14px" }}>Category</InputLabel>
                  <Select
                    value={selectedCategoryId}
                    label="Category"
                    onChange={handleDialogCategoryChange}
                    sx={{ fontSize: "14px" }}
                  >
                    {categoryOptions.map((category) => (
                      <MenuItem
                        sx={{ fontSize: "14px" }}
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {categoryFilters.map((filter, index) => (
                  <Accordion key={index}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ backgroundColor: "#cfd3df" }}
                    >
                      <Typography variant="subtitle1" sx={{ fontSize: "14px" }}>
                        {filter.name}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {filter.options.map((option, optionIndex) => (
                        <FormControlLabel
                          key={optionIndex}
                          control={
                            <Checkbox
                              checked={
                                selectedFilters[filter.name]?.includes(
                                  option.label,
                                ) || false
                              }
                              onChange={() =>
                                handleDialogFilterChange(
                                  filter.name,
                                  option.label,
                                )
                              }
                            />
                          }
                          label={option.label}
                          sx={{
                            "& .MuiFormControlLabel-label": {
                              fontSize: "14px",
                            },
                          }}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </DialogContent>

              <DialogActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Tooltip title="Reset All Filters" arrow>
                    <Button
                      variant="text"
                      color="error"
                      onClick={handleDialogClearFilters}
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RestartAltIcon fontSize="small" />
                      Reset All
                    </Button>
                  </Tooltip>

                  <Button onClick={() => setShowPopup(false)} color="primary">
                    Close
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ProductList;