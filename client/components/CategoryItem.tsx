import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { CategoryItemProps } from "../constants/types";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";

export default function CategoryItem({
  item,
  isSelected,
  onPress,
}: CategoryItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        alignItems: "center",
        marginRight: 14,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isSelected ? COLORS.accent : "#F5F5F5",
          borderWidth: 1,
          borderColor: isSelected ? COLORS.accent : "#E5E7EB",
        }}
      >
        <Ionicons
          name={item.icon as any}
          size={28}
          color={isSelected ? "#FFFFFF" : COLORS.primary}
        />
      </View>

      <Text
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: "600",
          color: isSelected ? COLORS.accent : COLORS.primary,
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}