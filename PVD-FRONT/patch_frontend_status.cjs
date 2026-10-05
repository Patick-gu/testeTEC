const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /fetch\(\`\$\{API_URL\}\/caixa\/movimentacoes\`, \{[\s\S]*?\.catch\(err => console\.error\("Erro ao buscar movimentações", err\)\);/;

const newFetch = `
    // Fetch movements
    fetch(\`\${API_URL}/caixa/movimentacoes\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    })
    .then(res => res.json())
    .then((data: any[]) => {
      if (Array.isArray(data)) {
        const mappedMovements = data.map(item => {
          const isSangria = item.type === 'sangria';
          const time = item.created_at ? new Date(item.created_at).toLocaleTimeString('pt-BR', { hour12: false }) : '';
          return {
            id: item.id,
            time: time,
            type: item.type as 'sangria' | 'suprimento',
            title: isSangria ? 'Sangria de Caixa' : 'Suprimento',
            documentRef: \`Recibo \${isSangria ? 'SG' : 'SP'}-\${item.id.substring(0,4)}\`,
            reason: item.descricao,
            operator: user?.name || 'Operador',
            authorizer: 'Supervisão',
            amount: Number(item.valor)
          };
        });
        setCashDrawer(prev => ({ ...prev, movements: mappedMovements }));
      }
    })
    .catch(err => console.error("Erro ao buscar movimentações", err));

    // Fetch status
    fetch(\`\${API_URL}/caixa/status\`, {
      headers: { 'Authorization': \`Bearer \${token}\` }
    })
    .then(res => res.json())
    .then((data: any) => {
      if (data && typeof data.totalSales !== 'undefined') {
        setCashDrawer(prev => ({
          ...prev,
          openingFund: data.openingFund,
          totalSales: data.totalSales,
          salesCount: data.salesCount,
          cashInDrawer: data.cashInDrawer,
          pixTotal: data.pixTotal,
          cardDebit: data.cardDebit,
          cardCredit: data.cardCredit
        }));
      }
    })
    .catch(err => console.error("Erro ao buscar status do caixa", err));`;

code = code.replace(regex, newFetch.trim());
fs.writeFileSync(path, code);
