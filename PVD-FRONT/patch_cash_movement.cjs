const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldAddCashMovementRegex = /const addCashMovement = \(type: 'sangria' \| 'suprimento', amount: number, reason: string, auth: string\) => \{[\s\S]*?showToast\(\`\$\{isSangria \? 'Sangria' : 'Suprimento'\} de R\$ \$\{amount\.toFixed\(2\)\.replace\('\.', ','\)\} registrada!\`\);\n  \};/;

const newAddCashMovement = `const addCashMovement = async (type: 'sangria' | 'suprimento', amount: number, reason: string, auth: string) => {
    try {
      const payload = {
        type,
        valor: amount,
        descricao: reason || (type === 'sangria' ? 'Transferência de segurança para Cofre' : 'Reforço de Troco Miúdo')
      };

      const res = await fetch(\`\${API_URL}/caixa/movimentacoes\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(\`Erro: \${data.erro || 'Falha ao registrar movimentação'}\`);
        return false; // Indicating failure
      }

      // Update local state if API succeeded
      const nowStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const isSangria = type === 'sangria';
      
      const newMovement: CashMovementRecord = {
        id: \`mov-\${Date.now()}\`,
        time: nowStr,
        type,
        title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
        documentRef: \`Recibo manual #\${isSangria ? 'SG' : 'SP'}-\${Math.floor(1000 + Math.random() * 9000)}\`,
        reason: payload.descricao,
        operator: 'Juliana Costa',
        authorizer: auth || 'Supervisor Autorizado',
        amount
      };

      setCashDrawer((prev) => {
        const newCash = isSangria ? prev.cashInDrawer - amount : prev.cashInDrawer + amount;
        return {
          ...prev,
          cashInDrawer: Number(newCash.toFixed(2)),
          movements: [newMovement, ...prev.movements]
        };
      });

      showToast(\`\${isSangria ? 'Sangria' : 'Suprimento'} de R$ \${amount.toFixed(2).replace('.', ',')} registrada!\`);
      return true;
    } catch (err) {
      showToast('Erro de conexão com o servidor.');
      return false;
    }
  };`;

code = code.replace(oldAddCashMovementRegex, newAddCashMovement);
fs.writeFileSync(path, code);
