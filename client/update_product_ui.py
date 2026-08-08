import re

file_path = r'c:\Users\vidya\OneDrive\Desktop\ecommerceapp\client\src\app\product\[id].tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add selectedColor state
state_match = 'const [selectedSize, setSelectedSize] = useState<string | null>(null);'
new_state = state_match + '\n  const [selectedColor, setSelectedColor] = useState<string | null>(null);'
content = content.replace(state_match, new_state)

# Add Choose Color UI back
choose_color_ui = '''
          {/* CHOOSE COLOR */}
          {product.colors && product.colors.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: 'Outfit',  fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Choose Color</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {product.colors.map((colorOption, idx) => {
                  const isSelected = selectedColor === colorOption;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedColor(colorOption)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: colorOption,
                        marginRight: 12,
                        marginBottom: 10,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected ? COLORS.primary : '#D1D5DB'
                      }}
                    />
                  )
                })}
              </View>
            </View>
          )}
'''

content = re.sub(
    r'({\s*/\*\s*CHOOSE SIZE\s*\*/\s*.*?)(\s*{\s*/\*\s*ACTION BUTTONS\s*\*/\s*})',
    lambda m: m.group(1) + choose_color_ui + m.group(2),
    content,
    flags=re.DOTALL
)

# Update validations in Add to Bag and Buy Now
validation_to_add = '''if (product.colors && product.colors.length > 0 && !selectedColor) {
                   Toast.show({ type: "info", text1: "Select Color", text2: "Please select a color first." });
                   return;
                 }
                 '''

content = content.replace(
    'if (product.sizes && product.sizes.length > 0 && !selectedSize) {',
    validation_to_add + 'if (product.sizes && product.sizes.length > 0 && !selectedSize) {'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Product Details page with dynamic color selector')
