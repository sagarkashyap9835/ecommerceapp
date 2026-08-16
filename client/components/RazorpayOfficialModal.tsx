import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Helper to load official Razorpay checkout.js script on Web browser
const loadRazorpayScriptWeb = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Safely load react-native-webview on native mobile platforms only
let WebView: any = null;
if (Platform.OS !== "web") {
  try {
    WebView = require("react-native-webview").WebView;
  } catch (e) {
    WebView = null;
  }
}

interface RazorpayOfficialModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  keyId: string;
  amount: number; // in Rupees
  currency?: string;
  onSuccess: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: { code: string; description: string }) => void;
}

export const RazorpayOfficialModal: React.FC<RazorpayOfficialModalProps> = ({
  visible,
  onClose,
  orderId,
  keyId,
  amount,
  currency = "INR",
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);
  const [hideWebview, setHideWebview] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"card" | "upi" | "netbanking">("card");

  const amountInPaisa = Math.round(amount * 100);

  // Official Web Browser Razorpay Checkout Launcher for localhost / web platform
  useEffect(() => {
    if (visible && Platform.OS === "web") {
      let isMounted = true;
      loadRazorpayScriptWeb().then((loaded) => {
        if (!isMounted) return;
        if (loaded && (window as any).Razorpay) {
          try {
            const rzp = new (window as any).Razorpay({
              key: keyId,
              amount: amountInPaisa,
              currency: currency,
              name: "Gramo Kart",
              description: "Order Payment",
              order_id: orderId,
              handler: function (response: any) {
                onSuccess({
                  razorpay_order_id: response.razorpay_order_id || orderId,
                  razorpay_payment_id: response.razorpay_payment_id || "pay_test_" + Date.now(),
                  razorpay_signature: response.razorpay_signature || "test_signature_valid",
                });
              },
              modal: {
                ondismiss: function () {
                  onClose();
                },
              },
              prefill: {
                name: "Customer",
                email: "customer@example.com",
                contact: "9999999999",
              },
              theme: { color: "#0C2340" },
            });

            rzp.on("payment.failed", function (response: any) {
              onFailure({
                code: response.error?.code || "PAYMENT_FAILED",
                description: response.error?.description || "Payment failed on Razorpay Gateway",
              });
            });

            rzp.open();
          } catch (err: any) {
            console.error("Error opening Razorpay Web Checkout:", err);
          }
        }
      });

      return () => {
        isMounted = false;
      };
    }
  }, [visible, orderId, keyId, amount]);

  if (!visible) return null;

  // On Web platform, official Razorpay JS opens its own pop-up overlay
  if (Platform.OS === "web") {
    return null;
  }

  const razorpayHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: transparent;">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        var options = {
          key: "${keyId}",
          amount: ${amountInPaisa},
          currency: "${currency}",
          name: "Gramo Kart",
          description: "Order Payment",
          order_id: "${orderId}",
          order_id: "${orderId}",
          callback_url: "https://postman-echo.com/post",
          redirect: true,
          modal: {
            ondismiss: function () {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'CANCELLED'
                }));
              }
            }
          },
          prefill: {
            name: "Customer",
            email: "customer@example.com",
            contact: "9999999999"
          },
          theme: { color: "#0C2340" }
        };

        var rzp = new Razorpay(options);

        rzp.on('payment.failed', function (response) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              status: 'FAILED',
              code: response.error.code,
              description: response.error.description
            }));
          }
        });

        window.onload = function() {
          rzp.open();
        };
      </script>
    </body>
    </html>
  `;

  // Handlers for Mobile UI Container
  const handleSimulateSuccess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        razorpay_order_id: orderId,
        razorpay_payment_id: "pay_test_" + Date.now(),
        razorpay_signature: "test_signature_valid",
      });
    }, 600);
  };

  const handleSimulateFailed = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onFailure({
        code: "PAYMENT_FAILED",
        description: "Payment failed / declined by customer in Razorpay Test Gateway.",
      });
    }, 600);
  };

  const injectedJS = `
    (function() {
      if (window.location.href.indexOf('postman-echo.com/post') !== -1) {
        var interval = setInterval(function() {
          try {
            var text = document.body.innerText;
            if (text) {
              var json = JSON.parse(text);
              if (json && json.form && json.form.razorpay_payment_id) {
                clearInterval(interval);
                var obj = {
                  status: 'SUCCESS',
                  razorpay_payment_id: json.form.razorpay_payment_id,
                  razorpay_order_id: json.form.razorpay_order_id,
                  razorpay_signature: json.form.razorpay_signature
                };
                window.ReactNativeWebView.postMessage(JSON.stringify(obj));
              }
            }
          } catch(e) {}
        }, 500);
      }
    })();
    true;
  `;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, WebView && { padding: 0, backgroundColor: "transparent" }]}>
        <View style={WebView ? { flex: 1, width: "100%", backgroundColor: "transparent" } : styles.container}>
          {/* Header */}
          {!WebView && (
            <View style={styles.header}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.razorpayBadge}>
                  <Text style={styles.razorpayBadgeText}>Razorpay</Text>
                </View>
                <Text style={styles.headerTitle}>Official Test Gateway</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {WebView ? (
            <View style={{ flex: 1, backgroundColor: "transparent" }}>
              {hideWebview && (
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", zIndex: 10 }}>
                  <ActivityIndicator size="large" color="#0284C7" />
                  <Text style={{ marginTop: 10, color: "#64748b", fontWeight: "600" }}>Verifying Payment...</Text>
                </View>
              )}
              <WebView
                style={[{ flex: 1, backgroundColor: "transparent" }, hideWebview && { opacity: 0 }]}
                originWhitelist={["*"]}
                source={{ html: razorpayHtml, baseUrl: "https://localhost" }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode="always"
                thirdPartyCookiesEnabled={true}
                sharedCookiesEnabled={true}
                userAgent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36"
                onNavigationStateChange={(navState: any) => {
                  if (navState.url.includes("postman-echo.com")) {
                    setHideWebview(true);
                  }
                }}
                injectedJavaScript={injectedJS}
                onMessage={(event: any) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.status === "FAILED") {
                      onFailure({
                        code: data.code || "PAYMENT_FAILED",
                        description: data.description || "Payment failed",
                      });
                    } else if (data.status === "CANCELLED") {
                      onClose();
                    } else if (data.status === "SUCCESS") {
                      onSuccess({
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_signature: data.razorpay_signature,
                      });
                    }
                  } catch (err) {
                    console.error("WebView message error:", err);
                  }
                }}
              />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              {/* Order Info */}
              <View style={styles.orderSummaryBox}>
                <Text style={styles.merchantName}>Apna Store</Text>
                <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Total Payable</Text>
                  <Text style={styles.amountText}>₹{amount.toFixed(2)}</Text>
                </View>
              </View>

              {/* Status Banner */}
              <View style={styles.testInfoBanner}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#0284C7" />
                <Text style={styles.testInfoText}>
                  Standard Razorpay Gateway Test Interface
                </Text>
              </View>

              {/* Method Selector Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tab, selectedMethod === "card" && styles.activeTab]}
                  onPress={() => setSelectedMethod("card")}
                >
                  <Text style={[styles.tabText, selectedMethod === "card" && styles.activeTabText]}>
                    Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, selectedMethod === "upi" && styles.activeTab]}
                  onPress={() => setSelectedMethod("upi")}
                >
                  <Text style={[styles.tabText, selectedMethod === "upi" && styles.activeTabText]}>
                    UPI
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, selectedMethod === "netbanking" && styles.activeTab]}
                  onPress={() => setSelectedMethod("netbanking")}
                >
                  <Text style={[styles.tabText, selectedMethod === "netbanking" && styles.activeTabText]}>
                    NetBanking
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons: Standard Success & Failed */}
              <View style={{ marginTop: 20 }}>
                {loading ? (
                  <ActivityIndicator size="large" color="#0C2340" style={{ marginVertical: 20 }} />
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.successBtn]}
                      onPress={handleSimulateSuccess}
                    >
                      <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.actionBtnText}>SUCCESS (Simulate Paid)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.failedBtn]}
                      onPress={handleSimulateFailed}
                    >
                      <Ionicons name="close-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.actionBtnText}>FAILED (Simulate Failure)</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(12, 35, 64, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0C2340",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  razorpayBadge: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  razorpayBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  closeBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 6,
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
  orderSummaryBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0C2340",
  },
  orderIdText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  amountContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  amountText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0C2340",
    marginTop: 2,
  },
  testInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  testInfoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369A1",
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#0C2340",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  successBtn: {
    backgroundColor: "#10B981",
  },
  failedBtn: {
    backgroundColor: "#EF4444",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default RazorpayOfficialModal;
