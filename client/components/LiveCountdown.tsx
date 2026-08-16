import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function LiveCountdown({ endTime, style, textStyle }: { endTime: string, style?: any, textStyle?: any }) {
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft("Expired");
                return;
            }

            // Calculate hours, minutes and seconds
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            // Format appropriately
            if (difference > 86400000) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                setTimeLeft(`${days} Days ${hours}h`);
            } else {
                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        };

        calculateTime(); // initial run
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <View style={style}>
            <Text style={textStyle}>Ends in: {timeLeft}</Text>
        </View>
    );
}
