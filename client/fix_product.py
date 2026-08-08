import re

file_path = r'c:\Users\vidya\OneDrive\Desktop\ecommerceapp\client\src\app\product\[id].tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix color string literals
content = content.replace("'COLORS.primary'", 'COLORS.primary')
content = content.replace('"COLORS.primary"', 'COLORS.primary')

# Fix fontFamily backslashes
content = content.replace("\\'Outfit\\'", "'Outfit'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed file syntax errors')
