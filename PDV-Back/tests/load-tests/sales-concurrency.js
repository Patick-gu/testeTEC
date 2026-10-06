import http from 'k6/http';
import { check, sleep } from 'k6';

// Configurações de carga
export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Acelera para 50 usuários simultâneos
        { duration: '4m', target: 50 },   // Mantém 50 usuários por 4 minutos
        { duration: '30s', target: 0 },   // Desacelera para 0 (Total 5 minutos)
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% das requisições abaixo de 2s
    },
};

const BASE_URL = 'http://localhost:8001/api';

export function setup() {
    console.log("Iniciando Setup do Teste...");

    // 1. Faz login como Operador (usando as credenciais padrão do UserSeeder)
    const loginPayload = JSON.stringify({
        email: 'operador1@pdv.com',
        password: '123456',
    });

    const loginRes = http.post(`${BASE_URL}/login`, loginPayload, { 
        headers: { 'Content-Type': 'application/json' } 
    });
    
    if (loginRes.status !== 200) {
        console.error("Falha ao logar. Você rodou php artisan migrate:fresh --seed ?");
        return null;
    }
    
    const token = loginRes.json('acess_Token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Garante que o Turno do Caixa está aberto
    http.post(`${BASE_URL}/caixa/abrir`, JSON.stringify({
        valor_abertura: 100.00
    }), { headers });

    // 3. Busca a lista de Produtos cadastrados no banco para sortear na venda
    const productsRes = http.get(`${BASE_URL}/produtos`, { headers });
    let produtos = [];
    if (productsRes.status === 200) {
        produtos = productsRes.json();
        // Filtra apenas produtos com estoque > 0 para tentar vender
        produtos = produtos.filter(p => p.stock_quantity > 0);
    }

    if (produtos.length === 0) {
        console.error("Nenhum produto com estoque encontrado no banco!");
    } else {
        console.log(`Carregados ${produtos.length} produtos para o teste.`);
    }

    return { token: token, produtos: produtos };
}

export default function (data) {
    if (!data || !data.token || data.produtos.length === 0) {
        sleep(1);
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
    };

    // --- Montando a Venda Aleatória ---
    
    // Escolhe forma de pagamento aleatória
    const methods = ['cash', 'credit_card', 'debit_card', 'pix'];
    const payment_method = methods[Math.floor(Math.random() * methods.length)];
    
    // Escolhe de 1 a 4 itens para o carrinho
    const numItems = Math.floor(Math.random() * 4) + 1;
    let items = [];
    let totalVenda = 0;

    for (let i = 0; i < numItems; i++) {
        const prod = data.produtos[Math.floor(Math.random() * data.produtos.length)];
        // Quantidade comprada de 1 a 3
        const qty = Math.floor(Math.random() * 3) + 1;
        
        // Evita duplicar o mesmo produto no array de itens
        if (!items.find(item => item.produto_id === prod.id)) {
            items.push({
                produto_id: prod.id,
                quantity: qty
            });
            totalVenda += (parseFloat(prod.price) * qty);
        }
    }

    // Se for dinheiro, o cliente pode entregar um valor maior para ter troco
    let amount_paid = totalVenda;
    if (payment_method === 'cash') {
        amount_paid += Math.floor(Math.random() * 50); // Dá até R$ 50 a mais de troco
    }

    const payload = JSON.stringify({
        payment_method: payment_method,
        amount_paid: amount_paid,
        items: items
    });

    // Dispara a Venda
    const res = http.post(`${BASE_URL}/sales`, payload, { headers });

    // Verifica o sucesso ou se o bloqueio de estoque (Race Condition) barrou corretamente
    check(res, {
        '✅ Venda processada com sucesso (200)': (r) => r.status === 200,
        '⚠️ Rejeitada por falta de estoque (400)': (r) => r.status === 400 && String(r.body).includes("Estoque"),
    });

    // Pequena pausa para simular um fluxo real
    sleep(Math.random() * 1);
}
