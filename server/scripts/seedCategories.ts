import Category from "../models/category.js";

export const DEFAULT_CATEGORIES = [
  {
    name: "Shirt",
    icon: "shirt-outline",
    sortOrder: 1,
    subcategories: [
      "Plain Shirt",
      "Checked Shirt",
      "Printed Shirt",
      "Striped Shirt",
      "Denim Shirt",
      "Linen Shirt",
      "Cotton Shirt",
      "Formal Shirt",
      "Casual Shirt",
      "Half Sleeve Shirt",
      "Full Sleeve Shirt",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    name: "T-Shirt",
    icon: "shirt-outline",
    sortOrder: 2,
    subcategories: [
      "Graphic T-Shirt",
      "Polo T-Shirt",
      "Oversized T-Shirt",
      "Plain T-Shirt",
      "Striped T-Shirt",
      "Full Sleeve T-Shirt",
      "Half Sleeve T-Shirt",
      "V-Neck T-Shirt",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    name: "Jeans",
    icon: "fitness-outline",
    sortOrder: 3,
    subcategories: [
      "Cargo Jeans",
      "Baggy Jeans",
      "Straight Fit Jeans",
      "Slim Fit Jeans",
      "Regular Fit Jeans",
      "Relaxed Fit Jeans",
      "Skinny Jeans",
      "Bootcut Jeans",
    ],
    sizes: ["26", "28", "30", "32", "34", "36", "38", "40", "42"],
  },
  {
    name: "Pant",
    icon: "walk-outline",
    sortOrder: 4,
    subcategories: [
      "Chinos",
      "Formal Trousers",
      "Cargo Pants",
      "Joggers",
      "Track Pants",
    ],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
  },
  {
    name: "Lower",
    icon: "body-outline",
    sortOrder: 5,
    subcategories: ["Track Pants", "Pyjamas", "Shorts", "Sweatpants"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Shorts",
    icon: "cut-outline",
    sortOrder: 6,
    subcategories: [
      "Casual Shorts",
      "Denim Shorts",
      "Sports Shorts",
      "Cargo Shorts",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Kurta",
    icon: "woman-outline",
    sortOrder: 7,
    subcategories: [
      "Short Kurta",
      "Long Kurta",
      "Designer Kurta",
      "Anarkali Kurta",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    name: "Jacket",
    icon: "cloud-outline",
    sortOrder: 8,
    subcategories: [
      "Denim Jacket",
      "Leather Jacket",
      "Bomber Jacket",
      "Puffer Jacket",
      "Blazer",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    name: "Saree",
    icon: "woman-outline",
    sortOrder: 9,
    subcategories: [
      "Cotton Saree",
      "Silk Saree",
      "Banarasi Saree",
      "Chiffon Saree",
      "Georgette Saree",
      "Party Wear Saree",
    ],
    sizes: ["Free Size"],
  },
  {
    name: "Kurti",
    icon: "woman-outline",
    sortOrder: 10,
    subcategories: [
      "Straight Kurti",
      "A-Line Kurti",
      "Flared Kurti",
      "Short Kurti",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  },
  {
    name: "Leggings",
    icon: "body-outline",
    sortOrder: 11,
    subcategories: ["Ankle Length", "Churidar", "Printed Leggings"],
    sizes: ["Free Size", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Suit",
    icon: "briefcase-outline",
    sortOrder: 12,
    subcategories: ["Salwar Suit", "Anarkali Suit", "Punjabi Suit"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Nighty",
    icon: "bed-outline",
    sortOrder: 13,
    subcategories: ["Cotton Nighty", "Satin Nighty", "Nightdress"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    name: "Blouse",
    icon: "sparkles-outline",
    sortOrder: 14,
    subcategories: ["Padded Blouse", "Readymade Blouse", "Designer Blouse"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
  },
  {
    name: "Dupatta",
    icon: "ribbon-outline",
    sortOrder: 15,
    subcategories: ["Silk Dupatta", "Cotton Dupatta", "Net Dupatta"],
    sizes: ["Free Size"],
  },
  {
    name: "Baby Dress",
    icon: "happy-outline",
    sortOrder: 16,
    subcategories: ["Romper", "Onesie", "Party Dress"],
    sizes: [
      "0–6 Months",
      "6–12 Months",
      "1–2 Years",
      "2–3 Years",
      "3–4 Years",
      "4–5 Years",
    ],
  },
  {
    name: "Boys Dress",
    icon: "man-outline",
    sortOrder: 17,
    subcategories: [
      "Shirt & Pants Set",
      "Kurta Pajama",
      "Suit Set",
      "T-Shirt & Shorts",
    ],
    sizes: [
      "2–3 Years",
      "3–4 Years",
      "4–5 Years",
      "5–6 Years",
      "6–7 Years",
      "7–8 Years",
      "8–9 Years",
      "9–10 Years",
      "10–11 Years",
      "11–12 Years",
      "13–14 Years",
      "15–16 Years",
    ],
  },
  {
    name: "Girls Dress",
    icon: "woman-outline",
    sortOrder: 18,
    subcategories: ["Frock", "Gown", "Lehenga Choli", "Top & Skirt"],
    sizes: [
      "2–3 Years",
      "3–4 Years",
      "4–5 Years",
      "5–6 Years",
      "6–7 Years",
      "7–8 Years",
      "8–9 Years",
      "9–10 Years",
      "10–11 Years",
      "11–12 Years",
      "13–14 Years",
      "15–16 Years",
    ],
  },
  {
    name: "School Uniform",
    icon: "school-outline",
    sortOrder: 19,
    subcategories: ["Shirt", "Shorts", "Trousers", "Skirt", "Blazer"],
    sizes: [
      "20",
      "22",
      "24",
      "26",
      "28",
      "30",
      "32",
      "34",
      "36",
      "38",
      "40",
      "42",
    ],
  },
  {
    name: "Chappal",
    icon: "footsteps-outline",
    sortOrder: 20,
    subcategories: [
      "Flat Chappal",
      "Fancy Chappal",
      "Daily Wear Chappal",
    ],
    sizes: ["4", "5", "6", "7", "8", "9"],
  },
  {
    name: "Sandal",
    icon: "footsteps-outline",
    sortOrder: 21,
    subcategories: [
      "Heeled Sandal",
      "Flat Sandal",
      "Gladiator Sandal",
    ],
    sizes: ["4", "5", "6", "7", "8", "9"],
  },
  {
    name: "Shoes",
    icon: "footsteps-outline",
    sortOrder: 22,
    subcategories: [
      "Sneakers",
      "Running Shoes",
      "Formal Shoes",
      "Casual Shoes",
    ],
    sizes: ["6", "7", "8", "9", "10", "11"],
  },
  {
    name: "Slippers",
    icon: "footsteps-outline",
    sortOrder: 23,
    subcategories: [
      "Flip Flops",
      "Bedroom Slippers",
      "Ortho Slippers",
    ],
    sizes: ["4", "5", "6", "7", "8", "9"],
  },
];

export const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("Seeding default categories, subcategories, and sizes...");
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log("Default categories seeded successfully!");
    } else {
      // Ensure missing default categories get added if not existing
      for (const cat of DEFAULT_CATEGORIES) {
        const exists = await Category.findOne({ name: cat.name });
        if (!exists) {
          await Category.create(cat);
          console.log(`Seeded missing category: ${cat.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};
