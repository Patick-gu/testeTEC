import React from 'react';
import { usePaymentService } from './service';
import { PaymentMethodType } from '../../types/pdv';
import { playBeep } from '../../utils/audio';
import { PaymentHeader } from './components/PaymentHeader';
import { PaymentFiscalBar } from './components/PaymentFiscalBar';
import { PaymentLeftPanel } from './components/PaymentLeftPanel';
import { PaymentRightPanel } from './components/PaymentRightPanel';



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
    <div className="flex flex-col w-full flex-1">
      <div className="w-full px-4 lg:px-6 py-5 flex flex-col gap-5">
        
        <PaymentHeader 
          saleNumber={saleNumber}
          customer={customer}
          cpfNumber={cpfNumber}
          totalQuantity={totalQuantity}
          setShowCustomerModal={setShowCustomerModal}
        />
        {/* Main 2-Column Checkout Layout matching Screenshot 3 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          
          <PaymentLeftPanel svc={svc} />
          <PaymentRightPanel svc={svc} />
            <PaymentFiscalBar 
              transmitNfce={transmitNfce}
              setTransmitNfce={setTransmitNfce}
              printCoupon={printCoupon}
              setPrintCoupon={setPrintCoupon}
              whatsAppNumber={whatsAppNumber}
              setWhatsAppNumber={setWhatsAppNumber}
              cpfNumber={cpfNumber}
              setCpfNumber={setCpfNumber}
            />
            {/* Confirm Checkout Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className="w-full sm:flex-1 h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-between px-6 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <div className="text-left">
                    <div className="text-base font-semibold text-white">
                      CONFIRMAR PAGAMENTO E EMITIR CUPOM
                    </div>
                    <div className="text-xs text-white/60 font-mono-num">
                      Encerra venda, dispara SAT e aciona guilhotina térmica
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-md bg-white/10 text-white/80 font-mono-num text-xs hidden sm:block">
                  [ENTER]
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className="w-full sm:w-auto h-14 px-6 rounded-xl bg-white border border-slate-200/60 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-500 transition-all flex items-center justify-center gap-2 text-xs font-medium"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>VOLTAR [ESC]</span>
              </button>
            </div>

          </div>

        </div>
    </div>
  );
};
