import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/assets/constants";
import AnimatedButton from "../../../components/AnimatedButton";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1470&auto=format&fit=crop",
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Card Section */}
      <View style={styles.cardContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.indicator} />
          
          <Text style={styles.title}>Welcome to GRAMO KART</Text>
          <Text style={styles.description}>
            Get exclusive limited apparel that only you have! Made by famous brands in the world.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            style={styles.signInButton}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </AnimatedButton>

          <AnimatedButton
            style={styles.getStartedButton}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </AnimatedButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F5F0", // Light beige from mockup
  },
  imageContainer: {
    flex: 1.5,
    width: "100%",
    backgroundColor: "#000000", // Black background
  },
  heroImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5, // Lower opacity to make it darker
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    alignItems: "flex-start",
    marginTop: -30, 
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
  },
  contentWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#282c3f",
    marginBottom: 8,
    textAlign: "left",
    letterSpacing: 0.5,
    fontFamily: "Outfit_700",
  },
  description: {
    fontSize: 13,
    color: "#535766",
    textAlign: "left",
    lineHeight: 22,
    marginBottom: 24,
    fontWeight: "400",
    fontFamily: "Outfit",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
    marginTop: 24,
  },
  signInButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  signInText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
  getStartedButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Outfit_700",
  },
});
