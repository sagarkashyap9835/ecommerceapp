export const COLORS = {
    primary: "#FF3399",
    secondary: "#2563EB",
    background: "#FFFFFF",
    surface: "#FDF2F8",
    accent: "#DB2777",
    brandCyan: "#0284C7",
    border: "#FBCFE8",
    error: "#EF4444",
};


export const CATEGORIES = [
    { id: 1, name: "Men", icon: "man-outline" },
    { id: 2, name: "Women", icon: "woman-outline" },
    { id: 3, name: "Kids", icon: "happy-outline" },
    { id: 4, name: "Shoes", icon: "footsteps-outline" },
    { id: 5, name: "Bag", icon: "briefcase-outline" },
    { id: 6, name: "Other", icon: "grid-outline" },
];

export const PROFILE_MENU = [
    { id: 1, title: "My Orders", icon: "receipt-outline", route: "/orders" },
    { id: 2, title: "Shipping Addresses", icon: "location-outline", route: "/addresses" },
    { id: 4, title: "My Reviews", icon: "star-outline", route: "/reviews" },
    { id: 5, title: "Settings", icon: "settings-outline", route: "/settings" },
];

export const getStatusColor = (status: string) => {
    switch (status) {
        case "placed":
            return "bg-yellow-50 text-yellow-900";
        case "processing":
            return "bg-indigo-50 text-indigo-900";
        case "shipped":
            return "bg-purple-50 text-purple-900";
        case "delivered":
            return "bg-green-50 text-green-900";
        case "cancelled":
            return "bg-red-50 text-red-900";
        default:
            return "bg-gray-50 text-gray-900";
    }
};
