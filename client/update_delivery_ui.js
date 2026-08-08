const fs = require('fs');
const filePath = 'C:\\\\Users\\\\vidya\\\\OneDrive\\\\Desktop\\\\ecommerceapp\\\\client\\\\components\\\\DeliveryEstimateCard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace green theme colors with blue theme colors
content = content.replace(/#059669/g, '#0284C7'); 
content = content.replace(/#ECFDF5/g, '#E0F2FE'); 
content = content.replace(/#A7F3D0/g, '#BAE6FD'); 
content = content.replace(/#047857/g, '#0369A1'); 
content = content.replace(/#065F46/g, '#075985'); 
content = content.replace(/#10B981/g, '#0EA5E9'); 

// Add fontFamily: 'Roboto' to text styles
content = content.replace(/fontSize: (\d+),/g, 'fontFamily: "Roboto",\n    fontSize: $1,');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated DeliveryEstimateCard styling');
