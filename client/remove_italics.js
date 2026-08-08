const fs = require('fs');

// 1. Remove italics from DeliveryEstimateCard
const deliveryPath = 'C:\\\\Users\\\\vidya\\\\OneDrive\\\\Desktop\\\\ecommerceapp\\\\client\\\\components\\\\DeliveryEstimateCard.tsx';
let deliveryContent = fs.readFileSync(deliveryPath, 'utf8');
deliveryContent = deliveryContent.replace(/fontStyle:\s*["']italic["'],?/g, '');
fs.writeFileSync(deliveryPath, deliveryContent, 'utf8');
console.log('Removed italic from DeliveryEstimateCard');

// 2. Update Reviews section to match screenshot
const productIdPath = 'C:\\\\Users\\\\vidya\\\\OneDrive\\\\Desktop\\\\ecommerceapp\\\\client\\\\src\\\\app\\\\product\\\\[id].tsx';
let productContent = fs.readFileSync(productIdPath, 'utf8');

// The screenshot shows:
// - Customer Reviews header: Yellow Star + "Customer Reviews", right side: Yellow Star + "0.0 (0 reviews)"
// - Write a Review box: Light blue border. 
// - Title row: chat bubble icon inside blue circle, "Write a Review", subtitle.
// - Star rating: badge "5 / 5 Stars".
// - Input: has a pencil icon inside.
// - Button: "Submit Review" with paper plane icon. Blue background.

const stylesReplacements = {
    'backgroundColor: "#F0F9FF"': 'backgroundColor: "#F4FAFF"', // reviewFormCard bg
    'borderColor: "#BAE6FD"': 'borderColor: "#BDE0FE"', // border
    'color: "#0F172A", fontFamily: "Roboto"': 'color: "#000000", fontFamily: "Roboto"', // Title
    'color: "#475569", fontFamily: "Roboto"': 'color: "#475569", fontFamily: "Roboto"', // Subtitle
    'backgroundColor: "#F8FAFC",\\n    borderWidth: 1,\\n    borderColor: "#BAE6FD"': 'backgroundColor: "#FFFFFF",\n    borderWidth: 1,\n    borderColor: "#BDE0FE",\n    flexDirection: "row",\n    alignItems: "flex-start",\n    padding: 10',
    'backgroundColor: "#0284C7",\\n    borderRadius: 10,\\n    paddingVertical: 12,\\n    alignItems: "center"': 'backgroundColor: "#2563EB",\n    borderRadius: 10,\n    paddingVertical: 12,\n    flexDirection: "row",\n    justifyContent: "center",\n    alignItems: "center"', // submit btn
};

// Also we need to inject the icons and modify JSX
// Let's do a targeted string replacement for the Reviews Header
const oldReviewHeader = `            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Roboto', fontSize: 18, fontWeight: "700", color: "#0F172A" }}>
                Customer Reviews
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ fontFamily: 'Roboto', fontSize: 15, fontWeight: "700", color: "#0F172A", marginLeft: 4 }}>
                  {averageRatingStr}
                </Text>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: "#475569", marginLeft: 4 }}>
                  ({reviewCount} reviews)
                </Text>
              </View>
            </View>`;

const newReviewHeader = `            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={20} color="#FBBF24" />
                <Text style={{ fontFamily: 'Roboto', fontSize: 18, fontWeight: "800", color: "#111827", marginLeft: 8, fontStyle: 'italic' }}>
                  Customer Reviews
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ fontFamily: 'Roboto', fontSize: 15, fontWeight: "800", color: "#111827", marginLeft: 4, fontStyle: 'italic' }}>
                  {averageRatingStr}
                </Text>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, color: "#6B7280", marginLeft: 4, fontStyle: 'italic' }}>
                  ({reviewCount} reviews)
                </Text>
              </View>
            </View>`;

productContent = productContent.replace(oldReviewHeader, newReviewHeader);

// Wait, the user said NO ITALIC text ("ye inclined text nhi chaiye"). 
// Ah, my bad, I added fontStyle: 'italic' in the replacement. Let me fix it immediately.
productContent = productContent.replace(/fontStyle: 'italic'/g, '');
productContent = productContent.replace(/fontStyle: "italic"/g, '');

// Write a Review UI
const oldWriteReview = `<Text style={styles.reviewFormTitle}>Write a Review</Text>
                <Text style={styles.reviewFormSubtitle}>Share your real experience with this product</Text>`;
const newWriteReview = `<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginRight: 10 }}>
                    <Ionicons name="chatbubble-outline" size={20} color="#1E3A8A" />
                  </View>
                  <View>
                    <Text style={[styles.reviewFormTitle, { fontStyle: 'normal' }]}>Write a Review</Text>
                    <Text style={[styles.reviewFormSubtitle, { fontStyle: 'normal' }]}>Share your real experience with this product</Text>
                  </View>
                </View>`;
productContent = productContent.replace(oldWriteReview, newWriteReview);

const oldRating = `<Text style={styles.ratingTextLabel}>{rating} / 5 Stars</Text>`;
const newRating = `<View style={{ backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 12 }}>
                    <Text style={{ fontFamily: 'Roboto', fontSize: 12, fontWeight: '700', color: '#1E3A8A' }}>{rating} / 5 Stars</Text>
                  </View>`;
productContent = productContent.replace(oldRating, newRating);

const oldInput = `<TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review here (e.g. quality, fit, comfort)..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                />`;
const newInput = `<View style={styles.reviewInput}>
                  <Ionicons name="pencil" size={16} color="#94A3B8" style={{ marginTop: 4, marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontFamily: 'Roboto', fontSize: 13, color: '#111827', textAlignVertical: 'top' }}
                    placeholder="Write your review here (e.g. quality, fit, comfort)..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                  />
                </View>`;
productContent = productContent.replace(oldInput, newInput);

const oldSubmit = `<Text style={styles.submitReviewBtnText}>Submit Verified Review</Text>`;
const newSubmit = `<Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.submitReviewBtnText}>Submit Review</Text>`;
productContent = productContent.replace(oldSubmit, newSubmit);

// Apply styles
const stylesStart = productContent.indexOf('const styles = StyleSheet.create({');
if (stylesStart !== -1) {
    let topStyles = productContent.substring(0, stylesStart);
    let styleBlock = productContent.substring(stylesStart);
    for (let key in stylesReplacements) {
        styleBlock = styleBlock.replace(new RegExp(key.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&'), 'g'), stylesReplacements[key]);
    }
    productContent = topStyles + styleBlock;
}

fs.writeFileSync(productIdPath, productContent, 'utf8');
console.log('Updated reviews UI and removed italics');
