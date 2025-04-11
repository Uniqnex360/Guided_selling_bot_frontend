import React, { useEffect, useState } from 'react';
import {
    Container,
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
    TableBody, Tooltip,
    TablePagination, FormControlLabel, FormControl, InputLabel,Select,MenuItem,Checkbox,  Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    
  } from '@mui/material';
  import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './responsive.css';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  
import CloseIcon from '@mui/icons-material/Close';
import { Edit as EditIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ListAlt as ListAltIcon, GridView as GridViewIcon } from '@mui/icons-material';
import DotLoading from '../Loading/DotLoading';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // Added state to track the view mode
    const [sortConfig, setSortConfig] = useState({ key: 'sku', direction: 'asc' }); // Sorting state
    const [loading, setLoading] = useState(true); // Loading state
    const [noDataFound, setNoDataFound] = useState(false); // No data found state
    const [allProducts, setAllProducts] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [categoryOptions, setCategoryOptions] = useState([]);
    const queryParams = new URLSearchParams(window.location.search);

    const initialPage = parseInt(queryParams.get('page'), 10) || 0; // Default to 0 if no page param exists
    const [page, setPage] = useState(initialPage);
  
    const [categoryFilters, setCategoryFilters] = useState([]);
// const selectedCategory = categoryOptions.find(cat => cat.id === selectedCategoryId);

    // Get the sort symbol for each column
    const getSortSymbol = (column) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? '↑' : '↓';
        }
        return '↕'; // Default sorting symbol for unsorted columns
    };

    const fetchCategories = () => {
        setLoading(true);
        fetch("https://product-assistant-gpt.onrender.com/fourth_level_categories/")
            .then(response => response.json())
            .then(data => {
                setCategoryOptions(data.data.categories || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    };

// Fetch filters based on categoryId
  // Fetch filters based on categoryId
  const fetchFilters = (categoryId) => {
    setLoading(true); // Start loading for filters
    fetch(`https://product-assistant-gpt.onrender.com/category_filters/?category_id=${categoryId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        const filters = data.data.filters;
        const filtersWithCheckbox = filters.map(filter => {
            return {
                ...filter,
                options: filter.config.options.map(option => ({
                    label: option.trim(),
                    checked: false,
                }))
            };
        });
        setCategoryFilters(filtersWithCheckbox);
        setLoading(false); // Stop loading after filters are fetched
    })
    .catch(error => {
        console.error('Error fetching filters:', error);
        setLoading(false); // Stop loading even if there's an error
    });
};


// Handle category selection change
const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);

    // Find the selected category name based on the categoryId
    const selectedCategory = categoryOptions.find(cat => cat.id === categoryId);
    setSelectedCategoryName(selectedCategory ? selectedCategory.name : '');

    // Fetch the filters for the selected category
    if (categoryId) {
        fetchFilters(categoryId);
    }
};

    // Handle filter option change
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

    // Handle filter clearing
    const handleClearFilters = () => {
        setSelectedCategoryId('');
        setSelectedCategoryName('');
        setSelectedFilters({});
        setCategoryFilters([]);
        setCategoryOptions([]);
        fetchCategories()
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchFilters(selectedCategoryId);
            fetchProducts();
        }
    }, [selectedCategoryId]);

    useEffect(() => {
        fetchProducts();
    }, []);
    const fetchProducts = () => {
        setLoading(true); // Start loading
        fetch('https://product-assistant-gpt.onrender.com/productList/', {
            method: 'POST', // Assuming the method is POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...(selectedCategoryId && { category_id: selectedCategoryId }),
                search_query : ''
                // collection_name: selectedCategoryName,
            }),
        })
            .then(response => response.json())
            .then(responseData => {
                setProducts(responseData.data?.products || []);
                setLoading(false); // Stop loading after data is fetched
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setLoading(false); // Stop loading even if there's an error
            });
    };

    // Effect to fetch products when categoryId or filters change
    useEffect(() => {
        if (selectedCategoryId && Object.keys(selectedFilters).length > 0) {
            fetchProducts(); // Fetch products when category or filters change
        }
    }, [selectedCategoryId, selectedFilters]); // Depend on selectedCategoryId and selectedFilters

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product =>
                product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
            setNoDataFound(filtered.length === 0); // Set No Data Found if no products match search query
        } else {
            setFilteredProducts(products);
            setNoDataFound(products.length === 0); // Set No Data Found if no products available
        }
    }, [searchQuery, products]);

    // Sorting function
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

      // if(searchQuery){
      //   fetchProducts()
      // }
        setSearchQuery(event.target.value);
        setPage(0);
    };

    const handleClearSearch = () => {
      console.log('select',selectedCategoryId)
      setSearchQuery('');
      setFilteredProducts(products);
      setPage(0);
      setSortConfig({ key: 'sku', direction: 'asc' });
    
      // ✅ Clear category and refetch full list
    if(selectedCategoryId){
      fetchProducts()
      // fetchCategories()
    }
      // fetchProducts('');
  
    
        // Show snackbar
        setOpenSnackbar(true);
    };
    
    // Toggle between grid and list view
    const toggleViewMode = (mode) => {
        setViewMode(mode);
    };

    // if (loading) {
    //     return (
    //         <Container maxWidth="lg">
    //             <Typography variant="h4" sx={{ fontSize: '18px' }} gutterBottom>
    //                 Products
    //             </Typography>
    //             {/* <div style={{marginTop:'10%'}}><DotLoading/></div> */}
    //         </Container>
    //     );
    // }

    return (
        <Container  maxWidth={false} sx={{ maxWidth: '100% !important', width: '100%' }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginTop:'15px', marginBottom: '20px', p: { xs: 1, sm: 2, md: 3 } }}>
  <Typography variant="h4" gutterBottom sx={{fontSize:'21px'}}>
    Products
  </Typography>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>

  <Box sx={{ marginRight: '5px' }}>
  <Tooltip title="List View">
    <Button
      variant="outlined"
      onClick={() => toggleViewMode('list')}
      sx={{
        marginRight: 1,
        backgroundColor: viewMode === 'list' ? '#1a73e8' : 'white',
        color: viewMode === 'list' ? 'white' : '#1a73e8',
        borderColor: '#1a73e8',
        '&:hover': {
          backgroundColor: viewMode === 'list' ? '#1669c1' : '#f0f0f0',
        },
        '&:active': {
          backgroundColor: viewMode === 'list' ? '#0f5bb5' : '#e0e0e0',
        },
      }}
    >
      <ListAltIcon />
    </Button>
  </Tooltip>

  <Tooltip title="Grid View">
    <Button
      variant="outlined"
      onClick={() => toggleViewMode('grid')}
      sx={{
        marginRight: '5px',
        backgroundColor: viewMode === 'grid' ? '#1a73e8' : 'white',
        color: viewMode === 'grid' ? 'white' : '#1a73e8',
        borderColor: '#1a73e8',
        '&:hover': {
          backgroundColor: viewMode === 'grid' ? '#1669c1' : '#f0f0f0',
        },
        '&:active': {
          backgroundColor: viewMode === 'grid' ? '#0f5bb5' : '#e0e0e0',
        },
      }}
    >
      <GridViewIcon />
    </Button>
  </Tooltip>
</Box>


    <TextField
      label="Find your products"
      variant="outlined"
      size="small"
      value={searchQuery}
      onChange={handleSearchChange}
      sx={{ minWidth: 300 }}
    />
    <Tooltip title="Clear All">
    <Button onClick={handleClearSearch}>
      <IconButton aria-label="refresh" >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.37-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      </IconButton>
    </Button>
    </Tooltip>
    <Typography variant="body2">Total Products: {products.length}</Typography>
  </Box>
</Box>

<Paper sx={{ width: '100%', overflow: 'hidden' }}>
  {viewMode === 'list' ? (
    <TableContainer sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ textAlign: 'center', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}>
              Image
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('sku')}
            >
              SKU {getSortSymbol('sku')}
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('name')}
            >
              Title {getSortSymbol('name')}
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('mpn')}
            >
              MPN {getSortSymbol('mpn')}
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('category')}
            >
              Category {getSortSymbol('category')}
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('brand_name')}
            >
              Brand {getSortSymbol('brand_name')}
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', cursor: 'pointer', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'rgb(224 224 224)' }}
              onClick={() => sortProducts('price')}
            >
              Price {getSortSymbol('price')}
            </TableCell>
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
            filteredProducts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product) => (
                <TableRow key={product.id}>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Link to={`/details/${product.id}?page=${page}`} style={{ textDecoration: 'none' }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                        }}
                      />
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'black', minWidth: 120, textDecoration: 'none' }}>
                      {product.sku}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', minWidth: 120, wordBreak: 'break-word' }}>
                    <Link to={`/details/${product.id}?page=${page}`} style={{ color: 'black', textDecoration: 'none' }}>
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center', minWidth: 100 }}>{product.mpn}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{product.category}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{product.brand_name || 'N/A'}</TableCell>
                  <TableCell sx={{ textAlign: 'center', minWidth: 100 }}>${product.price}</TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <Grid container spacing={2} justifyContent="center" sx={{ p: 2 }}>
      {loading ? (
        <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
          <DotLoading />
        </Grid>
      ) : filteredProducts.length === 0 ? (
        <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
          No Data Found
        </Grid>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {filteredProducts
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <Grid item xs={12} sm={12} md={4} sx={{ padding: '30px' }} key={product.id} display="flex" justifyContent="center">
                <Card
                  sx={{
                    marginTop: '10px',
                    width: '300px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '10px',
                    border: '1px solid #ddd',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  <Link
                    to={`/details/${product.id}`}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="130"
                      width="200"
                      image={product.image_url}
                      alt={product.name}
                      sx={{
                        objectFit: 'contain',
                        borderTopLeftRadius: '10px',
                        borderTopRightRadius: '10px',
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'black',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          height: '3rem',
                          overflow: 'hidden',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ height: '2rem', color: 'black', overflow: 'hidden' }}
                      >
                        SKU: {product.sku}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Price: ${product.price}
                      </Typography>
                    </CardContent>
                  </Link>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Grid>
  )}
</Paper>

<Box sx={{paddingRight:'20px'}}>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredProducts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Rows per page:"
            />
            </Box>
  {/* <Button
                variant="contained"
                color="primary"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    fontSize: '24px',
                    zIndex: 9999
                }}
                onClick={() => setShowPopup(true)}
            >
                ❓
            </Button> */}

            {/* Filter Dialog */}
           <Button
                variant="contained"
                color="primary"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '10px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    fontSize: '24px',
                    zIndex: 9999
                }}
                onClick={() => setShowPopup(true)}
            >
                ❓
            </Button>

            {/* <Dialog open={showPopup} onClose={() => setShowPopup(false)} maxWidth="xs" fullWidth> */}



            <Dialog
  open={showPopup}
  onClose={() => setShowPopup(false)}
  maxWidth="xs"
  fullWidth
//   hideBackdrop
  PaperProps={{
    style: {
      position: 'fixed',
      marginTop:'30px',
      bottom: '80px', // adjust to appear above the ❓ button
      right: '20px',
      height:'700px',
      margin: 0,
      borderRadius: '12px',
      zIndex: 1300
    }
  }}
>
                <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', color: '#7B61FF' }}>
                    Product Finder
                    <Button
                        onClick={() => setShowPopup(false)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            minWidth: 'unset'
                        }}
                    >
                        <CloseIcon />
                    </Button>
                </DialogTitle>
                <DialogContent dividers>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
        value={selectedCategoryId}
        label="Category"
        onChange={handleCategoryChange}
    >
        {categoryOptions.map((category) => (
            <MenuItem key={category.id} value={category.id}>
                {category.name}
            </MenuItem>
        ))}
    </Select>
                    </FormControl>

                    {categoryFilters.map((filter, index) => (
                        <Accordion key={index}  >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#cfd3df' }}>
                                <Typography variant="subtitle1">{filter.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {filter.options.map((option, optionIndex) => (
                                    <FormControlLabel
                                        key={optionIndex}
                                        control={
                                            <Checkbox
                                                checked={selectedFilters[filter.name]?.includes(option.label) || false}
                                                onChange={() => handleFilterChange(filter.name, option.label)}
                                            />
                                        }
                                        label={option.label}
                                    />
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}

                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                        <Button
                            variant="text"
                            color="error"
                            onClick={handleClearFilters}
                            style={{ fontWeight: 'bold' }}
                        >
                            ❌ Reset All
                        </Button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPopup(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar
  open={openSnackbar}
  autoHideDuration={3000}
  onClose={() => setOpenSnackbar(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
     cleared successfully!
  </Alert>
</Snackbar>

        </Container>
    );
};

export default ProductList;
