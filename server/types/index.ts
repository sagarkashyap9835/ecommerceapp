import { Document, Types } from "mongoose";

export interface IAddress extends Document {
    user: Types.ObjectId;
    type: "Home" | "Work" | "Other";
    villageHouseCode?: string; // Village House / Gram Code (e.g. 1, 2, 3...)
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
    createdAt: Date;
}

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}

export interface ICart extends Document {
    user: Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    calculateTotal(): number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    saleDetails?: {
        originalPrice?: number;
        salePrice?: number;
        discountAmount?: number;
        finalItemPrice?: number;
        saleName?: string;
        discountType?: "FIRST_ORDER" | "FESTIVAL_SALE";
        firstOrderDiscount?: number;
    };
    size?: string;
    color?: string;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    orderNumber: string;
    items: IOrderItem[];
    shippingAddress: {
        villageHouseCode?: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: "cash" | "razorpay";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    paymentIntentId?: string;
    razorpayOrderId?: string;
    orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
    subtotal: number;
    shippingCost: number;
    tax: number;
    totalAmount: number;
    notes?: string;
    deliveredAt?: Date;
    estimatedDeliveryDate?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
    refundId?: string;
    refundAmount?: number;
    replacementRequest?: {
        status: "none" | "pending" | "approved" | "rejected";
        reason: string;
        requestedAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface IReview {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    image?: string;
    isVerifiedPurchase: boolean;
    createdAt?: Date;
}

export interface ICategory extends Document {
    name: string;
    subcategories: string[];
    sizes: string[];
    icon?: string;
    sortOrder?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    images: string[];
    sizes: string[];
    colors?: string[];
    category: string;
    subcategory?: string;
    stock: number;
    ratings: {
        average: number;
        count: number;
    };
    reviews: IReview[];
    isFeatured: boolean;
    isBogo: boolean;
    isLatest: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends Document {
    name: string;
    email: string;
    firebaseUid: string;
    image?: string;
    role: "user" | "admin";
    hasCompletedFirstOrder?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWishlist extends Document {
    user: Types.ObjectId;
    products: Types.ObjectId[];
    createdAt: Date;
}
