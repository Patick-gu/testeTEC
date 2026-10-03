import React from 'react';
import { usePaymentService } from './service';
import { styles } from './style';
import { PaymentMethodType } from '../../types/pdv';
import { playBeep } from '../../utils/audio';

export const PaymentScreen: React.FC = () => {
  const svc = usePaymentService();
  const {
    total, totalQuantity, saleNumber, customer, setActiveTab, setShowCustomerModal,
    activeMethod, setActiveMethod, receivedCashStr, setReceivedCashStr,
    isCleanInput, setIsCleanInput, selectedInstallment, setSelectedInstallment,
    transmitNfce, setTransmitNfce, printCoupon, setPrintCoupon,
    whatsAppNumber, setWhatsAppNumber, cpfNumber, setCpfNumber,
    appliedPayments, setAppliedPayments, splitAmount, setSplitAmount,
    splitMethod, setSplitMethod, pixPaid, setPixPaid, pixTimer, setPixTimer,
    parseBRLToNumber, formatBRL, receivedCash, cashTroco,
    handleCashChange, handleCashBlur, handleExactCash, handleClearCash, handleCashKeyDown,
    totalPaid, remainingToPay, formatTimer, handleSetCashValue, handleAddSplitPayment, handleRemovePayment, handleConfirmCheckout
  } = svc;

  return (
    <div className={styles.style_1}>
      <div className={styles.style_2}>
        
        {/* Top Context Bar */}
        <div className={styles.style_3}>
          <div className={styles.style_4}>
            <div className={styles.style_5}>
              <span className={styles.style_6}>shopping_cart_checkout</span>
              <span>VENDA #{saleNumber}</span>
            </div>

            <div className={styles.style_7}>
              <span>Cliente: </span>
              <strong className={styles.style_8}>
                {cpfNumber ? `Consumidor (CPF ${cpfNumber})` : customer.name}
              </strong>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className={styles.style_9}
            >
              [F9] Identificar Cliente
            </button>
          </div>

          <div className={styles.style_10}>
            <div className={styles.style_11}>
              <span>
                Itens: <strong className={styles.style_12}>{totalQuantity} un</strong>
              </span>
              <span className={styles.style_13}>•</span>
              <span>
                Descontos: <strong className={styles.style_14}>R$ 0,00</strong>
              </span>
            </div>

            <div className={styles.style_15}></div>

            <span className={styles.style_16}>
              <span className={styles.style_17}></span>
              FLUXO ATIVO
            </span>
          </div>
        </div>

        {/* Main 2-Column Checkout Layout matching Screenshot 3 */}
        <div className={styles.style_18}>
          
          {/* LEFT PANEL (5 cols): Method selector, applied payments table, PINPad status */}
          <div className={styles.style_19}>
            
            {/* Step 1: Payment Method Tile Grid */}
            <div className={styles.style_20}>
              <div className={styles.style_21}>
                <div>
                  <span className={styles.style_22}>
                    Passo 1
                  </span>
                  <h2 className={styles.style_23}>Forma de Pagamento</h2>
                </div>
                <span className={styles.style_24}>
                  Selecione 1 a 5
                </span>
              </div>

              {/* Grid 2x2 of Primary Methods */}
              <div className={styles.style_25}>
                {/* 1 - DINHEIRO */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('cash')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'cash'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={styles.style_26}>
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'cash' ? 'text-white' : 'text-emerald-600'
                      }`}
                    >
                      payments
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'cash'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      1
                    </span>
                  </div>
                  <div>
                    <div className={styles.style_27}>Dinheiro</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'cash' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Com troco expresso
                    </div>
                  </div>
                </button>

                {/* 2 - PIX */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('pix')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'pix'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={styles.style_28}>
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'pix' ? 'text-white' : 'text-emerald-600'
                      }`}
                    >
                      qr_code_2
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'pix'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      2
                    </span>
                  </div>
                  <div>
                    <div className={styles.style_29}>PIX Dinâmico</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'pix' ? 'text-emerald-200' : 'text-emerald-700 font-medium'
                      }`}
                    >
                      Confirmação instantânea
                    </div>
                  </div>
                </button>

                {/* 3 - DÉBITO TEF */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('debit')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'debit'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={styles.style_30}>
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'debit' ? 'text-white' : 'text-blue-600'
                      }`}
                    >
                      credit_card
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'debit'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      3
                    </span>
                  </div>
                  <div>
                    <div className={styles.style_31}>Débito TEF</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'debit' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      PinPad Integrado
                    </div>
                  </div>
                </button>

                {/* 4 - CRÉDITO TEF */}
                <button
                  type="button"
                  onClick={() => setActiveMethod('credit')}
                  className={`text-left p-3.5 rounded-lg transition-all flex flex-col justify-between h-24 group ${
                    activeMethod === 'credit'
                      ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={styles.style_32}>
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        activeMethod === 'credit' ? 'text-white' : 'text-amber-600'
                      }`}
                    >
                      credit_score
                    </span>
                    <span
                      className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                        activeMethod === 'credit'
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      4
                    </span>
                  </div>
                  <div>
                    <div className={styles.style_33}>Crédito TEF</div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'credit' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Até 12x parcelas
                    </div>
                  </div>
                </button>
              </div>

              {/* 5 - PAGAMENTO MISTO / DIVIDIR */}
              <button
                type="button"
                onClick={() => setActiveMethod('split')}
                className={`w-full p-3.5 rounded-lg transition-all flex items-center justify-between group ${
                  activeMethod === 'split'
                    ? 'border border-[#004ac6] bg-[#004ac6] text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className={styles.style_34}>
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center ${
                      activeMethod === 'split'
                        ? 'bg-blue-800 text-white'
                        : 'bg-blue-50 border border-blue-200 text-blue-600'
                    }`}
                  >
                    <span className={styles.style_35}>call_split</span>
                  </div>
                  <div className={styles.style_36}>
                    <div className={styles.style_37}>
                      Pagamento Misto / Dividir Conta
                    </div>
                    <div
                      className={`text-xs ${
                        activeMethod === 'split' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      Combinar Dinheiro, PIX e Cartões múltiplos
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono-num text-xs px-1.5 py-0.5 rounded font-bold ${
                    activeMethod === 'split'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  5
                </span>
              </button>
            </div>

            {/* Split Payments Compilation Table */}
            <div className={styles.style_38}>
              <div className={styles.style_39}>
                <div className={styles.style_40}>
                  <span className={styles.style_41}>receipt_long</span>
                  <span className={styles.style_42}>
                    COMPOSIÇÃO DE RECEBIMENTOS
                  </span>
                </div>
                <span className={styles.style_43}>
                  {appliedPayments.length} Lançamento{appliedPayments.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className={styles.style_44}>
                <table className={styles.style_45}>
                  <thead className={styles.style_46}>
                    <tr className={styles.style_47}>
                      <th className={styles.style_48}>Forma</th>
                      <th className={styles.style_49}>Detalhe</th>
                      <th className={styles.style_50}>Valor</th>
                      <th className={styles.style_51}>Ação</th>
                    </tr>
                  </thead>
                  <tbody className={styles.style_52}>
                    {appliedPayments.map((p) => (
                      <tr key={p.id} className={styles.style_53}>
                        <td className={styles.style_54}>
                          {p.methodLabel}
                        </td>
                        <td className={styles.style_55}>
                          {p.detail}
                        </td>
                        <td className={styles.style_56}>
                          R$ {p.amount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className={styles.style_57}>
                          <button
                            onClick={() => handleRemovePayment(p.id)}
                            className={styles.style_58}
                            title="Remover lançamento"
                          >
                            <span className={styles.style_59}>delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {appliedPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className={styles.style_60}>
                          Nenhum recebimento registrado ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Paid & Remaining Balance */}
              <div className={styles.style_61}>
                <div className={styles.style_62}>
                  <span className={styles.style_63}>
                    TOTAL PAGO
                  </span>
                  <span className={styles.style_64}>
                    R$ {totalPaid.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className={styles.style_65}>
                  <span className={styles.style_66}>
                    RESTANTE
                  </span>
                  <span className={styles.style_67}>
                    R$ {remainingToPay.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* PINPAD Hardware Banner (Image from template) */}
            <div className={styles.style_68}>
              <div className={styles.style_69}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1P2FQGpS60Wn9g8ExepHsOmVTXQstmFUnms4W0PscJTtoaTiSwxSZc3VLyooEAZi9G87JvSUnO4MuE2y6E_U7tgS6ojcV_iapCOqoxNGGT_fM0ff-PxFZE8atDgV-I6OrcX5vF5ueo7iXeCSnyMo42J5B5XlH7ujJCWpubgvJK2RMDshRS8XqMs4SWU6jFLKL7ezSm6JXIG_pBxNRW-OxEK_THwdKbJM-gfMvmYRN5KDpkft04n1c"
                  alt="Terminal PINPad TEF"
                  className={styles.style_70}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className={styles.style_71}>
                <div className={styles.style_72}>
                  <span className={styles.style_73}>hardware</span>
                  PINPAD TEF PRONTO
                </div>
                <p className={styles.style_74}>
                  Stone • Terminal 9210-SP • Homologado
                </p>
                <span className={styles.style_75}>
                  Nenhum erro de barramento detectado
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL (7 cols): Hero totalizer, dynamic payment workspace, fiscal bar, confirm button */}
          <div className={styles.style_76}>
            
            {/* Hero Totalizer Card */}
            <div className={styles.style_77}>
              <div className={styles.style_78}>
                <div className={styles.style_79}>
                  <span className={styles.style_80}>monetization_on</span>
                  <span>TOTAL GERAL DA VENDA</span>
                </div>
                <div className={styles.style_81}>
                  R$ {total.toFixed(2).replace('.', ',')}
                </div>
                <span className={styles.style_82}>
                  Descontos automáticos de convênio aplicados
                </span>
              </div>

              {/* Quick Troco Callout */}
              <div className={styles.style_83}>
                <span className={styles.style_84}>
                  Troco Estimado
                </span>
                <span className={styles.style_85}>
                  R$ {cashTroco.toFixed(2).replace('.', ',')}
                </span>
                <span className={styles.style_86}>
                  Recebendo R$ {receivedCash.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Dynamic Workspace Container */}
            <div className={styles.style_87}>
              
              {/* SECTION: CASH / DINHEIRO */}
              {activeMethod === 'cash' && (
                <div className={styles.style_88}>
                  <div className={styles.style_89}>
                    <div className={styles.style_90}>
                      <span className={styles.style_91}>
                        payments
                      </span>
                      <div>
                        <h3 className={styles.style_92}>Pagamento em Dinheiro</h3>
                        <p className={styles.style_93}>Informe o montante em cédulas recebido do cliente</p>
                      </div>
                    </div>
                    <div className={styles.style_94}>
                      <button
                        type="button"
                        onClick={handleExactCash}
                        className={styles.style_95}
                      >
                        [F5] Sugerir Exato
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCash}
                        className={styles.style_96}
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Calculator & Value Input */}
                  <div className={styles.style_97}>
                    <div className={styles.style_98}>
                      <label className={styles.style_99}>
                        VALOR RECEBIDO EM DINHEIRO
                      </label>
                      <span className={styles.style_100}>
                        R$ {formatBRL(receivedCash)}
                      </span>
                    </div>

                    <div className={styles.style_101}>
                      <div className={styles.style_102}>
                        <span className={styles.style_103}>
                          R$
                        </span>
                        <input
                          autoFocus
                          type="text"
                          inputMode="decimal"
                          value={receivedCashStr}
                          onChange={handleCashChange}
                          onBlur={handleCashBlur}
                          onKeyDown={handleCashKeyDown}
                          onFocus={(e) => {
                            e.target.select();
                            setIsCleanInput(true);
                          }}
                          placeholder="0,00"
                          className={styles.style_104}
                        />
                      </div>
                      {receivedCashStr && receivedCashStr !== '0,00' && (
                        <button
                          type="button"
                          onClick={handleClearCash}
                          className={styles.style_105}
                          title="Limpar campo"
                        >
                          <span className={styles.style_106}>close</span>
                        </button>
                      )}
                    </div>

                    <span className={styles.style_107}>
                      Pressione [F5] para valor exato ou digite o montante
                    </span>
                  </div>

                  {/* Troco a devolver Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      cashTroco > 0
                        ? 'bg-emerald-50 border-emerald-300'
                        : receivedCash === total
                        ? 'bg-slate-100 border-slate-300'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className={styles.style_108}>
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 ${
                          cashTroco > 0
                            ? 'bg-emerald-600'
                            : receivedCash === total
                            ? 'bg-slate-700'
                            : 'bg-rose-600'
                        }`}
                      >
                        <span className={styles.style_109}>
                          {cashTroco > 0
                            ? 'currency_exchange'
                            : receivedCash === total
                            ? 'check'
                            : 'warning'}
                        </span>
                      </div>
                      <div>
                        <span className={styles.style_110}>
                          {receivedCash < total ? 'Valor Insuficiente' : 'Troco a Devolver'}
                        </span>
                        <div
                          className={`text-3xl font-extrabold font-mono-num ${
                            cashTroco > 0
                              ? 'text-emerald-700'
                              : receivedCash === total
                              ? 'text-slate-800'
                              : 'text-rose-600'
                          }`}
                        >
                          R$ {formatBRL(cashTroco)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PIX DINÂMICO */}
              {activeMethod === 'pix' && (
                <div className={styles.style_111}>
                  <div className={styles.style_112}>
                    <div className={styles.style_113}>
                      <span className={styles.style_114}>
                        qr_code_2
                      </span>
                      <div>
                        <h3 className={styles.style_115}>PIX - Banco Central</h3>
                        <p className={styles.style_116}>Aponte o app do banco ou utilize o Copia e Cola</p>
                      </div>
                    </div>
                    <div className={styles.style_117}>
                      <span className={styles.style_118}></span>
                      {pixPaid ? 'COMPENSADO COM SUCESSO' : 'Aguardando confirmação...'}
                    </div>
                  </div>

                  <div className={styles.style_119}>
                    {/* Stylized QR Code Box */}
                    <div className={styles.style_120}>
                      <svg className={styles.style_121} viewBox="0 0 100 100" fill="currentColor">
                        <rect x="5" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                        <rect x="9" y="9" width="20" height="20" rx="1" fill="#ffffff" />
                        <rect x="13" y="13" width="12" height="12" fill="#0f172a" />
                        <rect x="67" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                        <rect x="71" y="9" width="20" height="20" rx="1" fill="#ffffff" />
                        <rect x="75" y="13" width="12" height="12" fill="#0f172a" />
                        <rect x="5" y="67" width="28" height="28" rx="2" fill="#0f172a" />
                        <rect x="9" y="71" width="20" height="20" rx="1" fill="#ffffff" />
                        <rect x="13" y="75" width="12" height="12" fill="#0f172a" />
                        <rect x="38" y="10" width="8" height="8" fill="#0f172a" />
                        <rect x="50" y="10" width="8" height="16" fill="#0f172a" />
                        <rect x="38" y="24" width="6" height="8" fill="#0f172a" />
                        <rect x="10" y="38" width="14" height="6" fill="#0f172a" />
                        <rect x="30" y="38" width="18" height="18" fill="#0f172a" />
                        <rect x="54" y="34" width="8" height="12" fill="#0f172a" />
                        <rect x="68" y="38" width="22" height="8" fill="#0f172a" />
                        <rect x="38" y="60" width="12" height="12" fill="#0f172a" />
                        <rect x="56" y="54" width="16" height="8" fill="#0f172a" />
                        <rect x="54" y="68" width="10" height="18" fill="#0f172a" />
                        <rect x="70" y="54" width="8" height="24" fill="#0f172a" />
                        <rect x="84" y="70" width="10" height="18" fill="#0f172a" />
                        <rect x="38" y="78" width="10" height="14" fill="#0f172a" />
                      </svg>
                      <span className={styles.style_122}>
                        Expirando em {formatTimer(pixTimer)}
                      </span>
                    </div>

                    {/* PIX instructions and Copy string */}
                    <div className={styles.style_123}>
                      <div>
                        <span className={styles.style_124}>
                          Identificador de Transação (E2E)
                        </span>
                        <div className={styles.style_125}>
                          00020126580014br.gov.bcb.pix0136e4b88921-992a-4f40-b198-100234520400005303986
                        </div>
                      </div>

                      <div className={styles.style_126}>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(
                              '00020126580014br.gov.bcb.pix0136e4b88921-992a-4f40-b198-100234520400005303986'
                            );
                            playBeep('scan');
                          }}
                          className={styles.style_127}
                        >
                          <span className={styles.style_128}>content_copy</span>
                          Copiar Código
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPixPaid(true);
                            playBeep('success');
                          }}
                          className={styles.style_129}
                        >
                          <span className={styles.style_130}>check_circle</span>
                          Simular Aprovação Automática
                        </button>
                      </div>

                      <div className={styles.style_131}>
                        <span className={styles.style_132}>verified_user</span>
                        O terminal processará automaticamente assim que compensado pelo PSP.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DÉBITO TEF */}
              {activeMethod === 'debit' && (
                <div className={styles.style_133}>
                  <div className={styles.style_134}>
                    <div className={styles.style_135}>
                      <span className={styles.style_136}>
                        credit_card
                      </span>
                      <div>
                        <h3 className={styles.style_137}>Cartão de Débito (TEF)</h3>
                        <p className={styles.style_138}>Conexão direta com maquineta integrada</p>
                      </div>
                    </div>
                    <span className={styles.style_139}>
                      PINPAD: INSIRA OU APROXIME
                    </span>
                  </div>

                  <div className={styles.style_140}>
                    <span className={styles.style_141}>
                      contactless
                    </span>
                    <div className={styles.style_142}>Aguardando Leitura no Terminal</div>
                    <p className={styles.style_143}>
                      Peça ao cliente para aproximar o cartão NFC, celular ou inserir o chip na leitora externa.
                    </p>
                    <div className={styles.style_144}>
                      <button
                        type="button"
                        onClick={() => {
                          playBeep('success');
                          handleConfirmCheckout();
                        }}
                        className={styles.style_145}
                      >
                        Simular Aprovação Cartão Débito
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CRÉDITO TEF / PARCELAMENTO */}
              {activeMethod === 'credit' && (
                <div className={styles.style_146}>
                  <div className={styles.style_147}>
                    <div className={styles.style_148}>
                      <span className={styles.style_149}>
                        credit_score
                      </span>
                      <div>
                        <h3 className={styles.style_150}>Cartão de Crédito com Parcelamento</h3>
                        <p className={styles.style_151}>Selecione o número de parcelas desejadas</p>
                      </div>
                    </div>
                  </div>

                  {/* Parcelas grid */}
                  <div className={styles.style_152}>
                    {[
                      { parcels: 1, label: 'À vista', fee: 'Sem juros' },
                      { parcels: 2, label: '2 Parcelas', fee: 'Sem juros' },
                      { parcels: 3, label: '3 Parcelas', fee: 'Sem juros' },
                      { parcels: 4, label: '4 Parcelas', fee: 'Taxa padrão' },
                      { parcels: 6, label: '6 Parcelas', fee: 'Com juros (1.2%)' },
                      { parcels: 10, label: '10 Parcelas', fee: 'Com juros' },
                      { parcels: 12, label: '12 Parcelas', fee: 'Com juros' }
                    ].map((item) => {
                      const parcelVal = (total / item.parcels).toFixed(2).replace('.', ',');
                      const isSelected = selectedInstallment === item.parcels;
                      return (
                        <button
                          key={item.parcels}
                          type="button"
                          onClick={() => setSelectedInstallment(item.parcels)}
                          className={`p-3 rounded-lg text-left transition-all border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-900'
                          }`}
                        >
                          <span
                            className={`text-xs font-mono-num ${
                              isSelected ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {item.label}
                          </span>
                          <div className={styles.style_153}>
                            {item.parcels}x R$ {parcelVal}
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected
                                ? 'text-emerald-200'
                                : item.fee.includes('Sem juros')
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.fee}
                          </span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className={styles.style_154}
                    >
                      <span className={styles.style_155}>tune</span>
                      <span className={styles.style_156}>Outro Valor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: PAGAMENTO MISTO / DIVIDIR CONTA */}
              {activeMethod === 'split' && (
                <div className={styles.style_157}>
                  <div className={styles.style_158}>
                    <span className={styles.style_159}>
                      call_split
                    </span>
                    <div>
                      <h3 className={styles.style_160}>Divisão & Pagamento Misto</h3>
                      <p className={styles.style_161}>Adicione múltiplos pagamentos até zerar o saldo pendente</p>
                    </div>
                  </div>

                  <div className={styles.style_162}>
                    <input
                      type="text"
                      value={splitAmount}
                      onChange={(e) => setSplitAmount(e.target.value)}
                      placeholder={`Valor parcial (R$ ${remainingToPay.toFixed(2)})`}
                      className={styles.style_163}
                    />

                    <select
                      value={splitMethod}
                      onChange={(e) => setSplitMethod(e.target.value as PaymentMethodType)}
                      className={styles.style_164}
                    >
                      <option value="cash">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="credit">Cartão de Crédito</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSplitPayment}
                      className={styles.style_165}
                    >
                      + Adicionar Parcela
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Fiscal Dispatch & Emission Options Bar */}
            <div className={styles.style_166}>
              <div className={styles.style_167}>
                <label className={styles.style_168}>
                  <input
                    type="checkbox"
                    checked={transmitNfce}
                    onChange={(e) => setTransmitNfce(e.target.checked)}
                    className={styles.style_169}
                  />
                  <span className={styles.style_170}>Transmitir NFC-e</span>
                </label>

                <label className={styles.style_171}>
                  <input
                    type="checkbox"
                    checked={printCoupon}
                    onChange={(e) => setPrintCoupon(e.target.checked)}
                    className={styles.style_172}
                  />
                  <span className={styles.style_173}>
                    <span className={styles.style_174}>print</span>
                    Imprimir Cupom
                    <span className={styles.style_175}>[F12]</span>
                  </span>
                </label>

                <div className={styles.style_176}>
                  <span className={styles.style_177}>send_to_mobile</span>
                  <input
                    type="tel"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="WhatsApp Cupom (DDD + Tel)"
                    className={styles.style_178}
                  />
                </div>
              </div>

              {/* CPF na Nota */}
              <div className={styles.style_179}>
                <span className={styles.style_180}>
                  CPF na Nota:
                </span>
                <input
                  type="text"
                  value={cpfNumber}
                  onChange={(e) => setCpfNumber(e.target.value)}
                  placeholder="000.000.000-00"
                  className={styles.style_181}
                />
              </div>
            </div>

            {/* Confirm Checkout Action Button */}
            <div className={styles.style_182}>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className={styles.style_183}
              >
                <div className={styles.style_184}>
                  <div className={styles.style_185}>
                    <span className={styles.style_186}>check_circle</span>
                  </div>
                  <div className={styles.style_187}>
                    <div className={styles.style_188}>
                      CONFIRMAR PAGAMENTO E EMITIR CUPOM
                    </div>
                    <div className={styles.style_189}>
                      Encerra venda, dispara SAT e aciona guilhotina térmica
                    </div>
                  </div>
                </div>
                <span className={styles.style_190}>
                  [ENTER]
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={styles.style_191}
              >
                <span className={styles.style_192}>arrow_back</span>
                <span>VOLTAR [ESC]</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
