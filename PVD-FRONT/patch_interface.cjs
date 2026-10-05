const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /addCashMovement: \(type: 'sangria' \| 'suprimento', amount: number, reason: string, auth: string\) => void;/,
  "addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string, auth: string) => Promise<boolean>;"
);

// We should also replace the completeSale interface to Promise<void> just in case
code = code.replace(
  /completeSale: \(payments: AppliedPayment\[\], troco: number\) => void;/,
  "completeSale: (payments: AppliedPayment[], troco: number) => Promise<void>;"
);

fs.writeFileSync(path, code);
