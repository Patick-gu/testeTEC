# Módulo de Vendas (PDV)

Este documento define as regras de negócio de como uma venda deve ser processada, calculada e armazenada. A venda é a entidade mais sensível do sistema, portanto as regras de segurança e imutabilidade são extremamente rígidas.

## Regras de Negócio e Operações
- **Create (Finalizar)** : Criar venda num fluxo único (Database Transaction). O Frontend deve enviar apenas os produtos, as quantidades e o valor pago.
- **Read (Consulta)** : Consultar vendas finalizadas (Cabeçalho + Itens). Usuário normal vê apenas as próprias vendas do turno, Admin vê todas.
- **Update (BLOQUEADO)** : É estritamente proibido alterar produtos, totais ou preços de uma venda após a finalização.
- **Delete (BLOQUEADO)** : Proibido excluir registros de vendas do banco para manter a auditoria. Se ocorreu um erro no caixa, o gerente (Admin) deve ter o poder de "Cancelar" a venda alterando o status, mas a trilha fica no banco.
- **Cálculo de Preço (Backend-Driven)** : O Frontend **não** envia o preço da mercadoria nem o valor total da venda no JSON. O Backend recebe apenas `product_id` e `quantity`, busca o valor real do produto no banco de dados e calcula o total. Isso previne manipulação de valores no frontend.
- **Pagamento e Troco** : Forma de pagamento (Dinheiro, PIX, Cartão). Se for dinheiro, o Backend calcula `troco = valor_pago - total_venda`.
- **Rastreio de Operador** : O ID de quem realizou a venda não vem no JSON. O Backend extrai essa informação direto do Token JWT logado, prevenindo falsidade ideológica no caixa.
- **Baixa de Estoque** : Durante o momento em que a venda for salva com sucesso, o estoque de cada produto vendido deve ser decrementado automaticamente.

---

# Banco de Dados (Modelagem)

Para garantir a normalização, uma venda será dividida em um "Cabeçalho" (a nota fiscal em si) e as "Linhas" (os produtos que estão nela).

### Tabela 1: `vendas` (sales)
Guarda os dados gerais, totalizadores e o método de pagamento.
- id : UUID, PK
- user_id : UUID, FK (Aponta para o Operador/Caixa)
- total_amount : DECIMAL(10,2), NOT NULL (Calculado e preenchido pelo Backend)
- payment_method : ENUM ('money', 'pix', 'credit_card', 'debit_card'), NOT NULL
- amount_paid : DECIMAL(10,2), DEFAULT 0 (Valor entregue pelo cliente)
- change_returned : DECIMAL(10,2), DEFAULT 0 (Troco devolvido)
- status : ENUM ('completed', 'cancelled'), DEFAULT 'completed' (Substitui o Delete físico)
- created_at : TIMESTAMP (Data e hora exata em que o caixa finalizou)
- updated_at : TIMESTAMP

### Tabela 2: `itens_venda` (sale_items)
Guarda "o quê" e "quanto" foi vendido. Uma venda pode ter várias linhas nesta tabela.
- id : UUID, PK
- sale_id : UUID, FK (Aponta para a tabela `vendas`)
- product_id : UUID, FK (Aponta para a tabela `produtos`)
- quantity : INT, NOT NULL
- unit_price : DECIMAL(10,2), NOT NULL (Preço "fotografado" no momento da venda, garante que o histórico não mude se o produto encarecer amanhã)
- subtotal : DECIMAL(10,2), NOT NULL (Calculado pelo backend: `quantity * unit_price`)
- created_at : TIMESTAMP
- updated_at : TIMESTAMP


---

# Lógica de Negócio (Implementação Manual no `SaleController@store`)

A estrutura base (Migrations, Models, Request e rotas da API) já foi gerada no sistema. Agora você deve implementar a lógica de processamento dentro do método `store` em `App\Http\Controllers\Sales\SaleController`.

Aqui está um guia passo a passo do que você deve codificar lá dentro:

### 1. Iniciar o Database Transaction
Sempre envolva a criação da venda e o desconto do estoque com `DB::beginTransaction()`. Isso garante que se um erro ocorrer na linha 5 da venda, toda a operação sofre `rollBack()` e o estoque não sofre inconsistência.

### 2. Cabeçalho da Venda (`Sale`)
Crie o registro inicial da Venda:
*   Extraia o `user_id` usando `auth()->id()`. Não confie em `user_id` vindo do request.
*   Crie com `total_amount = 0` (você vai calcular isso no loop abaixo).
*   Salve o `payment_method` e `amount_paid`.
*   Calcule o troco (`change_returned`) se for dinheiro.

### 3. Iterar sobre os Itens e Validar Estoque
Para cada item recebido (`$request->validated('items')`):
*   Busque o produto no banco.
*   **Regra de Estoque:** Verifique se `$produto->stock_quantity >= $quantidade_vendida`. Se não for, lance uma exceção e cancele tudo.

### 4. Regra de Preço e Atacado
*   O valor de venda padrão é `$produto->price`.
*   **Regra de Atacado:** Verifique se `$quantidade_vendida >= $produto->wholesale_min_quantity`. Se for verdadeiro, mude o valor de venda para `$produto->wholesale_price`.

### 5. Salvar Item e Atualizar Total
*   Calcule o `$subtotal = $quantidade_vendida * $valor_final`.
*   Crie o `SaleItem` salvando a foto do preço (`unit_price`) e `subtotal`.
*   Vá somando o subtotal no valor total da venda (`$totalAmount += $subtotal`).

### 6. Descontar o Estoque
*   Faça `$produto->decrement('stock_quantity', $quantidade_vendida)`.

### 7. Finalizar (Commit)
*   Atualize o `total_amount` final na tabela `Sale`.
*   Execute `DB::commit()`.
*   Retorne a venda formatada via JSON (`$sale->load(['items.produto', 'user'])`).

Se ocorrer qualquer erro no try/catch, faça `DB::rollBack()` e retorne erro 400.
