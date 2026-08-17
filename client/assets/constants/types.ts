export interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    createdAt: string;
}

export interface Review {
    _id?: string;
    user: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    image?: string;
    isVerifiedPurchase: boolean;
    createdAt?: string;
}

export interface Category {
    _id?: string;
    id?: string | number;
    name: string;
    subcategories: string[];
    sizes: string[];
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    images: string[];
    sizes?: string[];
    colors?: string[];
    category:
    | {
        _id: string;
        name: string;
    }
    | string;
    subcategory?: string;
    stock: number;
    ratings: {
        average: number;
        count: number;
    };
    reviews?: Review[];
    isFeatured: boolean;
    isBogo?: boolean;
    isLatest?: boolean;
    isActive: boolean;
    sale?: {
        isOnSale: boolean;
        saleName: string;
        saleSubtitle: string;
        originalPrice: number;
        salePrice: number;
        discountAmount: number;
        saleEndsAt: string;
        discountType?: "FIRST_ORDER" | "FESTIVAL_SALE";
    };
    createdAt: string;
}

export type ProductCardProps = {
    product: Product;
};

export interface CartItem {
    product: Product;
    quantity: number;
    size: string;
    color?: string;
}

export type CartItemProps = {
    item: { id: string; product: { name: string; price: number; images: string[] }; quantity: number; size: string; color?: string };
    onRemove?: () => void;
    onUpdateQuantity?: (newQty: number) => void;
};

export type CategoryItemProps = {
    item: { id: string | number; name: string; icon: string };
    isSelected?: boolean;
    onPress?: () => void;
};

export type HeaderProps = {
    title?: string;
    showBack?: boolean;
    showSearch?: boolean;
    showCart?: boolean;
    showMenu?: boolean;
    showLogo?: boolean;
    searchValue?: string;
    onSearchChange?: (text: string) => void;
    onFilterPress?: () => void;
    isFilterActive?: boolean;
};

export interface Address {
    _id: string;
    type: "Home" | "Work" | "Other";
    villageHouseCode?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
}

export interface OrderItem {
    product: Product | string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    size?: string;
    color?: string;
}

export interface Order {
    _id: string;
    user: User | string;
    orderNumber: string;
    items: OrderItem[];
    shippingAddress: {
        villageHouseCode?: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
    notes?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    refundId?: string;
    refundAmount?: number;
    replacementRequest?: {
        status: "none" | "pending" | "approved" | "rejected";
        reason: string;
        requestedAt: string;
    };
    createdAt: string;
}

export type WishlistContextType = {
    wishlist: Product[];
    toggleWishlist: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
};
