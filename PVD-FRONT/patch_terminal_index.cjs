const fs = require('fs');
const path = 'src/pages/Terminal/index.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Destructure
code = code.replace(
  /isLoadingProducts,\n\s*selectProduct,/,
  `isLoadingProducts,
    selectedIndex,
    setSelectedIndex,
    handleSearchKeyDown,
    selectProduct,`
);

// 2. Add onKeyDown to input
code = code.replace(
  /onBlur=\{\(\) => setTimeout\(\(\) => setIsDropdownOpen\(false\), 200\)\}/,
  `onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  onKeyDown={handleSearchKeyDown}`
);

// 3. Highlight selectedIndex
code = code.replace(
  /filteredProducts\.map\(product => \(/,
  `filteredProducts.map((product, index) => (`
);
code = code.replace(
  /className="flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"/,
  `className={\`flex items-center justify-between p-4 border-b border-slate-100 cursor-pointer transition-colors \${index === selectedIndex ? 'bg-blue-50 border-blue-100' : 'hover:bg-slate-50'}\`}
                          onMouseEnter={() => setSelectedIndex(index)}`
);

fs.writeFileSync(path, code);
