import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/assets/constants";
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUpScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // If already signed in, go home
    if (isSignedIn) {
        router.replace("/(tabs)");
    }

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        if (!emailAddress || !password || !username) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields'
            });
            return;
        }

        if (password.length < 8) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Password',
                text2: 'Password must be at least 8 characters'
            });
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password);
            
            // Update profile with name
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: username.trim()
                });
            }

            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'Welcome to GRAMO KART!'
            });
            router.replace("/(tabs)");
        } catch (err: any) {
            console.log("Sign up error:", err.message);
            Toast.show({
                type: 'error',
                text1: 'Failed to Sign Up',
                text2: "Something went wrong. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = () => {
        Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Social authentication is coming soon!' });
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <View style={styles.backButtonInner}>
                                <Ionicons name="chevron-back" size={24} color="#111827" style={{ marginLeft: -2 }} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.title}>Let's Get Started</Text>
                        <Text style={styles.subtitle}>Create an account to continue.</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        
                        {/* Username */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Username" 
                                placeholderTextColor="#9CA3AF" 
                                value={username} 
                                onChangeText={setUsername} 
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Email" 
                                placeholderTextColor="#9CA3AF" 
                                autoCapitalize="none" 
                                keyboardType="email-address" 
                                value={emailAddress} 
                                onChangeText={setEmailAddress} 
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Password (at least 8 characters)" 
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
                        <TouchableOpacity 
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                            onPress={onSignUpPress} 
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Continue</Text>}
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <TouchableOpacity style={styles.socialButton} onPress={handleSocialAuth}>
                            <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F5F0",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 10,
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
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 6,
        fontFamily: "Outfit_800",
    },
    subtitle: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 18,
        fontFamily: "Outfit",
    },
    formContainer: {
        flex: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        height: 44,
        marginBottom: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 13,
        color: "#111827",
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
        marginBottom: 16,
        marginTop: 4,
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
        backgroundColor: "#E5E7EB",
    },
    dividerText: {
        marginHorizontal: 16,
        color: "#9CA3AF",
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
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        marginBottom: 10,
    },
    socialIcon: {
        marginRight: 10,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
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
        color: "#6B7280",
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
