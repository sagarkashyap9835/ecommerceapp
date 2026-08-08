import { COLORS } from "@/assets/constants";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { TextInput, View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AnimatedButton from "../../../components/AnimatedButton";

export default function Page() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (isSignedIn) {
            router.replace("/(tabs)");
        }
    }, [isSignedIn]);

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const onSignInPress = async () => {
        if (!isLoaded) {
            Toast.show({ type: 'error', text1: 'Not Loaded', text2: 'Auth is still loading' });
            return;
        }
        if (!emailAddress || !password) {
            Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please enter email and password' });
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, emailAddress, password);
            router.replace("/(tabs)");
        } catch (err: any) {
            console.log("Sign in error:", err.message);
            
            let errorMessage = "Something went wrong. Please try again.";
            
            if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
                errorMessage = "Invalid password.";
            } else if (err?.code === 'auth/user-not-found') {
                errorMessage = "Email doesn't exist, first sign up.";
            }

            Toast.show({
                type: 'error',
                text1: 'Sign In Failed',
                text2: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = () => {
        Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Social authentication is coming soon!' });
    }

    return (
        <View style={styles.container}>
            <Image 
                source={require('../../../assets/images/auth_bg.jpg')} 
                style={{ width: '200%', height: '100%', position: 'absolute', left: 0, opacity: 0.25 }} 
                resizeMode="cover"
            />
            
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <TouchableOpacity 
                    style={[styles.backButton, { position: 'absolute', top: 40, left: 24, zIndex: 10 }]} 
                    onPress={() => router.back()}
                >
                    <View style={styles.backButtonInner}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" style={{ marginLeft: -2 }} />
                    </View>
                </TouchableOpacity>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        
                        {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Please Sign In</Text>
                        <Text style={styles.subtitle}>Enter your account details for a personalised experience.</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        
                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Email Address" 
                                placeholderTextColor="#9CA3AF" 
                                autoCapitalize="none" 
                                keyboardType="email-address" 
                                value={emailAddress} 
                                onChangeText={setEmailAddress} 
                            />
                            {emailAddress.length > 0 && (
                                <Ionicons name="checkmark-outline" size={20} color={COLORS.primary} style={styles.rightIcon} />
                            )}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Password" 
                                placeholderTextColor="#9CA3AF" 
                                secureTextEntry={!showPassword} 
                                value={password} 
                                onChangeText={setPassword} 
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Submit Button */}
                        <AnimatedButton 
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                            onPress={onSignInPress} 
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Sign In</Text>}
                        </AnimatedButton>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or Sign in with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <AnimatedButton style={styles.socialButton} onPress={handleSocialAuth}>
                            <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
                            <Text style={styles.socialButtonText}>Sign in with Google</Text>
                        </AnimatedButton>

                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 180,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerContainer: {
        marginBottom: 20,
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 6,
        fontFamily: "Outfit_800",
    },
    subtitle: {
        fontSize: 14,
        color: "#E5E7EB",
        lineHeight: 20,
        fontFamily: "Outfit",
    },
    formContainer: {
        flex: 1,
        marginTop: 10,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 16,
        height: 48,
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#FFFFFF",
    },
    rightIcon: {
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 46,
        borderRadius: 23,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        marginTop: 10,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        fontFamily: "Outfit_700",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#D1D5DB",
        fontSize: 13,
        fontFamily: "Outfit",
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(255,255,255,0.15)",
        marginBottom: 10,
    },
    socialIcon: {
        marginRight: 10,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "Outfit_600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "auto", 
        paddingTop: 10,
    },
    footerText: {
        color: "#E5E7EB",
        fontSize: 13,
        fontFamily: "Outfit",
    },
    footerLink: {
        color: COLORS.primary,
        fontWeight: "700",
        fontSize: 13,
        fontFamily: "Outfit_700",
    }
});
