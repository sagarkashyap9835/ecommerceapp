import re

file_path = r'c:\Users\vidya\OneDrive\Desktop\ecommerceapp\client\src\app\product\[id].tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the currency symbol for product price
content = content.replace('${product.price.toFixed(2)}', 'Rs {product.price.toFixed(2)}')

# 2. Add Outfit font to all Text tags
content = re.sub(r'<Text>', r'<Text style={{ fontFamily: \'Outfit\' }}>', content)
content = re.sub(r'<Text(\s+[^>]*)?style={{', r'<Text\1style={{ fontFamily: \'Outfit\', ', content)
content = re.sub(r'<Text className=([^>]+)>', r'<Text className=\1 style={{ fontFamily: \'Outfit\' }}>', content)

# 3. Apply the theme color. The hardcoded color is #4a8b81
content = content.replace('#4a8b81', 'COLORS.primary')
content = content.replace("'#4a8b81'", 'COLORS.primary')
content = content.replace('"#4a8b81"', 'COLORS.primary')

# Same for #72c4bb (light teal)
content = content.replace('#72c4bb', 'COLORS.primary')
content = content.replace("'#72c4bb'", 'COLORS.primary')
content = content.replace('"#72c4bb"', 'COLORS.primary')

# 4. Change Buy Now button to open checkout
content = re.sub(
    r'<TouchableOpacity\s*(style={{[^}]*Buy Now)',
    r'<TouchableOpacity \n              onPress={() => router.push(\'/checkout\')}\n              \1',
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied successfully")
