const fs = require('fs');
const path = 'src/components/modals/ThermalReceiptModal.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const \{ recentReceipt, showReceiptModal, setShowReceiptModal \} = usePdv\(\);/,
  `const { recentReceipt, showReceiptModal, setShowReceiptModal, showToast } = usePdv();`
);

code = code.replace(
  /alert\('Comprovante enviado com sucesso para o WhatsApp informado\.'\);/,
  `showToast('Comprovante enviado com sucesso para o WhatsApp informado.');`
);

fs.writeFileSync(path, code);
