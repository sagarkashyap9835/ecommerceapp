import api from "../constants/api";

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  message?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  mongoOrderId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  order?: any;
}

/**
 * Payment Service for handling Razorpay operations
 */
export const paymentService = {
  /**
   * Create Razorpay Order on Backend
   * @param amount Amount in INR (Rupees)
   * @param authToken Optional JWT auth token
   */
  async createRazorpayOrder(
    amount: number,
    authToken?: string
  ): Promise<CreateOrderResponse> {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await api.post<CreateOrderResponse>(
        "/payment/create-order",
        { amount },
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error("PaymentService createRazorpayOrder error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Network error: Failed to initialize Razorpay order.";
      throw new Error(message);
    }
  },

  /**
   * Verify Razorpay Payment Signature on Backend
   * @param payload Razorpay order_id, payment_id, signature, and optional mongoOrderId
   * @param authToken Optional JWT auth token
   */
  async verifyPaymentSignature(
    payload: VerifyPaymentPayload,
    authToken?: string
  ): Promise<VerifyPaymentResponse> {
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const response = await api.post<VerifyPaymentResponse>(
        "/payment/verify",
        payload,
        { headers }
      );
      return response.data;
    } catch (error: any) {
      console.error("PaymentService verifyPaymentSignature error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Network error: Payment signature verification failed.";
      throw new Error(message);
    }
  },
};

export default paymentService;
