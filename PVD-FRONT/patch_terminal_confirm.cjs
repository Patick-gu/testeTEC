const fs = require('fs');
const pathService = 'src/pages/Terminal/service.ts';
let serviceCode = fs.readFileSync(pathService, 'utf8');

serviceCode = serviceCode.replace(
  /const \[selectedIndex, setSelectedIndex\] = useState\(0\);/,
  `const [selectedIndex, setSelectedIndex] = useState(0);\n  const [showCancelConfirm, setShowCancelConfirm] = useState(false);`
);

serviceCode = serviceCode.replace(
  /selectedIndex,\n\s*setSelectedIndex,/,
  `selectedIndex,
    setSelectedIndex,
    showCancelConfirm,
    setShowCancelConfirm,`
);

// We should also intercept clearCart inside Terminal to open the modal instead
serviceCode = serviceCode.replace(
  /const selectProduct = \(product: Product\) => \{/,
  `const requestClearCart = () => {
    if (cart.length > 0) setShowCancelConfirm(true);
  };
  
  const confirmClearCart = () => {
    clearCart();
    setShowCancelConfirm(false);
  };

  const selectProduct = (product: Product) => {`
);

serviceCode = serviceCode.replace(
  /setAuthInput,\n\s*confirmRemoveItem,\n\s*cancelRemoveItem/,
  `setAuthInput,
    confirmRemoveItem,
    cancelRemoveItem,
    requestClearCart,
    confirmClearCart`
);

fs.writeFileSync(pathService, serviceCode);
