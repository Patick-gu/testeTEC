import os
import re

for root, dirs, files in os.walk('PDV-Frontend/src/pages'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            changed = False
            
            # Remove Proxy styles
            proxy_pattern = re.compile(r"const\s+styles\s*:\s*any\s*=\s*new\s*Proxy.*?;\n?", re.DOTALL)
            if proxy_pattern.search(content):
                content = proxy_pattern.sub('', content)
                changed = True

            # Remove declare const styles
            declare_pattern = re.compile(r"declare\s+const\s+styles\s*:\s*Record<string,\s*string>\s*;\n?")
            if declare_pattern.search(content):
                content = declare_pattern.sub('', content)
                changed = True

            # Check if styles is used but not imported
            if 'styles.' in content and 'import { styles }' not in content:
                # determine path to style.ts
                depth = filepath.count('/') - filepath.find('src/pages/') - 2
                import_path = './style' if 'components' not in filepath else '../style'
                
                # add import after last import
                last_import_idx = content.rfind('import ')
                if last_import_idx != -1:
                    end_of_import = content.find('\n', last_import_idx)
                    content = content[:end_of_import] + f"\nimport {{ styles }} from '{import_path}';" + content[end_of_import:]
                else:
                    content = f"import {{ styles }} from '{import_path}';\n" + content
                changed = True

            if changed:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Fixed styles in {filepath}")

