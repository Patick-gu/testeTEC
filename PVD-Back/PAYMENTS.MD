# Módulo de Múltiplos Pagamentos (Pagamento Misto)

Este documento define a estrutura para processamento de pagamentos complexos em uma única venda, desmembrando o pagamento do Cabeçalho da Venda.

## O Problema que Resolve
No varejo físico, é extremamente comum o cliente desejar dividir o valor da compra. Exemplo: A compra deu R$ 150,00 e o cliente quer pagar R$ 50,00 no Dinheiro, R$ 50,00 no PIX e R$ 50,00 no Cartão de Crédito. Se o método de pagamento for apenas uma coluna na tabela `vendas`, o sistema falhará na contabilidade, gerando um "furo" no cálculo do Fechamento de Caixa. Com esta melhoria, a contabilidade bate na casa dos centavos.

## Regras de Negócio e Operações
- **Associação Múltipla** : Uma Venda pode ter 1 ou N (muitos) registros de pagamento atrelados a ela.
- **Validação de Finalização** : O Backend só permite que uma venda tenha o status `completed` se a SOMA matemática de todos os pagamentos atrelados a ela for MAIOR OU IGUAL ao `total_amount` da Venda.
- **Auditoria de Caixa** : No fechamento de caixa, o sistema somará especificamente os pagamentos feitos em 'money' (dinheiro físico) para exigir que o operador tenha aquele exato valor na gaveta.
- **Update e Delete (BLOQUEADO)** : Tal qual a venda, o pagamento inserido não pode ser apagado nem alterado.

---

# Banco de Dados (Modelagem)

Com essa alteração, removemos a coluna `payment_method` da tabela `vendas` e criamos uma tabela filha exclusiva.

### Tabela: `pagamentos_venda` (sale_payments)
- id : UUID, PK
- sale_id : UUID, FK (Aponta para a venda específica)
- payment_method : ENUM ('money', 'pix', 'credit_card', 'debit_card'), NOT NULL
- amount : DECIMAL(10,2), NOT NULL (Valor pago nesta modalidade específica)
- created_at : TIMESTAMP (Exatamente quando a transação ocorreu)
- updated_at : TIMESTAMP
