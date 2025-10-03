import React, { useEffect, useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import ImportProducts from "./ImportProducts";
import {
    Typography,
    Box,
    TextField,
    IconButton,
    Paper,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
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
    Slider,
    Divider,
    Chip,
    FormGroup,
    FormControl,
    InputLabel,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import TablePagination from '@mui/material/TablePagination';
import { Link } from 'react-router-dom';
import { ListAlt as ListAltIcon, GridView as GridViewIcon } from '@mui/icons-material';
import DotLoading from '../Loading/DotLoading';
import { API_BASE_URL } from '../../utils/config';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


const ProductList = () => {
    // State variables
    const [products, setProducts] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' });
    const [loading, setLoading] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [wishlist, setWishlist] = useState(new Set());
    const [importOpen, setImportOpen] = useState(false);
    

    
    
    // NOTE: selectedCategoryId/Name are necessary for the *reverted* dialog structure
    const [selectedCategoryId, setSelectedCategoryId] = useState(''); 
    const [selectedCategoryName, setSelectedCategoryName] = useState(''); 
    
    const [selectedFilters, setSelectedFilters] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const queryParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(queryParams.get('page'), 10) || 0;
    const [page, setPage] = useState(initialPage);
    const [categoryFilters, setCategoryFilters] = useState([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [maximized, setMaximized] = useState(true);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(140);
    const [priceRange, setPriceRange] = useState([0, 140]);
    const [allBrandOptions, setAllBrandOptions] = useState([]);
    const [brandSearch, setBrandSearch] = useState('');
    const [selectedBrands, setSelectedBrands] = useState(new Set());
    const [favorites, setFavorites] = useState(new Set());
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [showBrandSearch, setShowBrandSearch] = useState(false);
    const [showCategorySearch, setShowCategorySearch] = useState(false);
    const [brandSortBy, setBrandSortBy] = useState('name'); 
    const [brandProductCountFilter, setBrandProductCountFilter] = useState('all'); 
    const [showBrandFilters, setShowBrandFilters] = useState(false);
    const [sidebarSelectedCategories, setSidebarSelectedCategories] = useState(new Set());


    // ...existing code...
const [sidebarCategories, setSidebarCategories] = useState([]);
const [sidebarSelected, setSidebarSelected] = useState(new Set());
const [sidebarCategorySearch, setSidebarCategorySearch] = useState('');
const [sidebarShowAll, setSidebarShowAll] = useState(false);
// ...existing code...

const [sidebarBrands, setSidebarBrands] = useState([]);
const [sidebarBrandSelected, setSidebarBrandSelected] = useState(new Set());
const [sidebarBrandSearch, setSidebarBrandSearch] = useState('');
const [sidebarShowAllBrands, setSidebarShowAllBrands] = useState(false);

const [sidebarMinPrice, setSidebarMinPrice] = useState(0);
const [sidebarMaxPrice, setSidebarMaxPrice] = useState(1000);
const [sidebarPriceRange, setSidebarPriceRange] = useState([0, 1000]);

const [sidebarSelectedBrands, setSidebarSelectedBrands] = useState(new Set());
const [sidebarSortConfig, setSidebarSortConfig] = useState({ key: 'name', direction: 'asc' });

let sidebarFilteredProducts = products;

// Filter by sidebar brands
// Filter by BOTH sidebar brands AND categories
if (sidebarBrandSelected.size > 0 || sidebarSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter(
        p =>
            sidebarBrandSelected.has(p.brand_name) ||
            (sidebarSelected.has(p.category_id) || sidebarSelected.has(p.category))
    );
} else if (sidebarBrandSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter(
        p => sidebarBrandSelected.has(p.brand_name)
    );
} else if (sidebarSelected.size > 0) {
    sidebarFilteredProducts = sidebarFilteredProducts.filter(
        p => sidebarSelected.has(p.category_id) || sidebarSelected.has(p.category)
    );
}
    

// Filter by sidebar price range
sidebarFilteredProducts = sidebarFilteredProducts.filter(
    p =>
        (!sidebarPriceRange[0] || p.price >= sidebarPriceRange[0]) &&
        (!sidebarPriceRange[1] || p.price <= sidebarPriceRange[1])
);

// Sorting
if (sidebarSortConfig.key) {
    sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => {
        if (a[sidebarSortConfig.key] < b[sidebarSortConfig.key]) return sidebarSortConfig.direction === 'asc' ? -1 : 1;
        if (a[sidebarSortConfig.key] > b[sidebarSortConfig.key]) return sidebarSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
}



// --- Sorting handler for sidebar ---
const handleSidebarSort = (key) => {
    setSidebarSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
};

    // Helper: filter and sort brands
    const getFilteredSortedBrands = () => {
        let brands = allBrandOptions
            .filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()));

        // Filter by product count
        brands = brands.filter(brand => {
            if (brandProductCountFilter === 'high') return (brand.count || 0) > 50;
            if (brandProductCountFilter === 'medium') return (brand.count || 0) > 10 && (brand.count || 0) <= 50;
            if (brandProductCountFilter === 'low') return (brand.count || 0) <= 10;
            return true;
        });

        // Sort
        brands = [...brands].sort((a, b) => {
            if (brandSortBy === 'name') return a.name.localeCompare(b.name);
            if (brandSortBy === 'count') return (b.count || 0) - (a.count || 0);
            return 0;
        });

        return brands;
    };
    

const fetchSidebarCategories = (search = '') => {
    fetch(`${API_BASE_URL}/fetch_categories/?q=${encodeURIComponent(search)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => {
            setSidebarCategories(data.categories || []);
        })
        .catch(error => {
            console.error('Error fetching sidebar categories:', error);
        });
};

const fetchSidebarBrands = (search = '') => {
    fetch(`${API_BASE_URL}/fetch_brands/?q=${encodeURIComponent(search)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => {
            setSidebarBrands(data.brands || []);
        })
        .catch(error => {
            console.error('Error fetching sidebar brands:', error);
        });
};

const fetchSidebarPriceRange = (categoryId = '') => {
    let url = `${API_BASE_URL}/fetch_price_range/?`;
    if (categoryId) url += `category_id=${encodeURIComponent(categoryId)}&`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
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
            const letter = brand.name?.charAt(0)?.toUpperCase() || '';
            if (!grouped[letter]) grouped[letter] = [];
            grouped[letter].push(brand);
        });
        return grouped;
    };

    const groupedBrands = groupBrandsByLetter(getFilteredSortedBrands());
    const sortedLetters = Object.keys(groupedBrands).sort();

    const handleCategorySearchChange = (e) => {
        setCategorySearch(e.target.value);
    };
    const handleBrandSearchChange = (e) => {
        setBrandSearch(e.target.value);
    };
const handleSidebarBrandSearchChange = (e) => {
    setSidebarBrandSearch(e.target.value);
};

    // Function to toggle wishlist status
const toggleWishlist = (productId) => {
    setWishlist((prevWishlist) => {
        const newWishlist = new Set(prevWishlist);
        if (newWishlist.has(productId)) {
            newWishlist.delete(productId); // Remove from wishlist
        } else {
            newWishlist.add(productId); // Add to wishlist
        }
        return newWishlist;
    });
};

const handleSidebarCategorySearchChange = (e) => {
    setSidebarCategorySearch(e.target.value);
};
const handleSidebarBrandSelect = (brandName) => {
    setSidebarBrandSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(brandName)) {
            newSet.delete(brandName);
        } else {
            newSet.add(brandName);
        }
        // Sync with main filter state for product filtering
        setSelectedBrands(new Set(newSet));
        return newSet;
    });
};


const handleSidebarCategorySelect = (categoryName) => {
    setSidebarSelected(prev => {
        const newSet = new Set(prev);
        if (newSet.has(categoryName)) {
            newSet.delete(categoryName);
        } else {
            newSet.add(categoryName);
        }
        setSelectedCategories(new Set(newSet));
        // Optionally, update selectedCategoryId for dialog consistency
        if (newSet.size === 1) setSelectedCategoryId(Array.from(newSet)[0]);
        else setSelectedCategoryId('');
        return newSet;
    });
};


    // Helper functions
    const toggleDialogSize = () => setMaximized(prev => !prev);

    const getSortSymbol = (column) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return '↕';
    };

    const toggleFavorite = (productId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    };

    // Helper function to derive filter chips from state
const getAppliedFilterChips = useCallback(() => {
    const chips = [];

    // Helper to avoid duplicate chips by key or label
    const addChip = (chip) => {
        if (!chips.some(c => c.label === chip.label)) {
            chips.push(chip);
        }
    };


    // 1. Categories (ID-based)
    Array.from(selectedCategories).forEach(id => {
        const category = categoryOptions.find(c => c.id === id);
        if (category) {
            addChip({
                key: `category-${id}`,
                label: `${category.name}`,
                type: 'Category',
                value: id,
            });
        }
    });

        
    // Sidebar Categories (name-based, only if not already present by label or key)
Array.from(sidebarSelected).forEach(name => {
    const category =
        sidebarCategories.find(c => c.name === name) ||
        categoryOptions.find(c => c.name === name);
    // Only add if NOT present in selectedCategories (by id)
    if (
        category &&
        !selectedCategories.has(category.id) &&
        !chips.some(c => c.label === category.name || c.key === `category-${category.id}`)
    ) {
        addChip({
            key: `category-${name}`,
            label: category.name,
            type: 'SidebarCategory',
            value: name,
        });
    }
});



        // Sidebar Brands
Array.from(new Set([...selectedBrands, ...sidebarBrandSelected])).forEach(name => {
    const brand =
        sidebarBrands.find(b => b.name === name) ||
        allBrandOptions.find(b => b.name === name);
    if (brand) {
        addChip({
            key: `brand-${name}`,
            label: brand.name,
            type: sidebarBrandSelected.has(name) ? 'SidebarBrand' : 'Brand',
            value: name,
        });
    }
});



        // Sidebar Price Range
// Sidebar Price Range chip
if (
    sidebarPriceRange[0] !== sidebarMinPrice ||
    sidebarPriceRange[1] !== sidebarMaxPrice
) {
    chips.push({
        key: 'sidebar-price',
        label: `$${sidebarPriceRange[0]} - $${sidebarPriceRange[1]}`,
        type: 'SidebarPriceRange',
        value: null,
    });
}


        // 2. Brands
        Array.from(selectedBrands).forEach(name => {
           
        });

// 3. Price Range
if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
    addChip({
        key: 'price',
        label: `$${priceRange[0]} - $${priceRange[1]}`,
        type: 'Price Range',
        value: null,
    });
}

        // 4. Other Attributes
    Object.entries(selectedFilters).forEach(([filterName, values]) => {
        if (values.length > 0) {
            values.forEach(value => {
                addChip({
                    key: `attr-${filterName}-${value}`,
                    label: `${filterName}: ${value}`,
                    type: 'Attribute',
                    filterName: filterName,
                    value: value,
                });
            });
        }
    });


        // 5. Search Query
  

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
    if (filterType === 'SidebarCategory' || filterType === 'Category') {
        // Always remove by id
        let categoryId = value;
        if (filterType === 'SidebarCategory') {
            // If value is name, find id
            const category = categoryOptions.find(c => c.name === value);
            if (category) categoryId = category.id;
        }
        setSelectedCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(categoryId);
            return newSet;
        });
        // Also remove from sidebarSelected by name
        const category = categoryOptions.find(c => c.id === categoryId);
        if (category) {
            setSidebarSelected(prev => {
                const newSet = new Set(prev);
                newSet.delete(category.name);
                return newSet;
            });
        }
    } else if (filterType === 'SidebarBrand') {
        setSidebarBrandSelected(prev => {
            const newSet = new Set(prev);
            newSet.delete(value);
            return newSet;
        });
    } else if (filterType === 'SidebarPriceRange') {
        setSidebarPriceRange([sidebarMinPrice, sidebarMaxPrice]);
    } else if (filterType === 'Brand') {
        setSelectedBrands(prev => {
            const newSet = new Set(prev);
            newSet.delete(value);
            return newSet;
        });
    } else if (filterType === 'Attribute' && filterName) {
        setSelectedFilters(prev => {
            const newFilters = { ...prev };
            newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
            if (newFilters[filterName].length === 0) {
                delete newFilters[filterName];
            }
            return newFilters;
        });
    } else if (filterType === 'Price Range') {
        setPriceRange([minPrice, maxPrice]);
    } else if (filterType === 'Search Query') {
        setSearchQuery('');
    }
};

    const fetchCategories = () => {
        fetch(`${API_BASE_URL}/fourth_level_categories/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(data => {
                setCategoryOptions(data.data.categories || []);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    };
    
    // --- START: Original Dialog Logic Helpers ---

    const fetchFilters = (categoryId) => {
        setLoading(true); 
        fetch(`${API_BASE_URL}/category_filters/?category_id=${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                 console.error('Filter fetch error:', data.error);
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
        .catch(error => {
            console.error('Error fetching filters:', error);
            setLoading(false);
        });
    };

    // This handles the Select input in the reverted dialog
const handleDialogCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId); // Use old state for dialog
    setSelectedCategories(new Set([categoryId])); // Sync to new state for main filtering

    // Sync sidebarSelected with category name for table/card filtering
    const category = categoryOptions.find(c => c.id === categoryId);
    if (category) {
        setSidebarSelected(new Set([category.name]));
    } else {
        setSidebarSelected(new Set());
    }

    if (categoryId) {
        fetchFilters(categoryId);
        setSnackbarMessage('Category selected successfully!');
        setSnackbarSeverity('success'); 
        setSnackbarOpen(true);
        fetchProducts(); // <-- Add this line to update products immediately
    }
};

    const handleDialogFilterChange = (filterName, option) => {
        const newFilters = { ...selectedFilters };
        if (newFilters[filterName]) {
            if (newFilters[filterName].includes(option)) {
                newFilters[filterName] = newFilters[filterName].filter(f => f !== option);
            } else {
                newFilters[filterName].push(option);
            }
        } else {
            newFilters[filterName] = [option];
        }
        setSelectedFilters(newFilters);
    };
    
    const handleDialogClearFilters = () => {
        setSelectedCategoryId('');
        setSelectedCategoryName('');
        setSelectedFilters({});
        setCategoryFilters([]);
        
        // Also clear the new filter states used by the sidebar/main logic
        setSelectedCategories(new Set());
        setSelectedBrands(new Set());
        setPriceRange([minPrice, maxPrice]); 
        setSearchQuery('');

        // Refetch products without filters
        fetchProducts();

        setSnackbarMessage('Reset successfully!');
        setSnackbarSeverity('Success'); // Use 'error' per original code (red color)
        setSnackbarOpen(true);
    };

    // --- END: Original Dialog Logic Helpers ---


const fetchProducts = useCallback(() => {
    setLoading(true);
    
    const categoryIds = Array.from(selectedCategories).length > 0 
        ? Array.from(selectedCategories) 
        : (selectedCategoryId ? [selectedCategoryId] : []);

    const requestBody = {
        ...(categoryIds.length > 0 && { category_ids: categoryIds }),
        search_query: searchQuery?.trim() || '',
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
        Object.values(selectedFilters).some(arr => Array.isArray(arr) && arr.length > 0)
    ) {
        requestBody.attributes = selectedFilters;
    }

    fetch(`${API_BASE_URL}/productList/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })
        .then(response => response.json())
        .then(responseData => {
            let productList = responseData.data?.products || [];

            // Only update brands - categories removed
            const allBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
            const allBrandsWithCount = allBrands.map(brandName => ({
                id: brandName,
                name: brandName,
                count: productList.filter(p => p.brand_name === brandName).length,
            }));
            setAllBrandOptions(allBrandsWithCount);

            // Price calculation
            if (productList.length > 0) {
                const prices = productList.map(p => p.price);
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
        .catch(error => {
            console.error('Error fetching product data:', error);
            setLoading(false);
        });
}, [selectedCategories, selectedCategoryId, searchQuery, selectedBrands, priceRange, minPrice, maxPrice, selectedFilters]);
    // Event handlers (sidebar/main view logic)
    const handleSidebarCategoryChange = (categoryId) => {
        const newCategories = new Set(selectedCategories);
        if (newCategories.has(categoryId)) {
            newCategories.delete(categoryId);
        } else {
            newCategories.add(categoryId);
        }
        setSelectedCategories(newCategories);
        
        // Sync with old dialog state for consistency
        if (newCategories.size === 1) setSelectedCategoryId(Array.from(newCategories)[0]);
        else if (newCategories.size === 0) setSelectedCategoryId('');
        else setSelectedCategoryId(''); // Clear if multiple selected

        setSnackbarMessage('Category selection updated!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    const handleBrandChange = (brandName) => {
        const newBrands = new Set(selectedBrands);
        if (newBrands.has(brandName)) {
            newBrands.delete(brandName);
        } else {
            newBrands.add(brandName);
        }
        setSelectedBrands(newBrands);
    };

    const handleFilterChange = (filterName, option) => {
        const newFilters = { ...selectedFilters };
        if (newFilters[filterName]) {
            if (newFilters[filterName].includes(option)) {
                newFilters[filterName] = newFilters[filterName].filter(f => f !== option);
            } else {
                newFilters[filterName].push(option);
            }
        } else {
            newFilters[filterName] = [option];
        }
        setSelectedFilters(newFilters);
    };

    const handleClearFilters = () => {
        setSelectedCategories(new Set());
        setSelectedFilters({});
        setSelectedBrands(new Set());
        setPriceRange([minPrice, maxPrice]);
        setCategoryFilters([]);
        setSearchQuery('');
        setPage(0);
        setSortConfig({ key: 'sku', direction: 'asc' });
        fetchProducts();

            // --- Add these lines to clear sidebar filters ---
    setSidebarSelected(new Set());
    setSidebarBrandSelected(new Set());
    setSidebarPriceRange([sidebarMinPrice, sidebarMaxPrice]);
    setSidebarCategorySearch('');
    setSidebarBrandSearch('');
    // ------------------------------------------------

    fetchProducts();

        setSnackbarMessage('Filters reset successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    const sortProducts = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        const sorted = [...filteredProducts].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'asc' ? 1 : -1;
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
            setSelectedCategoryId(''); // Clear dialog's selected ID on search
        }
        setPage(0);
    };

    const handleClearSearch = () => {
        setSelectedCategories(new Set());
        setSelectedCategoryId('');
        setSearchQuery('');
        setPage(0);
        setSortConfig({ key: 'sku', direction: 'asc' });
        fetchProducts(); // Refetch all products

        setSnackbarMessage('Search reset successfully!');
        setSnackbarSeverity('error'); // Use 'error' per original code (red color)
        setSnackbarOpen(true);
    };

    const toggleViewMode = (mode) => setViewMode(mode);

    // Initial data fetch and refetch on filter change
    useEffect(() => {
        fetchProducts();
    }, [selectedCategories, selectedFilters, searchQuery, selectedBrands, priceRange]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Only use category for price range, not brand
    const categoryId = Array.from(sidebarSelected)[0] || '';
    fetchSidebarPriceRange(categoryId);
}, [sidebarSelected]);
    

    // Fetch sidebar categories on mount and when categorySearch changes
useEffect(() => {
    // Always fetch categories, with or without search
    fetchSidebarCategories(categorySearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [categorySearch]);



    const appliedChips = getAppliedFilterChips();
    const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);

if (appliedChips.length > 0) {
    // Always prioritize brand LIFO sorting if any brand is selected
    if (sidebarBrandSelected.size > 0) {
        const selectedArray = Array.from(sidebarBrandSelected);
        sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => {
            const aIdx = selectedArray.indexOf(a.brand_name);
            const bIdx = selectedArray.indexOf(b.brand_name);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return bIdx - aIdx; // LIFO: most recent first
        });
    } else if (sidebarSelected.size > 0) {
        // If no brand selected, sort by category
        sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
            String(b.category).localeCompare(String(a.category))
        );
    } else {
        // Fallback to other filters (price, search, attribute)
        const latestChip = appliedChips[appliedChips.length - 1];
        if (latestChip.type === 'Price Range' || latestChip.type === 'SidebarPriceRange') {
            sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) => b.price - a.price);
        } else if (latestChip.type === 'Search Query') {
            sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
                String(b.name).localeCompare(String(a.name))
            );
        } else if (latestChip.type === 'Attribute' && latestChip.filterName) {
            sidebarFilteredProducts = [...sidebarFilteredProducts].sort((a, b) =>
                String(b[latestChip.filterName]).localeCompare(String(a[latestChip.filterName]))
            );
        }
    }
}

    return(

        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Left Sidebar */}
            <Box
                sx={{
                    width: 220,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #e0e0e0',
                    padding: 2,
                    overflow: 'auto',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                    fontFamily: 'Roboto, Arial, sans-serif'
                }}
            >
                {/* Header: FILTERS and CLEAR ALL */}
                <Box sx={{
                        mb: 1.2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '14px',
                                color: '#333',
                                fontFamily: 'Roboto, Arial, sans-serif'
                            }}
                        >
                            FILTERS
                        </Typography>
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClearFilters}
                            sx={{
                                textTransform: 'none',
                                fontSize: '13px',
                                padding: '4px 8px',
                                color: '#2563EB',
                                fontWeight: 'bold',
                                fontFamily: 'Roboto, Arial, sans-serif',
                                minWidth: 'auto',
                                '&:hover': {
                                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                                    color: '#1e4baf'
                                }
                            }}
                        >
                            CLEAR ALL
                        </Button>
                    </Box>
                    
            {/* Sidebar Categories Section */}
<Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: 36 }}>
        {!showCategorySearch && (
            <>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '13px',
                        color: '#333',
                        fontFamily: 'Roboto, Arial, sans-serif',
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
                        background: '#f6f6f6',
                        '&:hover': { background: '#ececec' }
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
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: 32,
                    background: '#f6f6f6',
                    borderRadius: '18px',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    mr: 1,
                    mb: 2,
                    zIndex: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '18px',
                        fontSize: 12,
                        paddingRight: 0,
                        background: '#f6f6f6',
                        border: 'none',
                        height: 32,
                    },
                    '& fieldset': { border: 'none' }
                }}
                InputProps={{
                    endAdornment: (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSidebarCategorySearch('');
                                setShowCategorySearch(false);
                            }}
                            sx={{
                                mr: 0.5,
                                color: '#bdbdbd'
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
                ? sidebarCategories.filter(c => !sidebarCategorySearch || c.name.toLowerCase().includes(sidebarCategorySearch.toLowerCase()))
                : sidebarCategories
                    .filter(c => !sidebarCategorySearch || c.name.toLowerCase().includes(sidebarCategorySearch.toLowerCase()))
                    .slice(0, 5)
            ).map((category) => (
<FormControlLabel
    key={category.id}
    control={
  <Checkbox
    checked={sidebarSelected.has(category.name)}
    onChange={() => handleSidebarCategorySelect(category.name)}
            size="small"
            sx={{
                color: '#2563EB',
                '&.Mui-checked': { color: '#2563EB' },
                p: '0px',
                fontSize: 16,
                '& .MuiSvgIcon-root': { fontSize: 16 }
            }}
        />
    }
    label={
        <Typography sx={{ fontSize: 12, color: '#222', fontWeight: 500, fontFamily: 'Roboto, Arial, sans-serif', ml: 2 }}>
            {category.name} <span style={{ color: '#888', fontWeight: 400 }}>({category.count})</span>
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
        color: '#2563EB',
        fontSize: 12,
        mt: 0.3,
        textTransform: 'none',
        pl: 0,
        fontWeight: 600,
        fontFamily: 'Roboto, Arial, sans-serif'
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
    <DialogTitle sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 15 }}>
                Select Categories
            </Typography>
            <IconButton onClick={() => setShowAllCategories(false)}>
                <CloseIcon />
            </IconButton>
        </Box>
    </DialogTitle>

    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
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

    <DialogContent dividers sx={{ p: 0, maxHeight: '60vh' }}>
        {(() => {
            // Group categories by first letter
            const grouped = {};
            sidebarCategories
                .filter(c => !sidebarCategorySearch || c.name.toLowerCase().includes(sidebarCategorySearch.toLowerCase()))
                .forEach(category => {
                    const letter = category.name?.charAt(0)?.toUpperCase() || '';
                    if (!grouped[letter]) grouped[letter] = [];
                    grouped[letter].push(category);
                });
            const letters = Object.keys(grouped).sort();

            return letters.length > 0 ? (
                letters.map(letter => (
                    <Box key={letter}>
                        <Box sx={{ p: 0.2, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {letter}
                            </Typography>
                        </Box>
                        <Divider />
                        <Grid container spacing={-10}>
                            {grouped[letter].map(category => (
                                <Grid item xs={12} sm={6} md={4} key={category.id}>
                                    <FormControlLabel
                                        control={
                                          <Checkbox
    checked={sidebarSelected.has(category.name)}
    onChange={() => handleSidebarCategorySelect(category.name)}
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
                                                    <Chip label={`${category.count}`} size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            width: '100%',
                                            m: 0,
                                            '&:hover': { backgroundColor: '#f5f5f5' }
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))
            ) : (
                <Box p={3} textAlign="center">
                    <Typography>No categories match your search criteria</Typography>
                </Box>
            );
        })()}
    </DialogContent>
    <DialogActions>
        <Button
            onClick={() => {
                setSidebarSelected(new Set());
                setSidebarCategorySearch('');
            }}
            color="error"
            variant="outlined"
            sx={{ fontSize: 12 }}
        >
            Reset
        </Button>
        <Button onClick={() => setShowAllCategories(false)} color="primary" variant="contained" sx={{ fontSize: 12 }}>
            Apply
        </Button>
    </DialogActions>
</Dialog>

                <Divider sx={{ my: 1 }} />
                {/* Brands Section (Sidebar) */}

     <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: 36 }}>
        {!showBrandSearch && (
            <>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        fontSize: '13px',
                        color: '#333',
                        fontFamily: 'Roboto, Arial, sans-serif',
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
                        background: '#f6f6f6',
                        '&:hover': { background: '#ececec' }
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
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: 32,
                    background: '#f6f6f6',
                    borderRadius: '18px',
                    fontFamily: 'Roboto, Arial, sans-serif',
                    mr: 1,
                    mb: 2,
                    zIndex: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '18px',
                        fontSize: 12,
                        paddingRight: 0,
                        background: '#f6f6f6',
                        border: 'none',
                        height: 32,
                    },
                    '& fieldset': { border: 'none' }
                }}
                InputProps={{
                    endAdornment: (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setSidebarBrandSearch('');
                                setShowBrandSearch(false);
                            }}
                            sx={{
                                mr: 0.5,
                                color: '#bdbdbd'
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
            .filter(b => !sidebarBrandSearch || b.name.toLowerCase().includes(sidebarBrandSearch.toLowerCase()))
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
                                color: '#2563EB',
                                '&.Mui-checked': { color: '#2563EB' },
                                p: '0px',
                                fontSize: 16,
                                '& .MuiSvgIcon-root': { fontSize: 16 }
                            }}
                        />
                    }
                    label={
                        <Typography sx={{ fontSize: 12, color: '#222', fontWeight: 500, fontFamily: 'Roboto, Arial, sans-serif', ml: 2 }}>
                            {brand.name} <span style={{ color: '#888', fontWeight: 400 }}>({brand.count})</span>
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
            onClick={() => setShowAllBrands(true)} // <-- open dialog!
            sx={{
                color: '#2563EB',
                fontSize: 12,
                mt: 0.3,
                textTransform: 'none',
                pl: 0,
                fontWeight: 600,
                fontFamily: 'Roboto, Arial, sans-serif'
            }}
        >
            {`+ ${sidebarBrands.length - 5} View all brands`}
        </Button>
    )}
</Box>
</Box>

{/* Dialog for all brands */}
{/* Dialog for all brands */}
<Dialog
    open={showAllBrands}
    onClose={() => setShowAllBrands(false)}
    fullWidth
    maxWidth="md"
    PaperProps={{ sx: { borderRadius: 2 } }}
>
    <DialogTitle sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 15 }}>
                Select Brands
            </Typography>
            <IconButton onClick={() => setShowAllBrands(false)}>
                <CloseIcon />
            </IconButton>
        </Box>
    </DialogTitle>

    <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
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

    <DialogContent dividers sx={{ p: 0, maxHeight: '60vh' }}>
        {(() => {
            // Group brands by first letter
            const grouped = {};
            sidebarBrands
                .filter(b => !sidebarBrandSearch || b.name.toLowerCase().includes(sidebarBrandSearch.toLowerCase()))
                .forEach(brand => {
                    const letter = brand.name?.charAt(0)?.toUpperCase() || '';
                    if (!grouped[letter]) grouped[letter] = [];
                    grouped[letter].push(brand);
                });
            const letters = Object.keys(grouped).sort();

            return letters.length > 0 ? (
                letters.map(letter => (
                    <Box key={letter}>
                        <Box sx={{ p: 0.2, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {letter}
                            </Typography>
                        </Box>
                        <Divider />
                        <Grid container spacing={-10}>
                            {grouped[letter].map(brand => (
                                <Grid item xs={12} sm={6} md={4} key={brand.id}>
                                    <FormControlLabel
                                        control={
                                      <Checkbox
    checked={sidebarBrandSelected.has(brand.name)}
    onChange={() => handleSidebarBrandSelect(brand.name)}
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
                                                    <Chip label={`${brand.count} `} size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            width: '100%',
                                            m: 0,
                                            '&:hover': { backgroundColor: '#f5f5f5' }
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
                setSidebarBrandSearch('');
            }}
            color="error"
            variant="outlined"
            sx={{ fontSize: 12 }}
        >
            Reset
        </Button>
        <Button onClick={() => setShowAllBrands(false)} color="primary" variant="contained" sx={{ fontSize: 12 }}>
            Apply
        </Button>
    </DialogActions>
</Dialog>

           

                <Divider sx={{ my: -1 }} />
                {/* Price Range Section */}
    <Box sx={{ mb: 1, mt: 3 }}>
    <Box sx={{ fontWeight: 'bold', fontSize: 13, mb: 0.5, color: '#333', fontFamily: 'Roboto, Arial, sans-serif' }}>
        Price
    </Box>
    <Slider
        value={sidebarPriceRange}
        onChange={(event, newValue) => setSidebarPriceRange(newValue)}
        valueLabelDisplay="off"
        min={sidebarMinPrice}
        max={sidebarMaxPrice}
        sx={{
            color: '#2563EB',
            height: 4,
            mt: 0.5,
            '& .MuiSlider-thumb': {
                width: 18,
                height: 18,
                backgroundColor: '#fff',
                border: '2px solid #2563EB',
                boxShadow: '0 2px 6px 0 rgba(0,0,0,0.15)',
            },
            '& .MuiSlider-rail': { backgroundColor: '#f6f6f6' },
            '& .MuiSlider-track': { backgroundColor: '#2563EB' },
        }}
    />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.1 }}>
        <Typography sx={{ fontSize: 12, color: '#222', fontWeight: 400 }}>
            ${sidebarPriceRange[0]}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#222', fontWeight: 400 }}>
            ${sidebarPriceRange[1]}
        </Typography>
    </Box>
</Box>

            </Box>
            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            placeholder="Search..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{
                                width: 300,
                                background: '#f6f6f6',
                                borderRadius: '18px',
                                fontFamily: 'Roboto, Arial, sans-serif',
                                transition: 'background 0.2s, border-color 0.2s',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '18px',
                                    fontSize: 12,
                                    paddingRight: 0,
                                    background: '#f6f6f6',
                                    border: '1px solid #e0e0e0',
                                    height: 32,
                                    transition: 'background 0.2s, border-color 0.2s',
                                    '&:hover': {
                                        background: '#fff',
                                        borderColor: '#bdbdbd',
                                    },
                                    '&.Mui-focused': {
                                        background: '#fff',
                                        borderColor: '#2563EB',
                                    },
                                },
                                '& fieldset': { border: 'none' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        style={{ marginRight: 8 }}
                                    >
                                        <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2" />
                                        <path d="M20 20L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ),
                            }}
                        />
                        <IconButton onClick={handleClearSearch}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.37-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </IconButton>
<Button
  variant="contained"
  color="secondary"
  onClick={() => setImportOpen(true)}
  sx={{
    ml: 2,
    minWidth: 0,
    padding: 1,
    backgroundColor: '#fff',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      boxShadow: 'none',
    },
  }}
>
  <FileDownloadOutlinedIcon sx={{ color: '#2563EB' }} />
</Button>

<ImportProducts
  open={importOpen}
  onClose={() => setImportOpen(false)}
  onSuccess={fetchProducts}
/>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                        <Typography variant="body2">Total Products: {sidebarFilteredProducts.length}</Typography>
                        <Tooltip title="List View">
                            <IconButton
                                onClick={() => toggleViewMode('list')}
                                color={viewMode === 'list' ? 'primary' : 'default'}
                                sx={{ backgroundColor: viewMode === 'list' ? '#2563EB' : 'transparent', color: viewMode === 'list' ? 'white' : 'inherit', '&:hover': { backgroundColor: viewMode === 'list' ? '#1e4baf' : 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <ListAltIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Card View">
                            <IconButton
                                onClick={() => toggleViewMode('card')}
                                color={viewMode === 'card' ? 'primary' : 'default'}
                                sx={{ backgroundColor: viewMode === 'card' ? '#2563EB' : 'transparent', color: viewMode === 'card' ? 'white' : 'inherit', '&:hover': { backgroundColor: viewMode === 'card' ? '#1e4baf' : 'rgba(0, 0, 0, 0.04)' } }}
                            >
                                <GridViewIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                {/* Applied Filters Section (USING CHIPS) */}
                 {appliedChips.length > 0 && (
                    <Box
                        sx={{
                            p: 1.5,
                            backgroundColor: '#fff',
                            borderBottom: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
                        {appliedChips.map((filter) => (
                            <Chip
                                key={filter.key}
                                label={filter.label}
                                onDelete={() => handleRemoveFilter(filter.type, filter.value, filter.filterName)}
                                size="small"
                                sx={{
                                    backgroundColor: '#fff',
                                    color: '#444', 
                                    fontWeight: 400,
                                    fontSize: '12px',
                                    border: '1px solid #bdbdbd',
                                    '& .MuiChip-deleteIcon': {
                                        color: '#555',
                                        '&:hover': {
                                            color: '#000',
                                        },
                                    },
                                }}
                            />
                        ))}
                    </Box>
                )} 

                {/* Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f1f3f6' }}>
                    {viewMode === 'list' ? (
                        <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {[
                                            { label: 'Image' },
                                            // { label: 'SKU', key: 'sku' }, // SKU is excluded from header mapping based on provided code
                                            { label: 'Title', key: 'name' },
                                            { label: 'MPN', key: 'mpn' },
                                            { label: 'Category', key: 'category' },
                                            { label: 'Brand', key: 'brand_name' },
                                            { label: 'Price', key: 'price' },
                                        ].map((col, index) => (
                                           <TableCell
    key={index}
    sx={{ textAlign: 'center', cursor: col.key ? 'pointer' : 'default', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '14px' }}
    onClick={col.key ? () => handleSidebarSort(col.key) : undefined}
>
    {col.label} {col.key ? (sidebarSortConfig.key === col.key ? (sidebarSortConfig.direction === 'asc' ? '↑' : '↓') : '↕') : ''}
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
        sidebarFilteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
                <TableRow key={product.id} hover>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ textDecoration: 'none' }}>
                                                            <img
                                                                src={
                                                                    product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))
                                                                        ? product.image_url
                                                                        : 'https://placehold.co/40x40?text=No+Img' 
                                                                }
                                                                alt={product.name}
                                                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://placehold.co/40x40?text=No+Img";
                                                                }}
                                                            />
                                                        </Link>
                                                    </TableCell>
                                                    {/* NOTE: SKU column removed from map, but should be added here if needed */}
                                                    <TableCell sx={{ textAlign: 'left', maxWidth: 300 }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            <Typography component="span" sx={{ textAlign: 'center' ,fontSize: 13 }}>
                                                                {product.name}
                                                            </Typography>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            <Typography component="span" sx={{ color: '#212121',fontSize: 13  }}>
                                                                {product.mpn}
                                                            </Typography>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' ,fontSize: 13 }}>{product.category}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center',fontSize: 13  }}>{product.brand_name || 'N/A'}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center',fontSize: 13  }}>${product.price}</TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            {loading ? (
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <DotLoading />
                                </Box>
                            ) : filteredProducts.length === 0 ? (
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Typography>No Data Found</Typography>
                                </Box>
                            ) : (
<Grid container spacing={0.5} sx={{ margin: 0, width: '100%' }}>
   {sidebarFilteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
        <Grid item 
            xs={12}
            sm={6}
            md={4}
            lg={4}
            xl={4}
            key={product.id}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                paddingLeft: '8px !important',
                paddingTop: '8px !important',
            }}
        >
            <Card
                sx={{
                    width: '230px',
                    maxWidth: '230px',
                    height: '455px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backgroundColor: '#fff',
                    border: '1px solid #e3e6ef',
                    borderRadius: '12px',
                    transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                        boxShadow: '0 8px 24px 0 rgba(37,99,235,0.18)',
                    },
                }}
            >
                <Link
                    to={`/details/${product.id}`}
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            height: '270px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: '#f8faff',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                        }}
                    >
                        <CardMedia
                            component="img"
                            image={
                                product.image_url &&
                                (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))
                                    ? product.image_url
                                    : 'https://placehold.co/200x200?text=No+Img'
                            }
                            alt={product.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/200x200?text=No+Img';
                            }}
                            sx={{
                                width: '180px',
                                height: '5000px',
                                maxWidth: '100%',
                                maxHeight: '180%',
                                objectFit: 'contain',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.07)' },
                            }}
                        />
                    </Box>
                    <CardContent
                        sx={{
                            flex: 1,
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            paddingBottom: '12px !important',
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '10px',
                                color: '#222',
                                lineHeight: 1.3,
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 4,
                                minHeight: '34px',
                            }}
                        >
                            {product.name}
                        </Typography>
                        <Box sx={{ fontSize: '11px', color: '#222', textAlign: 'left', mb: 0.1 }}>
                            <Typography variant="body2" sx={{ fontSize: '10px', mb: 0.1, fontWeight: 200 }}>
                                <b>MPN:</b> {product.mpn || 'N/A'}
                            </Typography>

                            <Typography variant="body2" sx={{ fontSize: '10px', mb: 0.1, fontWeight: 200 }}>
                                <b>Brand:</b> {product.brand_name || 'N/A'}
                            </Typography>

                            <Typography variant="body2" sx={{ fontSize: '10px', mb: 0.1, fontWeight: 200 }}>
                                <b>Category:</b> {product.category}
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 0.5 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#000000',
                                    mb: 0.4,
                                }}
                            >
                                ${product.price}
                            </Typography>
                        </Box>
                    </CardContent>
                </Link>

                {/* Wishlist Icon */}
                <IconButton
                    onClick={() => toggleWishlist(product.id)}
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: wishlist.has(product.id) ? '#3d8effff' : '#fff',
                        color: wishlist.has(product.id) ? '#fff' : '#000',
                        '&:hover': {
                            backgroundColor: wishlist.has(product.id) ? '#3d8effff' : '#f0f0f0',
                        },
                    }}
                >
                    {wishlist.has(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
            </Card>
        </Grid>
    ))}
</Grid>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Pagination and Rows per page */}

                <Box sx={{ paddingRight: '35px', backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
           <TablePagination
    rowsPerPageOptions={[10, 25, 50, 100]}
    component="div"
    count={sidebarFilteredProducts.length} // <-- Use sidebarFilteredProducts here!
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={(event, newPage) => setPage(newPage)}
    onRowsPerPageChange={handleChangeRowsPerPage}
    labelRowsPerPage="Rows per page:"
    sx={{
        '& .MuiTablePagination-actions': {
            marginRight: '28px', 
        },
    }}
/>
                </Box>
                
                {/* --- START REVERTED PRODUCT FINDER DIALOG (Original Code) --- */}
                
                {/* Floating Product Finder Button */}
                <Button
                    variant="contained"
                    color="primary"
                    style={{
                        position: 'fixed',
                        bottom: '15px',
                        right: '10px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        fontSize: '24px',
                        zIndex: 9999
                    }}
                    onClick={() => { setShowPopup(true); setSearchQuery(''); setPage(0); }}
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
                            position: 'fixed',
                            bottom: '80px',
                            right: '20px',
                            margin: 0,
                            zIndex: 1300,
                            borderRadius: '12px',
                            width: isMobile ? '95%' : maximized ? 400 : 250, 
                            height: isMobile ? '85%' : maximized ? 450 : 60,  
                            transition: 'all 0.3s ease',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <DialogTitle
                        style={{
                            backgroundColor: '#1976d2',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'white', 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingRight: '40px',
                        }}
                    >
                        <Typography
                            sx={{
                                marginTop: '5px',
                                fontSize: maximized ? '18px' : '14px',
                                fontWeight: 600,
                                color: 'white'
                            }}
                        >
                            Product Finder
                        </Typography>

                        <Box
                            sx={{
                                position: 'absolute',
                                right: 10,
                                top: 10,
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            {/* Minimize Button */}
                            <Tooltip title="Minimize">
                                <span>
                                    <Button
                                        size="small"
                                        onClick={() => maximized && toggleDialogSize()}
                                        disabled={!maximized}
                                        sx={{
                                            minWidth: '32px',
                                            color: 'white', 
                                            height: '32px',
                                            padding: '4px',
                                            lineHeight: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <MinimizeOutlinedIcon fontSize="small" sx={{ mt: '-6px' }} />
                                    </Button>
                                </span>
                            </Tooltip>

                            {/* Maximize Button */}
                            <Tooltip title="Maximize">
                                <span>
                                    <Button
                                        size="small"
                                        onClick={() => !maximized && toggleDialogSize()}
                                        disabled={maximized}
                                        sx={{
                                            minWidth: '32px',
                                            height: '32px',
                                            marginTop: '5px',
                                            color: 'white', 
                                            padding: '4px',
                                            lineHeight: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CropSquareIcon fontSize="small" />
                                    </Button>
                                </span>
                            </Tooltip>

                            {/* Close Button */}
                            <Tooltip title="Close">
                                <Button
                                    onClick={() => setShowPopup(false)}
                                    size="small"
                                    sx={{
                                        marginTop: '5px',
                                        color: 'white', 
                                        minWidth: '32px',
                                        height: '32px',
                                        padding: '4px',
                                        lineHeight: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
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
    <InputLabel sx={{ fontSize: '14px' }}>Category</InputLabel>
    <Select
        value={selectedCategoryId}
        label="Category"
        onChange={handleDialogCategoryChange}
        sx={{ fontSize: '14px' }}
    >
        {categoryOptions.map((category) => (
            <MenuItem sx={{ fontSize: '14px' }} key={category.id} value={category.id}>
                {category.name}
            </MenuItem>
        ))}
    </Select>
   
</FormControl>

                                {categoryFilters.map((filter, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#cfd3df' }}>
                                            <Typography variant="subtitle1" sx={{ fontSize: '14px' }}>{filter.name}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {filter.options.map((option, optionIndex) => (
                                                <FormControlLabel
                                                    key={optionIndex}
                                                    control={
                                                        <Checkbox
                                                            checked={selectedFilters[filter.name]?.includes(option.label) || false}
                                                            onChange={() => handleDialogFilterChange(filter.name, option.label)}
                                                        />

                                                    }
                                                    label={option.label}
                                                    sx={{
                                                        '& .MuiFormControlLabel-label': {
                                                            fontSize: '14px',
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </AccordionDetails>

                                    </Accordion>
                                ))}


                            </DialogContent>

                            <DialogActions>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    {/* Left Side - Reset Button */}
                                    <Tooltip title="Reset All Filters" arrow>
                                        <Button
                                            variant="text"
                                            color="error"
                                            onClick={handleDialogClearFilters}
                                            sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <RestartAltIcon fontSize="small" />
                                            Reset All
                                        </Button>
                                    </Tooltip>

                                    {/* Right Side - Close Button */}
                                    <Button onClick={() => setShowPopup(false)} color="primary">
                                        Close
                                    </Button>
                                </Box>
                            </DialogActions>

                        </>
                    )}
                </Dialog>

                {/* Snackbar Notifications */}
                <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }} elevation={6} variant="filled">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default ProductList;