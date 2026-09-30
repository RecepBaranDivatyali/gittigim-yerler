import sys

css_file = 'src/styles/main.css'

with open(css_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== 1. backdrop-filter totals ===")
count = 0
for line in lines:
    if 'backdrop-filter:' in line:
        count += 1
print(f"Total backdrop-filter rules found: {count}")

print("\n=== 2. Light theme login card overrides (all .login-) ===")
for i, line in enumerate(lines):
    if 'body[data-theme="light"] .login' in line:
        print(f"L{i+1}: {line.strip()}")

print("\n=== 9. Duplicate selectors context ===")
for i in [1171, 2244, 3670, 5218]:
    print(f"L{i}: {lines[i-1].strip()}")
    # print nearest media query above it
    for j in range(i-1, max(0, i-50), -1):
        if '@media' in lines[j]:
            print(f"  Inside: {lines[j].strip()}")
            break

print("\n=== 14. Scroll behavior exact styles ===")
scroll_classes = ['.profile-tab-content', '.ach-grid', '.compare-list', '.bucket-list-grid']
for i, line in enumerate(lines):
    for cls in scroll_classes:
        if cls in line and '{' in line:
            print(f"L{i+1}: {line.strip()}")
            for j in range(1, 15):
                if i+j < len(lines):
                    if 'overflow' in lines[i+j]:
                        print(f"  {lines[i+j].strip()}")
                    if '}' in lines[i+j]:
                        break

print("\n=== 15. Font scaling exactly ===")
for i, line in enumerate(lines):
    if 'ui-size' in line:
        print(f"L{i+1}: {line.strip()}")
