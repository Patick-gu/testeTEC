import { useState, useMemo, useRef, useEffect } from 'react';
import { usePdv } from '../../context/PdvContext';
import _INITIAL_PRODUCTS from '../../JSON/Mock/products.json';
import { ProductCategory, Product } from '../../types/pdv';

const INITIAL_PRODUCTS = _INITIAL_PRODUCTS as Product[];

export const useCatalogService = () => {
  const {
    addProductToCart,
    cart,
    total,
    setActiveTab,
    setWeighingProduct,
    setShowScaleModal,
    scaleWeight,
    openPaymentModal
  } = usePdv();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto focus input on entry
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Category filters
  const categories: { id: ProductCategory; label: string; shortcut: string; icon: string }[] = [
    { id: 'all', label: 'TODOS OS PRODUTOS', shortcut: 'ALT+0', icon: 'apps' },
    { id: 'bebidas', label: 'BEBIDAS', shortcut: 'ALT+1', icon: 'local_cafe' },
    { id: 'padaria', label: 'PADARIA & CONFEITARIA', shortcut: 'ALT+2', icon: 'bakery_dining' },
    { id: 'mercearia', label: 'MERCEARIA', shortcut: 'ALT+3', icon: 'shopping_basket' },
    { id: 'hortifruti', label: 'HORTIFRUTI (PESO)', shortcut: 'ALT+4', icon: 'nutrition' },
    { id: 'conveniencia', label: 'CONVENIÊNCIA', shortcut: 'ALT+5', icon: 'storefront' }
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return INITIAL_PRODUCTS.filter((prod) => {
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      const matchesQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.code.toLowerCase().includes(q) ||
        prod.brand.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const criticalStockCount = useMemo(() => {
    return INITIAL_PRODUCTS.filter((p) => p.lowStock || p.stock < 15).length;
  }, []);

  const handleCardClick = (product: Product) => {
    if (product.isWeighable) {
      setWeighingProduct(product);
      setShowScaleModal(true);
    } else {
      addProductToCart(product, 1);
    }
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length > 0) {
        handleCardClick(filteredProducts[0]);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setActiveTab('terminal');
    }
  };

  return {
    cart,
    total,
    scaleWeight,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    searchInputRef,
    categories,
    filteredProducts,
    criticalStockCount,
    handleCardClick,
    handleKeyDown,
    openPaymentModal,
    setActiveTab,
    setShowScaleModal
  };
};
