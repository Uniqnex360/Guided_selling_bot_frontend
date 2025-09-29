import React, { useEffect, useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import MinimizeOutlinedIcon from '@mui/icons-material/MinimizeOutlined';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
    const [brandSortBy, setBrandSortBy] = useState('name'); // 'name' or 'count'
    const [brandProductCountFilter, setBrandProductCountFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
    const [showBrandFilters, setShowBrandFilters] = useState(false);

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

        // 1. Categories
        Array.from(selectedCategories).forEach(id => {
            const category = categoryOptions.find(c => c.id === id);
            if (category) {
                chips.push({
                    key: `category-${id}`,
                    label: `Category: ${category.name}`,
                    type: 'Category',
                    value: id,
                });
            }
        });

        // 2. Brands
        Array.from(selectedBrands).forEach(name => {
            chips.push({
                key: `brand-${name}`,
                label: `Brand: ${name}`,
                type: 'Brand',
                value: name,
            });
        });

        // 3. Price Range
        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
            chips.push({
                key: 'price',
                label: `Price: $${priceRange[0]} - $${priceRange[1]}`,
                type: 'Price Range',
                value: null,
            });
        }

        // 4. Other Attributes
        Object.entries(selectedFilters).forEach(([filterName, values]) => {
            if (values.length > 0) {
                values.forEach(value => {
                    chips.push({
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
        if (searchQuery.trim() !== '') {
            chips.push({
                key: 'search',
                label: `Search: "${searchQuery.trim()}"`,
                type: 'Search Query',
                value: null,
            });
        }

        return chips;
    }, [selectedCategories, categoryOptions, selectedBrands, priceRange, minPrice, maxPrice, selectedFilters, searchQuery]);

    // Handle removing a single filter chip
    const handleRemoveFilter = (filterType, value, filterName = null) => {
        if (filterType === 'Category') {
            setSelectedCategories(prev => {
                const newSet = new Set(prev);
                newSet.delete(value);
                return newSet;
            });
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

    // API function to fetch/filter products, wrapped in useCallback
    const fetchProducts = useCallback(() => {
        setLoading(true);
        const requestBody = {
            ...(selectedCategories.size > 0 && { category_ids: Array.from(selectedCategories) }),
            search_query: searchQuery?.trim() || '',
            ...(selectedBrands.size > 0 && { brands: Array.from(selectedBrands) }),
        };

        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
            requestBody.price_min = priceRange[0];
            requestBody.price_max = priceRange[1];
        }

        if (
            selectedCategories.size > 0 &&
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

                // Update category options
                const uniqueCategories = [...new Set(productList.map(product => product.category))].filter(Boolean);
                const categoriesWithCount = uniqueCategories.map(categoryName => ({
                    id: categoryName,
                    name: categoryName,
                    count: productList.filter(p => p.category === categoryName).length,
                }));
                setCategoryOptions(categoriesWithCount);

                // Update all brand options
                const allBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
                const allBrandsWithCount = allBrands.map(brandName => ({
                    id: brandName,
                    name: brandName,
                    count: productList.filter(p => p.brand_name === brandName).length,
                }));
                setAllBrandOptions(allBrandsWithCount);

                fetchCategories();

                // Apply client-side filtering check for brands (if necessary)
                if (selectedBrands.size > 0) {
                    productList = productList.filter(product => selectedBrands.has(product.brand_name));
                }
                setProducts(productList);

                // Recalculate dynamic min and max price
                if (productList.length > 0) {
                    const prices = productList.map(p => p.price);
                    const newMinPrice = Math.min(...prices);
                    const newMaxPrice = Math.max(...prices);

                    setMinPrice(newMinPrice);
                    setMaxPrice(newMaxPrice);

                    if (priceRange[0] < newMinPrice || priceRange[1] > newMaxPrice || priceRange[0] === 0 && priceRange[1] === 140) {
                        setPriceRange([newMinPrice, newMaxPrice]);
                    }
                } else {
                    setMinPrice(0);
                    setMaxPrice(0);
                    setPriceRange([0, 0]);
                }

                setFilteredProducts(productList);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setLoading(false);
            });
    }, [selectedCategories, searchQuery, selectedBrands, priceRange, minPrice, maxPrice, selectedFilters]);

    // Event handlers
    const handleCategoryChange = (categoryId) => {
        const newCategories = new Set(selectedCategories);
        if (newCategories.has(categoryId)) {
            newCategories.delete(categoryId);
        } else {
            newCategories.add(categoryId);
        }
        setSelectedCategories(newCategories);
        setSnackbarMessage('Category selection updated!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
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

    const handleBrandChange = (brandName) => {
        const newBrands = new Set(selectedBrands);
        if (newBrands.has(brandName)) {
            newBrands.delete(brandName);
        } else {
            newBrands.add(brandName);
        }
        setSelectedBrands(newBrands);
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
        }
        setPage(0);
    };

    const handleClearSearch = () => {
        setSelectedCategories(new Set());
        setSearchQuery('');
        setPage(0);
        setSortConfig({ key: 'sku', direction: 'asc' });
    };

    const toggleViewMode = (mode) => setViewMode(mode);

    // Initial data fetch and refetch on filter change
    useEffect(() => {
        fetchProducts();
    }, [selectedCategories, selectedFilters, searchQuery, selectedBrands, priceRange, fetchProducts]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchCategories();
    }, []);

    const appliedChips = getAppliedFilterChips();
    const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);

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
                    
                {/* Categories Section */}
          {/* Categories Section - Myntra style, always open, search overlaps title */}
<Box sx={{ mb: 2}}>
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: 36 }}>
        {/* Title */}
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
        {/* Search Field overlays title */}
        {showCategorySearch && (
            <TextField
                autoFocus
                placeholder="Search for Category"
                variant="outlined"
                size="small"
                value={categorySearch}
                onChange={handleCategorySearchChange}
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
                                setCategorySearch('');
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
    {/* Categories List */}
    <Box sx={{ mt: 1 ,}}>
        <FormGroup>
            {(showAllCategories
                ? categoryOptions.filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                : categoryOptions
                    .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                    .slice(0, 5)
            ).map((category) => (
                <FormControlLabel
                    key={category.id}
                    control={
                        <Checkbox
                            checked={selectedCategories.has(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
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
                            {category.name}
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
        {categoryOptions.length > 5 && !showAllCategories && (
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
                {`+ ${categoryOptions.length - 5} View all categories`}
            </Button>
        )}
    </Box>
</Box>

{/* Dialog for all categories */}
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
            value={categorySearch}
            onChange={handleCategorySearchChange}
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
            categoryOptions
                .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .forEach(category => {
                    const letter = category.name?.charAt(0)?.toUpperCase() || '';
                    if (!grouped[letter]) grouped[letter] = [];
                    grouped[letter].push(category);
                });
            const letters = Object.keys(grouped).sort();

            return letters.length > 0 ? (
                letters.map(letter => (
                    <Box key={letter}>
                        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {letter}
                            </Typography>
                        </Box>
                        <Divider />


                        <Grid container spacing={0}>
                            {grouped[letter].map(category => (
                                <Grid item xs={12} sm={6} md={4} key={category.id}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedCategories.has(category.id)}
                                                onChange={() => handleCategoryChange(category.id)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ fontSize: 13 }}>{category.name}</Typography>
                                                {category.count !== undefined && (
                                                    <Chip label={`${category.count} products`} size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                                                )}
                                            </Box>
                                        }
                                        sx={{
                                            px: 2,
                                            py: 1.5,
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
                setSelectedCategories(new Set());
                setCategorySearch('');
            }}
            color="error"
            variant="outlined"
            sx={{ fontSize: 12 }}
        >
            Reset
        </Button>
        <Button onClick={() => setShowAllCategories(false)} color="primary" variant="contained" sx={{ fontSize: 12 }}>
            Close
        </Button>
    </DialogActions>

</Dialog>

                <Divider sx={{ my: 1 }} />
{/* Brands Section - Myntra style, always open, search overlaps title */}
<Box sx={{ mb: 2}}>
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', height: 36 }}>
        {/* Title */}
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
        {/* Search Field overlays title */}
        {showBrandSearch && (
            <TextField
                autoFocus
                placeholder="Search for Brand"
                variant="outlined"
                size="small"
                value={brandSearch}
                onChange={handleBrandSearchChange}
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
                                setBrandSearch('');
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
    {/* Brands List */}
    <Box sx={{ mt: 1 }}>
        <FormGroup>
            {(showAllBrands
                ? allBrandOptions.filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                : allBrandOptions
                    .filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                    .slice(0, 5)
            ).map((brand) => (
                <FormControlLabel
                    key={brand.id}
                    control={
                        <Checkbox
                            checked={selectedBrands.has(brand.id)}
                            onChange={() => handleBrandChange(brand.id)}
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
                            {brand.name}
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
        {allBrandOptions.length > 5 && !showAllBrands && (
            <Button
                variant="text"
                size="small"
                onClick={() => setShowAllBrands(true)}
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
                {`+ ${allBrandOptions.length - 5} View all brands`}
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
            value={brandSearch}
            onChange={handleBrandSearchChange}
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
            allBrandOptions
                .filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                .forEach(brand => {
                    const letter = brand.name?.charAt(0)?.toUpperCase() || '';
                    if (!grouped[letter]) grouped[letter] = [];
                    grouped[letter].push(brand);
                });
            const letters = Object.keys(grouped).sort();

            return letters.length > 0 ? (
                letters.map(letter => (
                    <Box key={letter}>
                        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {letter}
                            </Typography>
                        </Box>
                        <Divider />
                        <Grid container spacing={0}>
                            {grouped[letter].map(brand => (
                                <Grid item xs={12} sm={6} md={4} key={brand.id}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedBrands.has(brand.id)}
                                                onChange={() => handleBrandChange(brand.id)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ fontSize: 13 }}>{brand.name}</Typography>
                                                <Chip label={`${brand.count || 0} products`} size="small" sx={{ ml: 1, height: 18, fontSize: 11 }} />
                                            </Box>
                                        }
                                        sx={{
                                            px: 2,
                                            py: 1.5,
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
                setSelectedBrands(new Set());
                setBrandSearch('');
            }}
            color="error"
            variant="outlined"
            sx={{ fontSize: 12 }}
        >
            Reset
        </Button>
        <Button onClick={() => setShowAllBrands(false)} color="primary" variant="contained" sx={{ fontSize: 12 }}>
            Close
        </Button>
    </DialogActions>
</Dialog>


                <Divider sx={{ my: -1 }} />
                {/* Price Range Section */}
                <Box sx={{ mb:1, mt: 3 }}>
    <Box sx={{ fontWeight: 'bold', fontSize: 13, mb: 0.5, color: '#333', fontFamily: 'Roboto, Arial, sans-serif' }}>Price</Box>
    <Slider
        value={priceRange}
        onChange={(event, newValue) => setPriceRange(newValue)}
        valueLabelDisplay="off"
        min={minPrice}
        max={maxPrice}
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
            ${priceRange[0]}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#222', fontWeight: 400 }}>
            ${priceRange[1]}
        </Typography>
    </Box>
</Box>

                {/* Other Filters Section */}
                {categoryFilters.map((filter, index) => (
                    <Accordion key={index} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: '35px', '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' } }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '13px', color: '#333', fontFamily: 'Roboto, Arial, sans-serif' }}>{filter.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: '0 0 4px 0' }}>
                            {filter.options.map((option, optionIndex) => (
                                <FormControlLabel
                                    key={optionIndex}
                                    control={<Checkbox
                                        checked={selectedFilters[filter.name]?.includes(option.label) || false}
                                        onChange={() => handleFilterChange(filter.name, option.label)}
                                        size="small"
                                        sx={{
                                            color: '#2563EB',
                                            '&.Mui-checked': { color: '#2563EB' },
                                            p: '0px',
                                            fontSize: 16,
                                            '& .MuiSvgIcon-root': { fontSize: 16 }
                                        }}
                                    />}
                                    label={<Typography sx={{ fontSize: 12, color: '#222', fontWeight: 500, fontFamily: 'Roboto, Arial, sans-serif', ml: 1.5 }}>{option.label}</Typography>}
                                    sx={{
                                        m: 0,
                                        py: 0.1,
                                        pl: 0.5,
                                        minHeight: 20,
                                        ml: 1,
                                        '& .MuiFormControlLabel-label': {
                                            lineHeight: '1.2'
                                        }
                                    }}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
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
    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                        <Typography variant="body2">Total Products: {products.length}</Typography>
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
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#222' }}>
            Applied Filters:
        </Typography>
        {appliedChips.map((filter) => (
            <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => handleRemoveFilter(filter.type, filter.value, filter.filterName)}
                size="small"
                sx={{
                     backgroundColor: '#fff',
                    color: '#444', // dark gray/black text
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
                                            { label: 'SKU', key: 'sku' },
                                            { label: 'Title', key: 'name' },
                                            { label: 'MPN', key: 'mpn' },
                                            { label: 'Category', key: 'category' },
                                            { label: 'Brand', key: 'brand_name' },
                                            { label: 'Price', key: 'price' },
                                        ].map((col, index) => (
                                            <TableCell
                                                key={index}
                                                sx={{ textAlign: 'center', cursor: col.key ? 'pointer' : 'default', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '14px' }}
                                                onClick={col.key ? () => sortProducts(col.key) : undefined}
                                            >
                                                {col.label} {col.key ? getSortSymbol(col.key) : ''}
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
                                    ) : filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                No Data Found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                       filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((product) => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ textDecoration: 'none' }}>
                                                            {/* FIXED: Robust Image/Thumbnail Handling for List View */}
                                                            <img
                                                                src={
                                                                    product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))
                                                                        ? product.image_url
                                                                        : 'https://placehold.co/40x40?text=No+Img' // Placeholder URL for missing image
                                                                }
                                                                alt={product.name}
                                                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://placehold.co/40x40?text=No+Img"; // Fallback on load error
                                                                }}
                                                            />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' ,fontSize: 13 }}>{product.sku}</TableCell>
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
                                <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
                                    {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => (
                                        <Grid item xs={12} sm={6} md={4} lg={2} xl={2} key={product.id} sx={{ display: 'flex', justifyContent: 'center', paddingLeft: '8px !important', paddingTop: '8px !important' }}>
                                            <Card
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: '200px',
                                                    height: '370px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #f0f0f0',
                                                    borderRadius: '6px',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                                    transition: 'all 0.2s ease-in-out',
                                                    cursor: 'pointer',
                                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transform: 'translateY(-2px)' }
                                                }}
                                            >
                                                <IconButton
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
                                                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width: 28, height: 28, '&:hover': { backgroundColor: 'rgba(255,255,255,1)', transform: 'scale(1.1)' } }}
                                                    size="small"
                                                >
                                                    {favorites.has(product.id) ? (
                                                        <FavoriteIcon sx={{ fontSize: 14, color: '#ff3e6c' }} />
                                                    ) : (
                                                        <FavoriteBorderIcon sx={{ fontSize: 14, color: '#878787' }} />
                                                    )}
                                                </IconButton>
                                                <Link to={`/details/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                    <Box
                                                        sx={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
                                                    >
                                                        {/* FIXED: Robust Image/Thumbnail Handling for Card View */}
                                                        <CardMedia
                                                            component="img"
                                                            image={
                                                                product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))
                                                                    ? product.image_url
                                                                    : 'https://placehold.co/150x150?text=No+Img' // Placeholder URL for missing image
                                                            }
                                                            alt={product.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "https://placehold.co/150x150?text=No+Img"; // Fallback on load error
                                                            }}
                                                            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }}
                                                        />
                                                    </Box>
                                                    <CardContent sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '12px !important' }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontSize: '12px',
                                                               
                                                                lineHeight: 1.3,
                                                                mb: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitBoxOrient: 'vertical',
                                                                WebkitLineClamp: 2,
                                                                minHeight: '30px',
                                                                color: '#212121'
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        <Box sx={{ mt: 1, fontSize: '12px', color: '#6c757d', textAlign: 'left' }}>
                                                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>SKU:</b> {product.sku}</Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>MPN:</b> {product.mpn || 'N/A'}</Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>Category:</b> {product.category}</Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>Brand:</b> {product.brand_name || 'N/A'}</Typography>
                                                        </Box>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 0.5 }}>${product.price}</Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Link>
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
    count={filteredProducts.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={(event, newPage) => setPage(newPage)}
    onRowsPerPageChange={handleChangeRowsPerPage}
    labelRowsPerPage="Rows per page:"
    sx={{
        '& .MuiTablePagination-actions': {
            marginRight: '28px', // reduce this value as needed (e.g., '8px')
        },
    }}
/>
</Box>
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
        zIndex: 9999,
        backgroundColor: '#2563EB'
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
                            overflow: 'hidden'
                        }
                    }}
                >
                    <DialogTitle style={{ backgroundColor: '#2563EB', textAlign: 'center', fontWeight: 'bold', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '40px' }}>
                        <Typography sx={{ marginTop: '5px', fontSize: maximized ? '18px' : '14px', fontWeight: 600, color: 'white' }}>Product Finder</Typography>
                        <Box sx={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Tooltip title="Minimize">
                                <span>
                                    <Button size="small" onClick={() => maximized && toggleDialogSize()} disabled={!maximized} sx={{ minWidth: '32px', color: 'white', height: '32px', padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MinimizeOutlinedIcon fontSize="small" sx={{ mt: '-6px' }} />
                                    </Button>
                                </span>
                            </Tooltip>
                            <Tooltip title="Maximize">
                                <span>
                                    <Button size="small" onClick={() => !maximized && toggleDialogSize()} disabled={maximized} sx={{ minWidth: '32px', height: '32px', marginTop: '5px', color: 'white', padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CropSquareIcon fontSize="small" />
                                    </Button>
                                </span>
                            </Tooltip>
                            <Tooltip title="Close">
                                <Button onClick={() => setShowPopup(false)} size="small" sx={{ marginTop: '5px', color: 'white', minWidth: '32px', height: '32px', padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CloseIcon fontSize="small" />
                                </Button>
                            </Tooltip>
                        </Box>
                    </DialogTitle>
                    {maximized && (
                        <>
                            <DialogContent dividers>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: '48px', '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' } }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Categories</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
                                        {categoryOptions.map((category) => (
                                            <FormControlLabel
                                                key={category.id}
                                                control={<Checkbox checked={selectedCategories.has(category.id)} onChange={() => handleCategoryChange(category.id)} size="small" sx={{ padding: '4px' }} />}
                                                label={<Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>{category.name}</Typography>}
                                                sx={{ display: 'flex', mb: 0.5, '& .MuiFormControlLabel-label': { ml: 1 } }}
                                            />
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: '48px', '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' } }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Brands</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
                                        {allBrandOptions.map((brand) => (
                                            <FormControlLabel
                                                key={brand.id}
                                                control={<Checkbox checked={selectedBrands.has(brand.id)} onChange={() => handleBrandChange(brand.id)} size="small" sx={{ padding: '4px' }} />}
                                                label={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#333' }}>{brand.name}</Typography>
                                                        <Typography variant="body2" sx={{ fontSize: '12px', color: '#6c757d' }}>({brand.count})</Typography>
                                                    </Box>
                                                }
                                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, width: '100%', margin: 0, padding: '4px 0', '& .MuiFormControlLabel-label': { width: '100%', marginLeft: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }}
                                            />
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                                {categoryFilters.map((filter, index) => (
                                    <Accordion key={index}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#cfd3df' }}>
                                            <Typography variant="subtitle1" sx={{ fontSize: '14px' }}>{filter.name}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {filter.options.map((option, optionIndex) => (
                                                <FormControlLabel
                                                    key={optionIndex}
                                                    control={<Checkbox checked={selectedFilters[filter.name]?.includes(option.label) || false} onChange={() => handleFilterChange(filter.name, option.label)} />}
                                                    label={option.label}
                                                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                                                />
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </DialogContent>
                            <DialogActions>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                    <Tooltip title="Reset All Filters" arrow>
                                        <Button variant="text" color="error" onClick={handleClearFilters} sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <RestartAltIcon fontSize="small" />
                                            Reset All
                                        </Button>
                                    </Tooltip>
                                    <Button onClick={() => setShowPopup(false)} color="primary">Close</Button>
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