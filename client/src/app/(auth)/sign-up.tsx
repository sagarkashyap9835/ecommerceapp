import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { COLORS } from "@/assets/constants";

export default function SignUpScreen() {
    const { isLoaded } = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        if (!emailAddress || !password) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all fields'
            });
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, emailAddress, password);
            
            // Update profile with name
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: `${firstName} ${lastName}`.trim()
                });
            }

            // Sync with backend on first load will happen when token is sent, or we can just let the middleware handle it on the next protected API call.
            Toast.show({
                type: 'success',
                text1: 'Account Created',
                text2: 'Welcome to the app!'
            });
            router.replace("/");
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Failed to Sign Up',
                text2: err?.message || "Something went wrong"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>
            <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold text-primary mb-2">Create Account</Text>
                <Text className="text-secondary">Sign up to get started</Text>
            </View>

            {/* First Name */}
            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">First Name</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="John" placeholderTextColor="#999" value={firstName} onChangeText={setFirstName} />
            </View>

            {/* Last Name */}
            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Last Name</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="Doe" placeholderTextColor="#999" value={lastName} onChangeText={setLastName} />
            </View>

            {/* Email */}
            <View className="mb-4">
                <Text className="text-primary font-medium mb-2">Email</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="user@example.com" placeholderTextColor="#999" autoCapitalize="none" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} />
            </View>

            {/* Password */}
            <View className="mb-6">
                <Text className="text-primary font-medium mb-2">Password</Text>
                <TextInput className="w-full bg-surface p-4 rounded-xl text-primary" placeholder="********" placeholderTextColor="#999" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            {/* Submit */}
            <TouchableOpacity className="w-full bg-primary py-4 rounded-full items-center mb-10" onPress={onSignUpPress} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Continue</Text>}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center">
                <Text className="text-secondary">Already have an account? </Text>
                <Link href="/sign-in">
                    <Text className="text-primary font-bold">Login</Text>
                </Link>
            </View>
        </SafeAreaView>
    );
}
