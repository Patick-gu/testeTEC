# Módulo de Itens da Venda (O Carrinho / Validações)

Este documento especifica o comportamento e as regras de validação aplicadas a cada produto individualmente no momento em que a venda está sendo processada. 

## Arquitetura do "Carrinho de Compras"
No contexto de um PDV de varejo rápido (Frente de Caixa), as operações de:
- Adicionar ao carrinho
- Alterar quantidade do item no carrinho
- Remover item do carrinho

Geralmente ocorrem **100% no Frontend (na memória)**. O Backend não precisa de uma rota `POST /cart` para cada "bip" de código de barras. O Frontend agrupa todos os itens e manda de uma única vez no momento da finalização para o Backend (`POST /api/vendas`).
*(Aviso: Se o seu negócio for um restaurante/bar usando "Comandas" abertas que duram horas, essa regra muda, mas para Varejo, o carrinho é local).*

## Regras de Validação do Backend (Por Item)
Ao receber o array de itens do Frontend para finalizar a nota, o Backend deve executar um laço (`foreach`) e garantir rigorosamente as seguintes validações para cada item:

1. **Validar Existência e Atividade**:
   - Verificar se o `product_id` existe no banco.
   - Verificar se a flag `active` do produto é `true` (Produtos desativados não podem ser "bipados" no caixa).

2. **Validar Disponibilidade (Estoque)**:
   - Se a `quantidade` solicitada pelo caixa for MAIOR que o `stock_quantity` atual no banco, o Backend deve bloquear a venda e retornar erro (ex: `HTTP 422 - Estoque insuficiente para o produto X`).

3. **Validação de Quantidade Lógica**:
   - Impedir quantidade `0` ou negativa (um operador malicioso não pode vender "-5" itens para baixar artificialmente o total da compra).

4. **Fotografia do Preço e Subtotal**:
   - O preço unitário do item enviado pelo front **deve ser ignorado**. 
   - O Backend deve buscar `$preco = $produto->price;`.
   - O Backend calcula o subtotal da linha: `$subtotal_linha = $quantidade * $preco`.

## Banco de Dados
A modelagem física (`sale_items`) foi consolidada junto ao arquivo `SALES.MD` por pertencer intimamente à estrutura de Cabeçalho-Linha da transação financeira, gerando as colunas `unit_price`, `quantity`, `subtotal`, atreladas via chaves estrangeiras (`sale_id` e `product_id`).
