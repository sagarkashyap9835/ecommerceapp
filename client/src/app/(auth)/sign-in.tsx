import { COLORS } from "@/assets/constants";
import { useSignIn, useAuth } from "@clerk/expo";
import type { EmailCodeFactor } from "@clerk/types";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as React from "react";
import { Pressable, TextInput, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Page() {
    const { signIn } = useSignIn();
    const { isLoaded } = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [code, setCode] = React.useState("");
    const [showEmailCode, setShowEmailCode] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const onSignInPress = async () => {

        if (!isLoaded) return;
        if (!emailAddress || !password) return;

        setLoading(true);

        try {

            const result = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (result.error) {
                throw result.error;
            }

            if (signIn.status === "complete") {
                const finalizeResult = await signIn.finalize();
                if (finalizeResult.error) {
                    throw finalizeResult.error;
                }
                router.replace("/");
            } else if (signIn.status === "needs_second_factor") {
                const emailCodeFactor = signIn.supportedSecondFactors?.find((factor): factor is EmailCodeFactor => factor.strategy === "email_code");

                if (emailCodeFactor) {
                    const sendMfaResult = await signIn.mfa.sendEmailCode();
                    if (sendMfaResult.error) {
                        throw sendMfaResult.error;
                    }
                    setShowEmailCode(true);
                }
            }
        } catch (err: any) {
            console.error(err);
            Toast.show({
                type: 'error',
                text1: 'Sign In Failed',
                text2: err?.message ?? err?.errors?.[0]?.message ?? "Invalid email or password"
            });
        } finally {
            setLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded || !code) return;

        setLoading(true);
        try {
            const result = await signIn.mfa.verifyEmailCode({
                code,
            });

            if (result.error) {
                throw result.error;
            }

            if (signIn.status === "complete") {
                const finalizeResult = await signIn.finalize();
                if (finalizeResult.error) {
                    throw finalizeResult.error;
                }
                router.replace("/");
            }
        } catch (err: any) {
            console.error(err);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: err?.message ?? err?.errors?.[0]?.message ?? "Invalid code"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center" style={{ padding: 28 }}>
            {!showEmailCode ? (
                <>
                    <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 z-10">
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-primary mb-2">Welcome Back</Text>
                        <Text className="text-secondary">Sign in to continue</Text>
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
                    <Pressable className={`w-full py-4 rounded-full items-center mb-10 ${loading || !emailAddress || !password ? "bg-gray-300" : "bg-primary"}`} onPress={onSignInPress} disabled={loading || !emailAddress || !password}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
                    </Pressable>

                    {/* Footer */}
                    <View className="flex-row justify-center">
                        <Text className="text-secondary">Don&apos;t have an account? </Text>
                        <Link href="/sign-up">
                            <Text className="text-primary font-bold">Sign up</Text>
                        </Link>
                    </View>
                </>
            ) : (
                <>
                    {/* Verification */}
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-primary mb-2">Verify Email</Text>
                        <Text className="text-secondary text-center">Enter the code sent to your email</Text>
                    </View>

                    <View className="mb-6">
                        <TextInput className="w-full bg-surface p-4 rounded-xl text-primary text-center tracking-widest" placeholder="123456" placeholderTextColor="#999" keyboardType="number-pad" value={code} onChangeText={setCode} />
                    </View>

                    <Pressable className="w-full bg-primary py-4 rounded-full items-center" onPress={onVerifyPress} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify</Text>}
                    </Pressable>
                </>
            )}
        </SafeAreaView>
    );
}
