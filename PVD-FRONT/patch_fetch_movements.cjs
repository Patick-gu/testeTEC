const fs = require('fs');
const path = 'src/context/PdvContext.tsx';
let code = fs.readFileSync(path, 'utf8');

const useEffectRegex = /export const PdvProvider: React\.FC<\{ children: React\.ReactNode \}> = \(\{ children \}\) => \{[\s\S]*?const \{ token \} = useAuth\(\);/;

const hookReplacement = `export const PdvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  
  useEffect(() => {
    if (!token) return;
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
        
        setCashDrawer(prev => {
          // Here we are only updating the historical movements, not retroactively altering cashInDrawer
          // since the cashInDrawer might come from a "Caixa" session endpoint in a full real app.
          return { ...prev, movements: mappedMovements };
        });
      }
    })
    .catch(err => console.error("Erro ao buscar movimentações", err));
  }, [token]);`;

code = code.replace(useEffectRegex, hookReplacement);

fs.writeFileSync(path, code);
