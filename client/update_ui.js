const fs = require('fs');
const filePath = 'C:\\\\Users\\\\vidya\\\\OneDrive\\\\Desktop\\\\ecommerceapp\\\\client\\\\src\\\\app\\\\product\\\\[id].tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update BOGO Banner
const bogoOld = `          {/* BUY 1 GET 1 OFFER BANNER */}
          {product.isBogo && (
            <View style={{
              marginTop: 10,
              backgroundColor: "#ECFDF5",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#A7F3D0",
              marginBottom: 10,
            }}>
              <Text style={{ fontFamily: 'Outfit',  fontSize: 18, marginRight: 10 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Outfit',  fontSize: 13, fontWeight: "800", color: "#065F46" }}>
                  BUY 1 GET 1 FREE OFFER
                </Text>
                <Text style={{ fontFamily: 'Outfit',  fontSize: 11, color: "#047857", marginTop: 1 }}>
                  Special Offer: Purchase 1 unit & get 1 free with your order!
                </Text>
              </View>
            </View>
          )}`;
const bogoNew = `          {/* BUY 1 GET 1 OFFER BANNER */}
          {product.isBogo && (
            <View style={{
              marginTop: 10,
              backgroundColor: "#E0F2FE",
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#BAE6FD",
              marginBottom: 10,
            }}>
              <Text style={{ fontFamily: 'Roboto', fontSize: 18, marginRight: 10 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Roboto', fontSize: 13, fontWeight: "800", color: "#0369A1" }}>
                  BUY 1 GET 1 FREE OFFER
                </Text>
                <Text style={{ fontFamily: 'Roboto', fontSize: 11, color: "#0284C7", marginTop: 1 }}>
                  Special Offer: Purchase 1 unit & get 1 free with your order!
                </Text>
              </View>
            </View>
          )}`;
content = content.replace(bogoOld, bogoNew);

// 2. Update Reviews Section Header
const reviewsHeadOld = `          {/* CUSTOMER REVIEWS & RATINGS SECTION */}
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#F3F4F6" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Outfit',  fontSize: 18, fontWeight: "700", color: "#111827" }}>
                Customer Reviews
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={{ fontFamily: 'Outfit',  fontSize: 15, fontWeight: "700", color: "#111827", marginLeft: 4 }}>
                  {averageRatingStr}
                </Text>
                <Text style={{ fontFamily: 'Outfit',  fontSize: 13, color: "#6B7280", marginLeft: 4 }}>
                  ({reviewCount} reviews)
                </Text>
              </View>
            </View>`;
const reviewsHeadNew = `          {/* CUSTOMER REVIEWS & RATINGS SECTION */}
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#E0F2FE" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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
content = content.replace(reviewsHeadOld, reviewsHeadNew);

// 3. Replace 'Outfit' with 'Roboto' in the rest of the bottom section
const splitIndex = content.indexOf('Customer Reviews');
if (splitIndex !== -1) {
    let topPart = content.substring(0, splitIndex);
    let bottomPart = content.substring(splitIndex);
    bottomPart = bottomPart.replace(/'Outfit'/g, "'Roboto'");
    content = topPart + bottomPart;
}

// 4. Update the styles to apply Roboto font and blue theme colors
content = content.replace(/color="#059669" style={{ marginBottom: 6 }}/g, 'color="#0284C7" style={{ marginBottom: 6 }}');
content = content.replace(/color="#059669" \/>/g, 'color="#0284C7" />'); // Verified purchase checkmark
content = content.replace(/color: "#059669", marginLeft: 10/g, 'color: "#0284C7", marginLeft: 10');

const stylesReplacements = {
    'backgroundColor: "#F9FAFB"': 'backgroundColor: "#F0F9FF"', // reviewFormCard
    'borderColor: "#E5E7EB"': 'borderColor: "#BAE6FD"',
    'color: "#111827"': 'color: "#0F172A", fontFamily: "Roboto"', // Title, Reviewer name
    'color: "#6B7280"': 'color: "#475569", fontFamily: "Roboto"', // Subtitle
    'color: "#374151"': 'color: "#334155", fontFamily: "Roboto"', // rating label, review text
    'borderColor: "#D1D5DB"': 'borderColor: "#BAE6FD"', // input border
    'backgroundColor: "#FFFFFF",\n    borderWidth: 1,\n    borderColor: "#D1D5DB"': 'backgroundColor: "#F8FAFC",\n    borderWidth: 1,\n    borderColor: "#BAE6FD"',
    'borderColor: "#9CA3AF"': 'borderColor: "#7DD3FC"', // upload btn
    'backgroundColor: "#111827",\n    borderRadius: 10,\n    paddingVertical: 12,\n    alignItems: "center"': 'backgroundColor: "#0284C7",\n    borderRadius: 10,\n    paddingVertical: 12,\n    alignItems: "center"', // submit btn
    'fontWeight: "600",\n    fontSize: 14': 'fontWeight: "600",\n    fontSize: 14,\n    fontFamily: "Roboto"',
    'backgroundColor: "#ECFDF5"': 'backgroundColor: "#F0F9FF"', // verifiedNoticeCard
    'borderColor: "#A7F3D0"': 'borderColor: "#BAE6FD"',
    'color: "#065F46"': 'color: "#0369A1", fontFamily: "Roboto"', // Notice Title
    'color: "#047857"': 'color: "#0284C7", fontFamily: "Roboto"', // Notice Text
    'backgroundColor: "#FFFFFF",\n    borderRadius: 12,\n    padding: 14,\n    borderWidth: 1,\n    borderColor: "#F3F4F6"': 'backgroundColor: "#F8FAFC",\n    borderRadius: 12,\n    padding: 14,\n    borderWidth: 1,\n    borderColor: "#E2E8F0"', // reviewItemCard
    'backgroundColor: "#111827",\n    justifyContent: "center",\n    alignItems: "center"': 'backgroundColor: "#0284C7",\n    justifyContent: "center",\n    alignItems: "center"', // avatarCircle
    'color: "#059669",\n    fontWeight: "600"': 'color: "#0284C7",\n    fontWeight: "600",\n    fontFamily: "Roboto"', // verified badge text
    'backgroundColor: "rgba(17, 24, 39, 0.75)"': 'backgroundColor: "rgba(2, 132, 199, 0.85)"', // photo tag badge
    'color: "#9CA3AF",\n    marginTop: 6': 'color: "#94A3B8",\n    marginTop: 6,\n    fontFamily: "Roboto"', // reviewDateText
};

const stylesStart = content.indexOf('const styles = StyleSheet.create({');
if (stylesStart !== -1) {
    let topStyles = content.substring(0, stylesStart);
    let styleBlock = content.substring(stylesStart);
    for (let key in stylesReplacements) {
        styleBlock = styleBlock.replace(new RegExp(key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), stylesReplacements[key]);
    }
    content = topStyles + styleBlock;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated product page styling');
