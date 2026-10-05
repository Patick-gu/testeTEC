const fs = require('fs');
const path = 'src/pages/Terminal/service.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Add selectedIndex state
code = code.replace(
  /const \[isLoadingProducts, setIsLoadingProducts\] = useState\(false\);/,
  `const [isLoadingProducts, setIsLoadingProducts] = useState(false);\n  const [selectedIndex, setSelectedIndex] = useState(0);`
);

// 2. Reset selectedIndex when filteredProducts changes
code = code.replace(
  /const filteredProducts = useMemo\(\(\) => \{/,
  `useEffect(() => { setSelectedIndex(0); }, [barcodeInput]);\n\n  const filteredProducts = useMemo(() => {`
);

// 3. Add handleKeyDown
code = code.replace(
  /const selectProduct = \(product: Product\) => \{/,
  `const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedProduct = filteredProducts[selectedIndex];
      if (selectedProduct) {
        selectProduct(selectedProduct);
      }
    }
  };

  const selectProduct = (product: Product) => {`
);

// 4. Export the new fields
code = code.replace(
  /isDropdownOpen,\n\s*setIsDropdownOpen,\n\s*isLoadingProducts,/,
  `isDropdownOpen,
    setIsDropdownOpen,
    isLoadingProducts,
    selectedIndex,
    setSelectedIndex,
    handleSearchKeyDown,`
);

fs.writeFileSync(path, code);
