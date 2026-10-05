const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add imports
code = code.replace(
  /import { playBeep } from '..\/utils\/audio';/,
  `import { playBeep } from '../utils/audio';\nimport { useAuth } from './AuthContext';\nconst API_URL = import.meta.env.VITE_API_URL;`
);

// Add token extraction inside PdvProvider
code = code.replace(
  /export const PdvProvider: React.FC<{ children: React.ReactNode }> = \({ children }\) => {/,
  `export const PdvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const { token } = useAuth();`
);

// Replace completeSale
const oldCompleteSaleRegex = /const completeSale = \(payments: AppliedPayment\[\], troco: number\) => \{[\s\S]*?showToast\(\`Venda #\$\{saleNumber\} concluída com sucesso\!\`\);\n  \};/;

const newCompleteSale = `const completeSale = async (payments: AppliedPayment[], troco: number) => {
    try {
      const pMethod = payments[0]?.method;
      const paymentMethodStr = pMethod === 'credit' ? 'credit_card' : pMethod === 'debit' ? 'debit_card' : pMethod || 'cash';
      
      const payload = {
        payment_method: paymentMethodStr,
        items: cart.map(item => ({
          produto_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const res = await fetch(\`\${API_URL}/sales\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(\`Erro na venda: \${data.erro || 'Falha ao processar'}\`);
        return; // Block checkout, don't close modal
      }

      const saleTotal = total;
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const dateStr = new Date().toLocaleDateString('pt-BR');

      // Update cash drawer stats
      setCashDrawer((prev) => {
        let addCash = 0;
        let addPix = 0;
        let addDebit = 0;
        let addCredit = 0;

        payments.forEach((p) => {
          if (p.method === 'cash') {
            addCash += (p.amount - troco);
          } else if (p.method === 'pix') {
            addPix += p.amount;
          } else if (p.method === 'debit') {
            addDebit += p.amount;
          } else if (p.method === 'credit') {
            addCredit += p.amount;
          }
        });

        return {
          ...prev,
          totalSales: Number((prev.totalSales + saleTotal).toFixed(2)),
          salesCount: prev.salesCount + 1,
          cashInDrawer: Number((prev.cashInDrawer + addCash).toFixed(2)),
          pixTotal: Number((prev.pixTotal + addPix).toFixed(2)),
          cardDebit: Number((prev.cardDebit + addDebit).toFixed(2)),
          cardCredit: Number((prev.cardCredit + addCredit).toFixed(2))
        };
      });

      const receipt: CompletedSale = {
        saleNumber: \`#\${saleNumber}\`,
        timestamp: \`\${dateStr} \${nowStr}\`,
        items: [...cart],
        subtotal,
        discount,
        total: saleTotal,
        payments,
        change: troco,
        customerCpf: customer.cpf,
        nfceKey: \`3524 1004 8291 0001 5500 1000 0049 2810 \${Math.floor(10000000 + Math.random() * 90000000)}\`
      };

      setRecentReceipt(receipt);
      setShowPrintPromptModal(true);
      setShowPaymentModal(false);
      playBeep('success');

      // Clear cart and prepare for next customer
      setCart([]);
      setSaleNumber(String(Number(saleNumber) + 1).padStart(5, '0'));
      setCustomer({ cpf: '', name: 'Consumidor Final (CPF não informado)' });
      setActiveTab('terminal');
      showToast(\`Venda #\${saleNumber} concluída com sucesso!\`);
    } catch (err) {
      showToast('Erro de conexão ao finalizar venda.');
    }
  };`;

code = code.replace(oldCompleteSaleRegex, newCompleteSale);

// Wait, the interface definition needs to be updated to allow async?
// Interface: completeSale: (payments: AppliedPayment[], troco: number) => void;
// async function matches this interface since it returns Promise<void> which is compatible with void if not awaited.

fs.writeFileSync(path, code);
