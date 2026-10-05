const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add interface
code = code.replace(
  /showReceiptModal: boolean;\n\s*setShowReceiptModal: \(show: boolean\) => void;/,
  `showReceiptModal: boolean;
  setShowReceiptModal: (show: boolean) => void;
  showPrintPromptModal: boolean;
  setShowPrintPromptModal: (show: boolean) => void;`
);

// 2. Add state
code = code.replace(
  /const \[showReceiptModal, setShowReceiptModal\] = useState<boolean>\(false\);/,
  `const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showPrintPromptModal, setShowPrintPromptModal] = useState<boolean>(false);`
);

// 3. Update ESC handler
code = code.replace(
  /else if \(showHelpModal \|\| showCustomerModal \|\| showScaleModal \|\| showReceiptModal\)/,
  `else if (showHelpModal || showCustomerModal || showScaleModal || showReceiptModal || showPrintPromptModal)`
);
code = code.replace(
  /setShowReceiptModal\(false\);/,
  `setShowReceiptModal(false);\n          setShowPrintPromptModal(false);`
);
code = code.replace(
  /showScaleModal, showReceiptModal\]\);/,
  `showScaleModal, showReceiptModal, showPrintPromptModal]);`
);

// 4. Update completeSale
code = code.replace(
  /setRecentReceipt\(receipt\);\n\s*setShowReceiptModal\(true\);\n\s*setShowPaymentModal\(false\);/,
  `setRecentReceipt(receipt);\n    setShowPrintPromptModal(true);\n    setShowPaymentModal(false);`
);

// 5. Provider value
code = code.replace(
  /showReceiptModal,\n\s*setShowReceiptModal,/,
  `showReceiptModal,\n        setShowReceiptModal,\n        showPrintPromptModal,\n        setShowPrintPromptModal,`
);

fs.writeFileSync(path, code);
