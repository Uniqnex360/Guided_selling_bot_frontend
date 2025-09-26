import React, { useEffect, useState } from 'react';
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
    FormControl,
    Select,
    MenuItem,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Snackbar,
    Alert,
    Slider,
    Divider,
    Pagination,
    PaginationItem,
    Stack,
    Chip,
    FormGroup,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import { ListAlt as ListAltIcon, GridView as GridViewIcon } from '@mui/icons-material';
import DotLoading from '../Loading/DotLoading';
import { API_BASE_URL } from '../../utils/config';

const ProductList = () => {
    // State variables
    const [products, setProducts] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' });
    const [loading, setLoading] = useState(true);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
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
    const [showAllBrands, setShowAllBrands] = useState(false);
    const [dialogSize, setDialogSize] = useState({ width: 400, height: 450 });
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(140);
    const [priceRange, setPriceRange] = useState([0, 140]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    
    const [allBrandOptions, setAllBrandOptions] = useState([]);
    const [brandSearch, setBrandSearch] = useState('');
    const [selectedBrands, setSelectedBrands] = useState(new Set());
    const [favorites, setFavorites] = useState(new Set());
    const [selectedCategories, setSelectedCategories] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
const [showAllCategories, setShowAllCategories] = useState(false);

const handleClearCategoryFilter = () => {
    setSelectedCategories(new Set());
    setCategorySearch('');
};
const handleClearBrandFilter = () => {
    setSelectedBrands(new Set());
    setBrandSearch('');
};
const handleCategorySearchChange = (e) => {
    setCategorySearch(e.target.value);
};
const handleBrandSearchChange = (e) => {
    setBrandSearch(e.target.value);
}

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

    const getAppliedFilterNames = () => {
        const filters = [];
        if (selectedCategories.size > 0) {
            const categoryNames = Array.from(selectedCategories).map(id => {
                const category = categoryOptions.find(c => c.id === id);
                return category ? category.name : '';
            }).filter(Boolean);
            filters.push(`Categories: ${categoryNames.join(', ')}`);
        }
        if (selectedBrands.size > 0) {
            filters.push(`Brands: ${Array.from(selectedBrands).join(', ')}`);
        }
        Object.entries(selectedFilters).forEach(([filterName, values]) => {
            if (values.length > 0) {
                filters.push(`${filterName}: ${values.join(', ')}`);
            }
        });
        if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
            filters.push(`Price Range: $${priceRange[0]} - $${priceRange[1]}`);
        }
        if (searchQuery.trim() !== '') {
            filters.push(`Search Query: "${searchQuery.trim()}"`);
        }
        return filters;
    };

    // API functions
    const fetchFilters = (categoryId) => {
        setLoading(true);
        fetch(`${API_BASE_URL}/category_filters/?category_id=${categoryId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(data => {
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
const fetchCategories = () => {
    fetch(`${API_BASE_URL}/fourth_level_categories/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())
        .then(data => {
            // Assuming API returns an array of categories with id and name
            setCategoryOptions(data.data.categories || []);
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
};
    const fetchProducts = () => {
        setLoading(true);
        const requestBody = {
            ...(selectedCategories.size > 0 && { category_ids: Array.from(selectedCategories) }),
            search_query: searchQuery?.trim() || '',
            ...(selectedBrands.size > 0 && { brands: Array.from(selectedBrands) }),
        };
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

                // Extract unique categories from the fetched products
                const uniqueCategories = [...new Set(productList.map(product => product.category))].filter(Boolean);
                const categoriesWithCount = uniqueCategories.map(categoryName => ({
                    id: categoryName,
                    name: categoryName,
                    count: productList.filter(p => p.category === categoryName).length,
                }));
                setCategoryOptions(categoriesWithCount);

                // Always extract all unique brands from the full product list (not filtered)
                const allProducts = responseData.data?.products || [];
            const allBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
            const allBrandsWithCount = allBrands.map(brandName => ({
                id: brandName,
                name: brandName,
                count: productList.filter(p => p.brand_name === brandName).length,
            }));
                  setAllBrandOptions(allBrandsWithCount);

            fetchCategories(); // <-- refresh categories
            

                // Now filter products by selected brands if any
                if (selectedBrands.size > 0) {
                    productList = productList.filter(product => selectedBrands.has(product.brand_name));
                }
                setProducts(productList);

                // Calculate dynamic min and max price
                if (productList.length > 0) {
                    const prices = productList.map(p => p.price);
                    const newMinPrice = Math.min(...prices);
                    const newMaxPrice = Math.max(...prices);
                    setMinPrice(newMinPrice);
                    setMaxPrice(newMaxPrice);
                    setPriceRange([newMinPrice, newMaxPrice]);
                } else {
                    setMinPrice(0);
                    setMaxPrice(0);
                    setPriceRange([0, 0]);
                }

                setFilteredProducts(productList);

                // For filtered brandOptions, you can use:
                const uniqueBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
                const brandsWithCount = uniqueBrands.map(brandName => ({
                    id: brandName,
                    name: brandName,
                    count: productList.filter(p => p.brand_name === brandName).length,
                }));
                setBrandOptions(brandsWithCount);

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setLoading(false);
            });
    };

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

    const handlePriceRangeChange = (rangeId) => {
        if (selectedPriceRanges.includes(rangeId)) {
            setSelectedPriceRanges(selectedPriceRanges.filter(id => id !== rangeId));
        } else {
            setSelectedPriceRanges([...selectedPriceRanges, rangeId]);
        }
    };

    const handleClearFilters = () => {
        setSelectedCategories(new Set());
        setSelectedFilters({});
        setSelectedBrands(new Set());
        setSelectedPriceRanges([]);
        setPriceRange([minPrice, maxPrice]);
        setCategoryFilters([]);
        setSearchQuery('');
        setPage(0);
        setSortConfig({ key: 'sku', direction: 'asc' });
        fetchProducts();
        setSnackbarMessage('Reset successfully!');
        setSnackbarSeverity('error');
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
        setPage(newPage - 1);
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
        const requestBody = { search_query: '' };
        fetch(`${API_BASE_URL}/productList/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(responseData => {
                const productList = responseData.data?.products || [];
                setProducts(productList);
                setFilteredProducts(productList);

                if (productList.length > 0) {
                    const prices = productList.map(p => p.price);
                    const newMinPrice = Math.min(...prices);
                    const newMaxPrice = Math.max(...prices);
                    setMinPrice(newMinPrice);
                    setMaxPrice(newMaxPrice);
                    setPriceRange([newMinPrice, newMaxPrice]);
                } else {
                    setMinPrice(0);
                    setMaxPrice(0);
                    setPriceRange([0, 0]);
                }

                // Also update allBrandOptions on clear
                const allBrands = [...new Set(productList.map(product => product.brand_name))].filter(Boolean);
                const allBrandsWithCount = allBrands.map(brandName => ({
                    id: brandName,
                    name: brandName,
                    count: productList.filter(p => p.brand_name === brandName).length,
                }));
                setAllBrandOptions(allBrandsWithCount);

                setSnackbarMessage('Reset successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setSnackbarMessage('Something went wrong!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            });
    };

    const toggleViewMode = (mode) => setViewMode(mode);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line
    }, [selectedCategories, selectedFilters, searchQuery, selectedBrands]);


// Call fetchCategories on mount and when needed
useEffect(() => {
    fetchCategories();
}, []);
    const appliedFilters = getAppliedFilterNames();
    const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Left Sidebar */}
            <Box
                sx={{
                    width: 200,
                    backgroundColor: '#fff',
                    borderRight: '1px solid #e0e0e0',
                    padding: 2,
                    overflow: 'auto',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {/* Categories Section */}
<Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
    <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
            p: 0,
            minHeight: '48px',
            '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' },
        }}
    >
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
            Categories
        </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
        <Box mb={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
<TextField
    placeholder="Search categories..."
    variant="outlined"
    size="small"
    fullWidth
    value={categorySearch}
    onChange={handleCategorySearchChange}
/>
                <IconButton
                    size="small"
                    onClick={handleClearCategoryFilter}
                    sx={{ ml: 1 }}
                    aria-label="Clear categories"
                >
                    <RestartAltIcon fontSize="small" />
                </IconButton>
            </Box>
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
                                    p: '4px',
                                    mr: 1.5,
                                    alignSelf: 'flex-start',
                                }}
                            />
                        }
                        label={
                            <Box display="flex" alignItems="center">
                                <Typography variant="body2">{category.name}</Typography>
                                <Chip
                                    label={category.count || 0}
                                    size="small"
                                    sx={{ ml: 1, height: 18 }}
                                />
                            </Box>
                        }
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5,
                            pl: 0.5,
                            '& .MuiFormControlLabel-label': {
                                marginLeft: 0,
                                flex: 1,
                            },
                            minHeight: 32,
                        }}
                    />
                ))}
            </FormGroup>
            {categoryOptions.length > 5 && (
                <Button
                    variant="text"
                    size="small"
                    endIcon={<ExpandMoreIcon />}
                    onClick={() => setShowAllCategories((prev) => !prev)}
                    sx={{
                        textTransform: 'none',
                        color: '#1976d2',
                        mt: 1,
                        fontSize: '14px'
                    }}
                >
                    {showAllCategories
                        ? 'Show less'
                        : `View all categories (${categoryOptions.length})`}
                </Button>
            )}
        </Box>
    </AccordionDetails>
</Accordion>

                {/* Brands Section */}
                <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            p: 0,
                            minHeight: '48px',
                            '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' },
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                            Brands
                        </Typography>
                    </AccordionSummary>
                   <AccordionDetails sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
        <Box mb={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
<TextField
    placeholder="Search brands..."
    variant="outlined"
    size="small"
    fullWidth
    value={brandSearch}
    onChange={handleBrandSearchChange}
/>
                <IconButton
                    size="small"
                    onClick={handleClearBrandFilter}
                    sx={{ ml: 1 }}
                    aria-label="Clear brands"
                >
                    <RestartAltIcon fontSize="small" />
                </IconButton>
            </Box>
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
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2">{brand.name}</Typography>
                                                <Chip
                                                    label={brand.count || 0}
                                                    size="small"
                                                    sx={{ ml: 1, height: 18 }}
                                                />
                                            </Box>
                                        }
                                        sx={{
                                            '& .MuiTypography-root': { fontSize: '14px' },
                                            mb: 0.5
                                        }}
                                    />
                                ))}
                            </FormGroup>
                            {allBrandOptions.length > 5 && (
                                <Button
                                    variant="text"
                                    size="small"
                                    endIcon={<ExpandMoreIcon />}
                                    onClick={() => setShowAllBrands((prev) => !prev)}
                                    sx={{
                                        textTransform: 'none',
                                        color: '#1976d2',
                                        mt: 1,
                                        fontSize: '14px'
                                    }}
                                >
                                    {showAllBrands
                                        ? 'Show less'
                                        : `View all brands (${allBrandOptions.length})`}
                                </Button>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Divider sx={{ my: 1 }} />
                {/* Price Range Section */}
                <Accordion defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            p: 0,
                            minHeight: '48px',
                            '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' },
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                            Price Range
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 1 }}>
                        <Box sx={{ px: 0 }}>
                            <Slider
                                value={priceRange}
                                onChange={(event, newValue) => setPriceRange(newValue)}
                                valueLabelDisplay="auto"
                                min={minPrice}
                                max={maxPrice}
                                sx={{
                                    color: '#2563EB',
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                        backgroundColor: 'white',
                                        border: '1px solid #2563EB',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                        '&:focus, &:hover, &.Mui-active': { boxShadow: '0 1px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(37,99,235,0.16)' },
                                    },
                                    '& .MuiSlider-rail': { height: 4, backgroundColor: '#e0e0e0', borderRadius: '2px' },
                                    '& .MuiSlider-track': { height: 4, backgroundColor: '#2563EB', borderRadius: '2px' },
                                    '& .MuiSlider-valueLabel': { backgroundColor: '#2563EB' },
                                }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                                <TextField
                                    size="small"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                    sx={{
                                        width: 80,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '4px',
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&:hover fieldset': { borderColor: '#999' },
                                            '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                        },
                                        '& .MuiInputBase-input': { fontSize: '14px', padding: '8px 10px' }
                                    }}
                                />
                                <Typography sx={{ fontSize: '1px', color: '#6c757d' }}>to</Typography>
                                <TextField
                                    size="small"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                                    sx={{
                                        width: 120,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '4px',
                                            '& fieldset': { borderColor: '#ddd' },
                                            '&:hover fieldset': { borderColor: '#999' },
                                            '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                        },
                                        '& .MuiInputBase-input': { fontSize: '14px', padding: '8px 10px' }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => {}}
                                    sx={{ minWidth: 'auto', padding: '8px 16px', fontSize: '8px', textTransform: 'uppercase', backgroundColor: '#2563EB', boxShadow: 'none', '&:hover': { backgroundColor: '#1e4baf', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' } }}
                                >
                                    GO
                                </Button>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
                <Divider sx={{ my: 1 }} />
                {/* Other Filters Section */}
                {categoryFilters.map((filter, index) => (
                    <Accordion key={index} defaultExpanded sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: 0, minHeight: '48px', '& .MuiAccordionSummary-content': { m: 0, justifyContent: 'space-between', alignItems: 'center' } }}>
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
                {/* Clear All Button */}
                <Box sx={{ mt: 'auto', p: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={handleClearFilters}
                        sx={{
                            textTransform: 'none',
                            fontSize: '14px',
                            padding: '8px 16px',
                            borderColor: '#2563EB',
                            color: '#2563EB',
                            '&:hover': {
                                borderColor: '#1e4baf',
                                backgroundColor: 'rgba(37, 99, 235, 0.04)'
                            }
                        }}
                    >
                        Clear All
                    </Button>
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
                            sx={{ width: 300 }}
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
                {/* Applied Filters Section */}
                {appliedFilters.length > 0 && (
                    <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>Applied Filters:</Typography>
                        {appliedFilters.map((filter, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                sx={{
                                    backgroundColor: '#e6f0ff',
                                    color: '#2563EB',
                                    fontWeight: 600,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            >
                                {filter}
                            </Typography>
                        ))}
                    </Box>
                )}
                {/* Content Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f1f3f6' }}>
                    {viewMode === 'list' ? (
                        <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 50, maxWidth: 60, width: 60 }}>Image</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 60, maxWidth: 80, width: 80 }} onClick={() => sortProducts('sku')}>SKU {getSortSymbol('sku')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 120, maxWidth: 180, width: 180 }} onClick={() => sortProducts('name')}>Title {getSortSymbol('name')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 60, maxWidth: 80, width: 80 }} onClick={() => sortProducts('mpn')}>MPN {getSortSymbol('mpn')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 80, maxWidth: 100, width: 100 }} onClick={() => sortProducts('category')}>Category {getSortSymbol('category')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 80, maxWidth: 100, width: 100 }} onClick={() => sortProducts('brand_name')}>Brand {getSortSymbol('brand_name')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#f5f5f5', fontSize: '13px', padding: '6px 8px', minWidth: 60, maxWidth: 80, width: 80 }} onClick={() => sortProducts('price')}>Price {getSortSymbol('price')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ fontSize: '13px', padding: '12px 0' }}>
                                                <DotLoading />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ fontSize: '13px', padding: '12px 0' }}>
                                                No Data Found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((product) => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell sx={{ textAlign: 'center', padding: '4px 6px', minWidth: 50, maxWidth: 60, width: 60 }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ textDecoration: 'none' }}>
                                                            <img
                                                                src={
                                                                    product.image_url && (product.image_url.startsWith('http://') || product.image_url.startsWith('https://'))
                                                                        ? product.image_url
                                                                        : 'https://placehold.co/40x40?text=No+Img'
                                                                }
                                                                alt={product.name}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    objectFit: 'contain',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #ddd'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://placehold.co/40x40?text=No+Img";
                                                                }}
                                                            />
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontSize: '13px', padding: '4px 6px', minWidth: 60, maxWidth: 80, width: 80 }}>{product.sku}</TableCell>
                                                    <TableCell sx={{ textAlign: 'left', fontSize: '13px', padding: '4px 6px', minWidth: 120, maxWidth: 180, width: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            <Typography component="span" sx={{ fontWeight: 'bold', color: '#212121', fontSize: '13px' }}>
                                                                {product.name}
                                                            </Typography>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontSize: '13px', padding: '4px 6px', minWidth: 60, maxWidth: 80, width: 80 }}>
                                                        <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                            <Typography component="span" sx={{ color: '#212121', fontSize: '13px' }}>
                                                                {product.mpn}
                                                            </Typography>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontSize: '13px', padding: '4px 6px', minWidth: 80, maxWidth: 100, width: 100 }}>{product.category}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontSize: '13px', padding: '4px 6px', minWidth: 80, maxWidth: 100, width: 100 }}>{product.brand_name || 'N/A'}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center', fontSize: '13px', padding: '4px 6px', minWidth: 60, maxWidth: 80, width: 80 }}>${product.price}</TableCell>
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
        width: '120%',
        maxWidth: '180px',
        height: '380px',
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
                                                <Link to={`/details/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
        <Box
            sx={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5, borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}
        >
            <CardMedia
                component="img"
                image={product.image_url}
                alt={product.name}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150";
                }}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }}
            />
        </Box>
                                                   <CardContent
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1.5,
                paddingBottom: '12px !important',
                height: '100%',
            }}
        >
            <Typography
                variant="body1"
                sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    minHeight: '32px',
                    color: '#212121'
                }}
            >
                                                            {product.name}
                                                         </Typography>
            <Box
                sx={{
                    fontSize: '12px',
                    color: '#6c757d',
                    textAlign: 'left',
                    minHeight: '70px',
                    mb: 1,
                }}
            >
                <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>SKU:</b> {product.sku}</Typography>
                <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>MPN:</b> {product.mpn || 'N/A'}</Typography>
                <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>Category:</b> {product.category}</Typography>
                <Typography variant="body2" sx={{ fontSize: '12px', mb: 0.5 }}><b>Brand:</b> {product.brand_name || 'N/A'}</Typography>
            </Box>
            <Box sx={{ mt: 'auto' }}>
                <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 0.5 }}>
                    ${product.price}
                </Typography>
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
                <Box sx={{ borderTop: '1px solid #e0e0e0', backgroundColor: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#6c757d' }}>Rows per page:</Typography>
                        <FormControl variant="outlined" size="small">
                            <Select
                                value={rowsPerPage}
                                onChange={handleChangeRowsPerPage}
                                sx={{ fontSize: '14px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' } }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Stack spacing={2} direction="row" alignItems="center">
                        <Pagination
                            count={pageCount}
                            page={page + 1}
                            onChange={handleChangePage}
                            renderItem={(item) => (
                                <PaginationItem
                                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                                    {...item}
                                />
                            )}
                        />
                    </Stack>
                </Box>
                {/* Floating Product Finder Button */}
                <Button
                    variant="contained"
                    color="primary"
                    style={{ position: 'fixed', bottom: '15px', right: '10px', width: '60px', height: '60px', borderRadius: '50%', fontSize: '24px', zIndex: 9999, backgroundColor: '#2563EB' }}
                    onClick={() => { setShowPopup(true); setSearchQuery(''); setPage(0); }}
                >
                    ❓
                </Button>
                {/* Product Finder Dialog */}


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
                            width: isMobile ? '95%' : maximized ? dialogSize.width : 250,
                            height: isMobile ? '85%' : maximized ? dialogSize.height : 60,
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
                                {/* Category Dropdown */}
                                <FormControl fullWidth margin="normal">
                                    <Select
                                        value={selectedCategoryId}
                                        displayEmpty
                                        onChange={e => {
                                            setSelectedCategoryId(e.target.value);
                                            if (e.target.value) {
                                                // Fetch filters for selected category
                                                fetch(`${API_BASE_URL}/category_filters/?category_id=${e.target.value}`, {
                                                    method: 'GET',
                                                    headers: { 'Content-Type': 'application/json' },
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        const filters = data.data.filters;
                                                        const filtersWithCheckbox = filters.map((filter) => ({
                                                            ...filter,
                                                            options: filter.config.options.map((option) => ({
                                                                label: option.toString().trim(),
                                                                checked: false,
                                                            })),
                                                        }));
                                                        setCategoryFilters(filtersWithCheckbox);
                                                    });
                                            } else {
                                                setCategoryFilters([]);
                                            }
                                        }}
                                        sx={{ fontSize: '14px' }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Category</em>
                                        </MenuItem>
                                        {categoryOptions.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Attribute Filters */}
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
                                                            onChange={() => {
                                                                const newFilters = { ...selectedFilters };
                                                                if (newFilters[filter.name]) {
                                                                    if (newFilters[filter.name].includes(option.label)) {
                                                                        newFilters[filter.name] = newFilters[filter.name].filter(f => f !== option.label);
                                                                    } else {
                                                                        newFilters[filter.name].push(option.label);
                                                                    }
                                                                } else {
                                                                    newFilters[filter.name] = [option.label];
                                                                }
                                                                setSelectedFilters(newFilters);
                                                            }}
                                                        />
                                                    }
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
                                        <Button variant="text" color="error" onClick={() => {
                                            setSelectedCategoryId('');
                                            setSelectedFilters({});
                                            setCategoryFilters([]);
                                        }} sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
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