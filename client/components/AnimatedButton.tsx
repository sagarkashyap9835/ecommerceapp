import React from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, ViewStyle, StyleProp } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export default function AnimatedButton({ children, style, disabled, onPress, ...props }: AnimatedButtonProps) {
    const scale = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <AnimatedTouchable
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[style, { transform: [{ scale }] }]}
            disabled={disabled}
            {...props}
        >
            {children}
        </AnimatedTouchable>
    );
}
