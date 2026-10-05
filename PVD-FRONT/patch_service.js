const fs = require('fs');

const path = 'src/pages/Terminal/service.ts';
let code = fs.readFileSync(path, 'utf8');

// We will add state for products, dropdown, loading, and fetching
const imports = "import { useState, useRef, useEffect, useMemo } from 'react';\nimport { usePdv } from '../../context/PdvContext';\nimport { Product } from '../../types/pdv';";
code = code.replace(/import {.*?} from 'react';\nimport {.*?} from '\.\.\/\.\.\/context\/PdvContext';/, imports);

const hookStartRegex = /export const useTerminalService = \(\) => {/;
const newStates = `
  const [products, setProducts] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(\`\${API_URL}/produtos\`);
      const data = await response.json();
      
      const mappedData: Product[] = data.map((p: any) => ({
        id: p.id.toString(),
        code: p.barcode || p.code || '',
        name: p.name,
        brand: p.brand || '',
        category: p.category_id ? 'mercearia' : 'all',
        categoryLabel: p.category_id ? 'Mercearia' : 'Todas',
        price: Number(p.price) || 0,
        unit: p.unit || 'UN',
        stock: Number(p.stock) || 0,
        isWeighable: Boolean(p.is_weighable)
      }));
      setProducts(mappedData);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!barcodeInput.trim()) return products;
    const clean = barcodeInput.toLowerCase().trim();
    return products.filter(p => 
      p.name.toLowerCase().includes(clean) || 
      p.code.toLowerCase().includes(clean)
    );
  }, [products, barcodeInput]);

  const selectProduct = (product: Product) => {
    // Add product to cart directly (using PdvContext function)
    pdv.addProductToCart(product, 1);
    setBarcodeInput('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };
`;

code = code.replace(hookStartRegex, `export const useTerminalService = () => {${newStates}`);

// replace handleBarcodeSubmit
const submitRegex = /const handleBarcodeSubmit = \(e: React.FormEvent\) => {[\s\S]*?};/;
const newSubmit = `const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Se o usuário apertou Enter com a lista aberta, pegar o primeiro item
    if (filteredProducts.length > 0) {
      selectProduct(filteredProducts[0]);
    } else {
      showToast('Produto não encontrado');
    }
  };`;

code = code.replace(submitRegex, newSubmit);

// Add to return
code = code.replace(/return {/, `return {
    products,
    filteredProducts,
    isDropdownOpen,
    setIsDropdownOpen,
    isLoadingProducts,
    selectProduct,`);

fs.writeFileSync(path, code);
