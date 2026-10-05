const fs = require('fs');
const path = 'src/pages/CashMovement/service.ts';
let code = fs.readFileSync(path, 'utf8');

// Add showToast to usePdv destructuring
code = code.replace(
  /const \{ cashDrawer, addCashMovement, closeTurno \} = usePdv\(\);/,
  `const { cashDrawer, addCashMovement, closeTurno, showToast } = usePdv();`
);

// Replace all alerts with showToast
code = code.replace(
  /alert\('Ação permitida apenas no seu próprio caixa \(local\)\.'\);/g,
  `showToast('Ação permitida apenas no seu próprio caixa (local).');`
);

code = code.replace(
  /alert\('Imprimindo relatório de conferência física na impressora térmica \(EPSON TM-T20\)\.'\);/,
  `showToast('Imprimindo relatório de conferência física...');`
);

fs.writeFileSync(path, code);
