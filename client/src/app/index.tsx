import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  // Animation values
  const slideAnim = new Animated.Value(-width); // Start off-screen left
  const iconFadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Start animation: Logo slides in and fades in fast
    Animated.parallel([
      Animated.timing(iconFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // After a delay, navigate based on auth state
    const timer = setTimeout(() => {
      if (isLoaded) {
        if (isSignedIn) {
          router.replace("/(tabs)"); // Go to Home if signed in
        } else {
          router.replace("/(auth)/onboarding"); // Go to onboarding if not signed in
        }
      }
    }, 2000); // 2 seconds splash screen

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: iconFadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Animated.Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0", // Cream color
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 250, 
    height: 250,
  }
});
