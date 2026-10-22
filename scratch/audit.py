import re
import sys

css_file = 'src/styles/main.css'

try:
    with open(css_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

print("=== 1. backdrop-filter prefixes ===")
for i, line in enumerate(lines):
    if 'backdrop-filter:' in line and '-webkit-backdrop-filter:' not in line:
        # Check previous line
        if i > 0 and '-webkit-backdrop-filter:' not in lines[i-1]:
            print(f"Missing -webkit prefix at line {i+1}: {line.strip()}")

print("\n=== 2. Light theme login card overrides ===")
for i, line in enumerate(lines):
    if 'body[data-theme="light"] .login-card' in line or 'body[data-theme="light"] .login-overlay' in line:
        print(f"Found override at line {i+1}: {line.strip()}")
        # print next 10 lines
        for j in range(1, 11):
            if i+j < len(lines):
                print(f"  {lines[i+j].strip()}")

print("\n=== 3. .settings-secondary-btn ===")
for i, line in enumerate(lines):
    if '.settings-secondary-btn' in line:
        print(f"Line {i+1}: {line.strip()}")

print("\n=== 4. .bucket-delete-btn ===")
for i, line in enumerate(lines):
    if '.bucket-delete-btn' in line:
        print(f"Line {i+1}: {line.strip()}")

print("\n=== 5. Z-index audit ===")
current_selector = ""
selector_line = 0
for i, line in enumerate(lines):
    if '{' in line and not line.strip().startswith('@'):
        current_selector = line.split('{')[0].strip()
        selector_line = i + 1
    if 'z-index' in line:
        print(f"Line {i+1} | {current_selector} (L{selector_line}) | {line.strip()}")

print("\n=== 6. Theme names check ===")
themes = set()
for line in lines:
    matches = re.findall(r'body\[data-theme="([^"]+)"\]', line)
    for match in matches:
        themes.add(match)
print(f"Themes found: {', '.join(themes)}")

print("\n=== 7. Theme coverage for key components ===")
key_components = ['.clean-status-popup', '.map-status-popup', '.profile-overlay']
for i, line in enumerate(lines):
    for comp in key_components:
        if comp in line and 'body[data-theme="' in line and '"dark"' not in line:
            print(f"Line {i+1}: {line.strip()}")

print("\n=== 8. Mobile breakpoints ===")
for i, line in enumerate(lines):
    if '@media' in line and 'max-width' in line:
        print(f"Line {i+1}: {line.strip()}")

print("\n=== 9. Duplicate selectors ===")
target_dupes = ['.floating-profile-wrap', '.profile-overlay', '.clean-status-popup']
for target in target_dupes:
    count = 0
    lines_found = []
    for i, line in enumerate(lines):
        if line.strip().startswith(target) and '{' in line:
            count += 1
            lines_found.append(i+1)
    if count > 1:
        print(f"Duplicate {target} found at lines: {lines_found}")
    else:
        print(f"{target} count: {count}")

print("\n=== 10. Animation / transition ===")
interactive_classes = ['.bucket-delete-btn', '.settings-secondary-btn', '.bucket-move-btn', '.airline-card']
for i, line in enumerate(lines):
    for cls in interactive_classes:
        if cls in line:
            print(f"Found {cls} at line {i+1}")
            for j in range(1, 15):
                if i+j < len(lines):
                    if 'transition:' in lines[i+j] or 'transition :' in lines[i+j]:
                        print(f"  Transition: {lines[i+j].strip()}")
                    if '}' in lines[i+j]:
                        break

print("\n=== 14. Scroll behavior ===")
scroll_classes = ['.profile-tab-content', '.ach-grid', '.compare-list', '.bucket-list-grid']
for i, line in enumerate(lines):
    for cls in scroll_classes:
        if line.strip().startswith(cls):
            print(f"Found {cls} at line {i+1}")
            for j in range(1, 15):
                if i+j < len(lines):
                    if 'overflow' in lines[i+j]:
                        print(f"  {lines[i+j].strip()}")
                    if '}' in lines[i+j]:
                        break

print("\n=== 15. Font scaling ===")
size_classes = ['.ui-size-compact', '.ui-size-standard', '.ui-size-large']
for i, line in enumerate(lines):
    for cls in size_classes:
        if cls in line:
            print(f"Found {cls} at line {i+1}")
            for j in range(1, 10):
                if i+j < len(lines):
                    if 'font-size' in lines[i+j]:
                        print(f"  {lines[i+j].strip()}")
                    if '}' in lines[i+j]:
                        break
