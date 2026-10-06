# Módulo de Caixa (Abertura, Turnos e Fechamento)

O Módulo de Caixa (ou Turno) é a entidade responsável por gerenciar a jornada de trabalho do operador, contabilizando o fundo de troco e validando se o dinheiro físico na gaveta corresponde ao volume de vendas registrado no sistema.

## Regras de Negócio e Operações
- **Create (Abrir Caixa)** : O operador inicia seu turno informando o `opening_balance` (Fundo de Troco inicial na gaveta). Nenhum operador pode iniciar uma venda se não tiver um caixa com status `open`.
- **Read (Consultar)** : Consultar detalhes do turno ativo ou turnos passados (Apenas Admin pode ver históricos e auditorias).
- **Update (Fechar Caixa)** : Ação final do turno. O operador conta o dinheiro físico na gaveta e informa o `closing_balance_actual` (Fechamento Cego). O caixa muda o status para `closed`.
- **Delete (BLOQUEADO)** : É terminantemente proibido deletar registros de abertura e fechamento de caixa para fins de auditoria contábil.
- **Calcular Saldo Esperado (Backend)** : O Backend soma dinamicamente: `Fundo de Troco Inicial + (Somatório de todas as Vendas em Dinheiro atreladas a este caixa)`. Esse valor é o `closing_balance_expected`.
- **Calcular Diferença (Quebra de Caixa)** : Durante o fechamento, o Backend calcula: `Dinheiro Informado - Saldo Esperado`. 
  - Se der **0**, o caixa "bateu".
  - Se der **negativo**, houve *Falta/Quebra de Caixa* (operador deu troco a mais ou sumiu dinheiro).
  - Se der **positivo**, houve *Sobra* (operador deu troco a menos).
- **Restrição de Caixa Único** : Um usuário (operador) não pode ter mais de um caixa `open` ao mesmo tempo.

---

# Banco de Dados (Modelagem)

*(Nota: A modelagem anterior do documento pertencia a itens_venda. Abaixo está a modelagem correta para o Módulo de Caixa)*

### Tabela: `caixas` (cash_registers / shifts)
- id : UUID, PK
- user_id : UUID, FK (Aponta para a tabela `users` - Quem é o operador)
- opening_time : TIMESTAMP, NOT NULL (Momento da abertura)
- closing_time : TIMESTAMP, NULLABLE (Preenchido apenas no fechamento)
- opening_balance : DECIMAL(10,2), NOT NULL (Fundo inicial informando ao abrir)
- closing_balance_expected : DECIMAL(10,2), NULLABLE (Calculado pelo backend no fechamento baseado nas vendas)
- closing_balance_actual : DECIMAL(10,2), NULLABLE (Dinheiro real contado e informado pelo operador no fechamento)
- discrepancy : DECIMAL(10,2), NULLABLE (A diferença: `actual - expected`. 0 = Bateu, Negativo = Falta, Positivo = Sobra)
- status : ENUM ('open', 'closed'), DEFAULT 'open'
- created_at : TIMESTAMP
- updated_at : TIMESTAMP

> **⚠️ Impacto na tabela de Vendas (SALES):** 
> Para que o sistema consiga calcular exatamente o faturamento do turno, a tabela de `vendas` que desenhamos antes precisará receber uma nova coluna: **`cash_register_id : UUID, FK`**. Assim, toda venda realizada fica atrelada ao caixa (turno) que estava aberto naquele momento!
