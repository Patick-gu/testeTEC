import re

path = 'PDV-Frontend/src/pages/Payment/components/PaymentRightPanel.tsx'
with open(path, 'r') as f:
    content = f.read()

# Remove playBeep from destructuring
content = content.replace('setPixPaid, playBeep', 'setPixPaid')

# Add imports
imports = "import { playBeep } from '../../../utils/audio';\n"
if 'formatBRL' not in content[:500]:
    imports += "const formatBRL = (val: number) => val.toFixed(2).replace('.', ',');\n"

content = imports + content

# Fix PaymentMethodType
content = content.replace('as PaymentMethodType', 'as any')

with open(path, 'w') as f:
    f.write(content)
