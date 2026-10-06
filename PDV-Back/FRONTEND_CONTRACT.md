# Contrato de Integração Frontend <-> Backend (PDV)

Este documento foi criado para guiar o agente ou desenvolvedor Frontend na integração com as APIs do Backend (Laravel 11).

## 1. Autenticação (JWT)
Todas as rotas do sistema são protegidas. O Frontend deve primeiro fazer login para obter o Token JWT e enviá-lo nos Cabeçalhos (Headers) de todas as requisições subsequentes.
- **Rota:** `POST /api/login`
- **Header Necessário nas próximas requisições:** `Authorization: Bearer {token}`

---

## 2. Consulta de Produtos (O "Bip" do Caixa)
Quando o operador bipar um código de barras ou pesquisar por nome, o Front não precisa baixar todo o estoque. Use os **Query Parameters**.

- **Rota:** `GET /api/produtos`
- **Filtros Opcionais:** 
  - `?code=789123456` (Busca exata pelo código de barras)
  - `?name=Coca` (Busca parcial pelo nome)

**Exemplo de Resposta (JSON):**
```json
[
  {
    "id": "uuid-do-produto",
    "code": "789123456",
    "name": "Coca-Cola 2L",
    "price": "10.00",
    "stock_quantity": 50,
    "active": true,
    "wholesale_price": "8.00",
    "wholesale_min_quantity": 6,
    "categoria": {
      "id": "uuid-da-categoria",
      "name": "Bebidas"
    }
  }
]
```

### ⚠️ Regra de Negócio (Front-end): Desconto de Atacado
O Frontend é responsável por **exibir visualmente** o desconto para o cliente na tela do caixa. 
Toda vez que a quantidade de um item no carrinho for alterada, o Front deve verificar:
```javascript
let precoExibicao = produto.price;

if (produto.wholesale_min_quantity !== null && quantidadeComprada >= produto.wholesale_min_quantity) {
    precoExibicao = produto.wholesale_price; // Aplica o preço de atacado na tela
}
```
*(Nota: O Backend faz essa mesma checagem de forma segura ao finalizar a venda, mas o Front precisa fazer para mostrar o subtotal correto ao vivo na tela).*

---

## 3. Finalizar Venda (Carrinho de Compras)
A adição e remoção de itens do carrinho ocorre 100% na memória do Frontend. O Backend só é acionado quando a venda é concluída e o cliente escolhe a forma de pagamento.

- **Rota:** `POST /api/sales`
- **Payload Esperado:**
```json
{
  "payment_method": "cash",
  "amount_paid": 100.00,
  "items": [
     {
       "produto_id": "uuid-do-produto-1",
       "quantity": 2
     },
     {
       "produto_id": "uuid-do-produto-2",
       "quantity": 6
     }
  ]
}
```
*(Valores aceitos para payment_method: `credit_card`, `debit_card`, `pix`, `cash`)*
*(O campo `amount_paid` só é obrigatório/usado se o pagamento for em dinheiro. O Backend calculará e salvará o troco automaticamente).*

### ⚠️ Tratamento de Erros no Frontend (Importante!)
O Backend é blindado. Se houver falha de validação ou falta de estoque, ele barrará a venda inteira e devolverá um erro. O Frontend deve estar preparado para capturar e exibir um pop-up/alerta para o operador:

1. **Dinheiro Insuficiente (HTTP 400 Bad Request):**
   - Se a venda for em dinheiro (`cash`) e o `amount_paid` for menor que o total, o Backend retorna:
   `{"erro": "O valor pago em dinheiro não pode ser menor que o total da venda."}`.

2. **Estoque Insuficiente (HTTP 400 Bad Request):**
   - Se o operador tentar vender 5 unidades, mas só tiver 2 no banco, o Backend aborta a transação e retorna:
   `{"erro": "Estoque insuficiente"}`.
   - O Front deve mostrar: *"Atenção: A quantidade solicitada é maior que o estoque atual."* e impedir o fechamento até o operador reduzir a quantidade.

2. **Produto Desativado/Excluído (HTTP 400 Bad Request):**
   - Retorno: `{"erro": "O produto X está inativo e não pode ser vendido."}`.

3. **Sucesso (HTTP 200 OK):**
   - Retorno: `{"status": "sucesso"}`
   - O Front deve **limpar o carrinho da memória** e preparar a tela para o próximo cliente.

---

## 4. Fluxo de Caixa (Sangria e Suprimento)
Operações para inserir ou retirar dinheiro da gaveta do caixa durante o turno.

- **Rota:** `POST /api/caixa/movimentacoes`
- **Payload Esperado:**
```json
{
  "type": "sangria", 
  "valor": 150.00,
  "descricao": "Retirada para o cofre de segurança"
}
```
*(Tipos permitidos: `"sangria"` ou `"suprimento"`).*

- **Ver histórico de hoje do caixa logado:** `GET /api/caixa/movimentacoes`
