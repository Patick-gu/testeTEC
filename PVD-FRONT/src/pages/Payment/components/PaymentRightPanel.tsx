import React from 'react';
import { usePaymentService } from '../service';

interface PaymentRightPanelProps {
  svc: ReturnType<typeof usePaymentService>;
}

export const PaymentRightPanel: React.FC<PaymentRightPanelProps> = ({ svc }) => {
  const {
    total, activeMethod, receivedCashStr, setReceivedCashStr, handleCashChange, handleCashBlur,
    handleCashKeyDown, handleExactCash, handleClearCash, receivedCash, cashTroco, pixTimer, formatTimer,
    isCleanInput, setIsCleanInput, selectedInstallment, setSelectedInstallment,
    splitAmount, setSplitAmount, splitMethod, setSplitMethod, handleAddSplitPayment,
    handleConfirmCheckout, remainingToPay, totalPaid
  } = svc;

  return (
    {/* RIGHT PANEL (7 cols): Hero totalizer, dynamic payment workspace, fiscal bar, confirm button */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            
            {/* Hero Totalizer Card */}
            <div className="bg-white border border-slate-200/60 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider font-medium">
                  <span className="material-symbols-outlined text-slate-300 text-sm">monetization_on</span>
                  <span>TOTAL GERAL DA VENDA</span>
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 font-mono-num tracking-tight mt-1">
                  R$ {total.toFixed(2).replace('.', ',')}
                </div>
                <span className="text-xs text-slate-400 font-mono-num mt-0.5">
                  Descontos automáticos de convênio aplicados
                </span>
              </div>

              {/* Quick Troco Callout */}
              <div className="relative z-10 bg-slate-50 border border-slate-200/60 px-5 py-3 rounded-xl flex flex-col items-end justify-center min-w-[200px]">
                <span className="text-xs text-emerald-500 uppercase font-medium tracking-wider">
                  Troco Estimado
                </span>
                <span className="text-3xl font-bold text-emerald-600 font-mono-num my-0.5">
                  R$ {cashTroco.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-slate-400 font-mono-num">
                  Recebendo R$ {receivedCash.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Dynamic Workspace Container */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-xl flex flex-col gap-4 min-h-[340px]">
              
              {/* SECTION: CASH / DINHEIRO */}
              {activeMethod === 'cash' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center material-symbols-outlined text-xl">
                        payments
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">Pagamento em Dinheiro</h3>
                        <p className="text-xs text-slate-400">Informe o montante em cédulas recebido do cliente</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExactCash}
                        className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-medium hover:bg-slate-200 transition-colors font-mono-num"
                      >
                        [F7] Sugerir Exato
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCash}
                        className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors font-mono-num"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Calculator & Value Input */}
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="flex items-center justify-between w-full max-w-sm px-1">
                      <label className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                        VALOR RECEBIDO EM DINHEIRO
                      </label>
                      <span className="text-[10px] text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                        R$ {formatBRL(receivedCash)}
                      </span>
                    </div>

                    <div className="w-full max-w-sm bg-white border-2 border-slate-200 focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-3 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-mono-num text-slate-300 select-none">
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
                          className="w-48 bg-transparent text-slate-900 text-3xl font-mono-num font-bold text-left focus:outline-none tracking-tight leading-none"
                        />
                      </div>
                      {receivedCashStr && receivedCashStr !== '0,00' && (
                        <button
                          type="button"
                          onClick={handleClearCash}
                          className="text-slate-300 hover:text-slate-500 p-1 transition-colors"
                          title="Limpar campo"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono-num">
                      Pressione [F7] para valor exato ou digite o montante
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
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0 ${
                          cashTroco > 0
                            ? 'bg-emerald-600'
                            : receivedCash === total
                            ? 'bg-slate-700'
                            : 'bg-rose-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {cashTroco > 0
                            ? 'currency_exchange'
                            : receivedCash === total
                            ? 'check'
                            : 'warning'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs uppercase font-medium tracking-wider text-slate-500">
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
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center material-symbols-outlined text-xl">
                        qr_code_2
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">PIX - Banco Central</h3>
                        <p className="text-xs text-slate-400">Aponte o app do banco ou utilize o Copia e Cola</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {pixPaid ? 'COMPENSADO COM SUCESSO' : 'Aguardando confirmação...'}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-5 rounded-xl">
                    {/* Stylized QR Code Box */}
                    <div className="p-4 bg-white border border-slate-200/60 rounded-xl shrink-0 flex flex-col items-center">
                      <svg className="w-40 h-40 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
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
                      <span className="text-[11px] text-slate-400 mt-2 font-mono-num">
                        Expirando em {formatTimer(pixTimer)}
                      </span>
                    </div>

                    {/* PIX instructions and Copy string */}
                    <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          Identificador de Transação (E2E)
                        </span>
                        <div className="text-xs text-slate-500 font-mono-num truncate select-all bg-white border border-slate-200/60 p-2 rounded-lg mt-1">
                          00020126580014br.gov.bcb.pix0136e4b88921-992a-4f40-b198-100234520400005303986
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(
                              '00020126580014br.gov.bcb.pix0136e4b88921-992a-4f40-b198-100234520400005303986'
                            );
                            playBeep('scan');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-500 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm text-slate-400">content_copy</span>
                          Copiar Código
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPixPaid(true);
                            playBeep('success');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Simular Aprovação Automática
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50 flex items-center gap-2 text-emerald-600 text-xs font-medium mt-1">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">verified_user</span>
                        O terminal processará automaticamente assim que compensado pelo PSP.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DÉBITO TEF */}
              {activeMethod === 'debit' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center material-symbols-outlined text-xl">
                        credit_card
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">Cartão de Débito (TEF)</h3>
                        <p className="text-xs text-slate-400">Conexão direta com maquineta integrada</p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full font-medium font-mono-num">
                      PINPAD: INSIRA OU APROXIME
                    </span>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl animate-bounce">
                      contactless
                    </span>
                    <div className="text-lg font-semibold text-slate-700">Aguardando Leitura no Terminal</div>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Peça ao cliente para aproximar o cartão NFC, celular ou inserir o chip na leitora externa.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playBeep('success');
                          handleConfirmCheckout();
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                      >
                        Simular Aprovação Cartão Débito
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: CRÉDITO TEF / PARCELAMENTO */}
              {activeMethod === 'credit' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center material-symbols-outlined text-xl">
                        credit_score
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">Cartão de Crédito com Parcelamento</h3>
                        <p className="text-xs text-slate-400">Selecione o número de parcelas desejadas</p>
                      </div>
                    </div>
                  </div>

                  {/* Parcelas grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          <div className="text-sm font-semibold font-mono-num">
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
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-center flex flex-col justify-center items-center text-slate-500 transition-all hover:border-slate-300 border border-transparent"
                    >
                      <span className="material-symbols-outlined text-xl">tune</span>
                      <span className="text-xs font-medium font-mono-num">Outro Valor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: PAGAMENTO MISTO / DIVIDIR CONTA */}
              {activeMethod === 'split' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center material-symbols-outlined text-xl">
                      call_split
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">Divisão & Pagamento Misto</h3>
                      <p className="text-xs text-slate-400">Adicione múltiplos pagamentos até zerar o saldo pendente</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={splitAmount}
                      onChange={(e) => setSplitAmount(e.target.value)}
                      placeholder={`Valor parcial (R$ ${remainingToPay.toFixed(2)})`}
                      className="bg-white border border-slate-200/60 px-3 py-2.5 rounded-xl text-slate-700 font-mono-num text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />

                    <select
                      value={splitMethod}
                      onChange={(e) => setSplitMethod(e.target.value as PaymentMethodType)}
                      className="bg-white border border-slate-200/60 px-3 py-2.5 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="cash">Dinheiro</option>
                      <option value="pix">PIX</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="credit">Cartão de Crédito</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSplitPayment}
                      className="bg-slate-900 text-white text-sm font-semibold rounded-xl px-4 py-2.5 hover:bg-slate-800 transition-colors"
                    >
                      + Adicionar Parcela
                    </button>
                  </div>
                </div>
              )}

            </div>
  );
};
