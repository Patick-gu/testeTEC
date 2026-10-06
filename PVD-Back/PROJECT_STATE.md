# Estado Atual do Projeto: PDV (Frente de Caixa)

## 📌 O que já foi concluído (Backend Laravel 11)

### 1. Autenticação e Usuários
- Configurado o pacote moderno de JWT (`PHPOpenSourceSaver\JWTAuth`).
- Criação e login de usuários via API.
- Correção do banco SQLite para testes (Enum do status `active`/`off`).

### 2. Produtos e Estoque
- **Tabela e Model:** `produtos` com UUID, categoria, código de barras, preço, quantidade de estoque e flag ativo.
- **Regra de Atacado:** Adicionadas colunas `wholesale_price` e `wholesale_min_quantity`.
- **API (Index):** Endpoint `GET /api/produtos` protegido por Auth, com filtros por `name`, `code` e `categoria_id`.

### 3. Vendas (Sales)
- **Modelagem:** Tabela `sales` (Header) e `sale_items` (Linhas). Relacionamentos com Produtos e Usuários.
- **Transação:** Lógica de Venda totalmente blindada dentro de um `DB::beginTransaction()`.
- **Validações na Venda:**
  - Verifica se produto existe e está ativo (`active = true`).
  - Abate estoque dinamicamente.
  - Bloqueia venda com erro 400 se não houver estoque suficiente.
  - Recalcula e confia apenas no preço que vem do banco (nunca do Front-end).
  - Aplica desconto de atacado dinamicamente caso a quantidade mínima seja atingida.
- **Fechamento Financeiro (Dinheiro):** 
  - Recebe o campo opcional `amount_paid`.
  - Calcula o troco (`change_returned`) automaticamente.
  - Valida e barra a venda se o `amount_paid` for menor que o total e o método de pagamento for `cash`.

### 4. Fluxo de Caixa (Movimentações)
- **Modelagem:** Tabela `fluxo_caixa` para auditar a gaveta do operador.
- **Registro Automático:** Toda venda concluída joga um registro de 'entrada' amarrado ao `user_id`.
- **Sangria e Suprimento:**
  - Endpoint `POST /api/caixa/movimentacoes` criado e validado (`StoreFluxoCaixaRequest`).
  - Endpoint `GET /api/caixa/movimentacoes` para ver o histórico do dia do usuário logado.

### 5. Documentações e Contratos
- `AGENTS.md` atualizado com as pegadinhas e resoluções do projeto (ex: Laravel 11 sem Controller Base).
- `FRONTEND_CONTRACT.md` criado com instruções claras para a equipe de Front-end sobre payloads, rotas, regras de visualização do atacado e tratamento dos códigos de erro HTTP 400.
- Todos os requisitos solicitados no `README.md` original da prova prática foram contemplados com êxito!

---

## 🎯 Próximos Passos (Next Steps)
- Diagnosticar o envio do JSON do Front-end/Postman que está gerando troco 0 (investigar formatação do `amount_paid`).
- Desenvolver os componentes do Front-end (React/Vue) para consumir os endpoints documentados no `FRONTEND_CONTRACT.md`.
