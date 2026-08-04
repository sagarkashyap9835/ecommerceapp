import paymentService, { VerifyPaymentPayload } from "./paymentService";
import Toast from "react-native-toast-message";

// Type definition for Official Razorpay Checkout Options
export interface RazorpayOfficialOptions {
  description?: string;
  image?: string;
  currency: string;
  key: string;
  amount: number; // in paise
  name: string;
  order_id: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
}

/**
 * Official Razorpay SDK Checkout Helper Service
 * Integrates react-native-razorpay native module or fallback checkout handler
 */
export const openOfficialRazorpayCheckout = async (params: {
  amount: number; // in Rupees
  token?: string;
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess: (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  onFailure?: (error: any) => void;
}) => {
  try {
    // 1. Fetch Razorpay Order from Backend
    const orderData = await paymentService.createRazorpayOrder(
      params.amount,
      params.token
    );

    if (!orderData.success || !orderData.order_id) {
      throw new Error(orderData.message || "Failed to create Razorpay Order");
    }

    const checkoutOptions: RazorpayOfficialOptions = {
      description: "Ecommerce Order Payment",
      image: "https://razorpay.com/favicon.ico",
      currency: orderData.currency || "INR",
      key: orderData.key_id,
      amount: orderData.amount, // in paise
      name: "Apna Ecommerce",
      order_id: orderData.order_id,
      prefill: {
        email: params.userInfo?.email || "customer@example.com",
        contact: params.userInfo?.phone || "9999999999",
        name: params.userInfo?.name || "Customer",
      },
      theme: { color: "#0C2340" },
    };

    // Dynamically check if react-native-razorpay native module is available
    let RazorpayCheckout: any = null;
    try {
      RazorpayCheckout = require("react-native-razorpay").default;
    } catch (e) {
      console.log(
        "react-native-razorpay native module is not installed or running in Expo Managed workflow. Using Test Modal / Web fallback."
      );
    }

    if (RazorpayCheckout && typeof RazorpayCheckout.open === "function") {
      // Execute Official Razorpay Native SDK Modal
      RazorpayCheckout.open(checkoutOptions)
        .then(async (data: any) => {
          await params.onSuccess({
            razorpay_order_id: data.razorpay_order_id || orderData.order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          });
        })
        .catch((error: any) => {
          console.error("Official Razorpay Checkout Error:", error);
          if (params.onFailure) {
            params.onFailure(error);
          } else {
            Toast.show({
              type: "error",
              text1: "Payment Cancelled",
              text2: error.description || error.message || "Payment process was cancelled.",
            });
          }
        });
      return { type: "NATIVE_SDK", orderData };
    } else {
      // Return order data for Custom Expo Test Checkout Modal
      return { type: "EXPO_MODAL", orderData };
    }
  } catch (error: any) {
    console.error("Error in openOfficialRazorpayCheckout:", error);
    Toast.show({
      type: "error",
      text1: "Razorpay Error",
      text2: error.message || "Could not open Razorpay checkout.",
    });
    throw error;
  }
};

export default openOfficialRazorpayCheckout;
