# Módulo de Movimentações de Caixa (Sangria e Suprimento)

No contexto de um PDV, além da abertura, fechamento e vendas, o caixa sofre entradas e saídas de dinheiro excepcionais. Essas movimentações afetam diretamente o saldo final da gaveta e precisam ser auditadas.

## Conceitos
- **Suprimento (Entrada / Reforço)**: Colocar mais dinheiro na gaveta durante o turno (ex: gerente trouxe R$ 50,00 em moedas para troco).
- **Sangria (Saída / Retirada)**: Retirar dinheiro da gaveta por segurança quando ela está muito cheia (ex: enviar R$ 500,00 para o cofre) ou para pagar uma despesa rápida (ex: R$ 20,00 para comprar um galão de água).

## Regras de Negócio e Operações
- **Create (Registrar Movimentação)** : O operador (ou gerente) informa se o dinheiro está "entrando" (suprimento) ou "saindo" (sangria), o valor e a justificativa. O caixa DEVE estar com status `open`.
- **Read (Consultar)** : Ver o histórico de retiradas e suprimentos do turno atual.
- **Update (BLOQUEADO)** : É estritamente proibido alterar uma sangria ou suprimento depois de gravada, para evitar fraudes na tesouraria.
- **Delete (BLOQUEADO)** : Proibido excluir. Se houve erro de digitação, deve-se lançar uma movimentação inversa para compensar (ex: Fez uma sangria errada? Lance um suprimento de correção justificando o erro).
- **Impacto no Fechamento** : Na hora de fechar o caixa (módulo Cash Register), a fórmula do Back-end muda para:
  `Saldo Esperado = Fundo Inicial + Vendas em Dinheiro + Suprimentos - Sangrias`.

---

# Banco de Dados (Modelagem)

Como o arquivo anterior possuía texto e campos copiados acidentalmente da tabela de Vendas, abaixo apresentamos a arquitetura física correta e exclusiva para a auditoria do dinheiro da gaveta:

### Tabela: `movimentacoes_caixa` (cash_movements)
- id : UUID, PK
- cash_register_id : UUID, FK (Aponta para o turno/caixa que estava aberto no momento)
- user_id : UUID, FK (Aponta para quem registrou a movimentação, geralmente lido via Token JWT)
- type : ENUM ('suprimento', 'sangria') -> Define se o valor soma ou subtrai na gaveta.
- amount : DECIMAL(10,2), NOT NULL (Valor movimentado)
- reason : VARCHAR(255), NOT NULL (Justificativa obrigatória. Ex: "Pagamento do fornecedor de gelo", "Retirada para cofre")
- created_at : TIMESTAMP (Momento exato da movimentação)
- updated_at : TIMESTAMP
