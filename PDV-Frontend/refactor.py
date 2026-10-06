import os
import re

hooks = {
    'UIContext': ['activeTab', 'setActiveTab', 'toastMessage', 'showToast', 'showReceiptModal', 'setShowReceiptModal', 'showPrintPromptModal', 'setShowPrintPromptModal', 'showPaymentModal', 'setShowPaymentModal', 'showCpfPromptModal', 'setShowCpfPromptModal', 'showHelpModal', 'setShowHelpModal', 'showCustomerModal', 'setShowCustomerModal', 'showScaleModal', 'setShowScaleModal', 'weighingProduct', 'setWeighingProduct', 'scaleWeight', 'setScaleWeight'],
    'CartContext': ['cart', 'setCart', 'subtotal', 'discount', 'addition', 'total', 'totalQuantity', 'lastScannedItem', 'quantityMultiplier', 'setQuantityMultiplier', 'addProductToCart', 'removeItem', 'updateItemQuantity', 'clearCart'],
    'CashflowContext': ['cashDrawer', 'setCashDrawer', 'addCashMovement', 'closeTurno'],
    'SaleContext': ['saleNumber', 'customer', 'setCustomer', 'parkedSales', 'parkCurrentSale', 'restoreParkedSale', 'completeSale', 'recentReceipt', 'selectedPaymentMethod', 'setSelectedPaymentMethod', 'openPaymentModal', 'startCheckout', 'proceedToPayment']
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'usePdv' not in content and 'PdvProvider' not in content:
        return

    # Replace PdvProvider with GlobalProvider
    content = content.replace('PdvProvider', 'GlobalProvider')

    # Replace import { usePdv } from '../../context/PdvContext'; or similar
    # Wait, the import path varies. Sometimes it's ./context/PdvContext, sometimes ../../context/PdvContext
    import_pattern = re.compile(r"import\s+\{([^}]*usePdv[^}]*)\}\s+from\s+['\"](.*?)PdvContext['\"];")
    
    match = import_pattern.search(content)
    if not match:
        return
    
    imports_str = match.group(1)
    import_path = match.group(2) + "index"

    # Find where usePdv is called: const { ... } = usePdv();
    call_pattern = re.compile(r"const\s+\{\s*([^}]+)\s*\}\s*=\s*usePdv\(\);")
    call_match = call_pattern.search(content)
    
    used_hooks = set()
    replacement_calls = []

    if call_match:
        destructured = call_match.group(1)
        vars_used = [v.strip().split(':')[0].strip() for v in destructured.split(',')]
        
        hook_vars = {'useUI': [], 'useCart': [], 'useCashflow': [], 'useSale': []}
        
        for var in vars_used:
            if not var: continue
            found = False
            for ctx, props in hooks.items():
                if var in props:
                    hook_name = f"use{ctx.replace('Context', '')}"
                    hook_vars[hook_name].append(var)
                    used_hooks.add(hook_name)
                    found = True
                    break
            if not found:
                print(f"WARNING: Var {var} not found in any context for {filepath}")

        for hook, var_list in hook_vars.items():
            if var_list:
                replacement_calls.append(f"const {{ {', '.join(var_list)} }} = {hook}();")

        new_calls = "\n  ".join(replacement_calls)
        content = content[:call_match.start()] + new_calls + content[call_match.end():]
    else:
        # Check if used like `const pdv = usePdv();`
        simple_call = re.compile(r"const\s+(\w+)\s*=\s*usePdv\(\);")
        simple_match = simple_call.search(content)
        if simple_match:
            pdv_var = simple_match.group(1)
            # Need a more complex refactor here if it's used as pdv.something
            print(f"WARNING: Simple usePdv call found in {filepath}. Manual intervention may be needed.")
            # For Terminal/service.ts it does const pdv = usePdv(); 
            # We can just change it to const pdv = { ...useUI(), ...useCart(), ...useSale(), ...useCashflow() };
            used_hooks.update(["useUI", "useCart", "useCashflow", "useSale"])
            content = content.replace(f"const {pdv_var} = usePdv();", f"const {pdv_var} = {{ ...useUI(), ...useCart(), ...useSale(), ...useCashflow() }};")

    if 'usePdv' in imports_str:
        new_imports = list(used_hooks)
        if 'GlobalProvider' in imports_str:
            new_imports.append('GlobalProvider')
        if new_imports:
            new_import_stmt = f"import {{ {', '.join(new_imports)} }} from '{import_path}';"
            content = content[:match.start()] + new_import_stmt + content[match.end():]

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            if file != 'PdvContext.tsx':
                process_file(os.path.join(root, file))

