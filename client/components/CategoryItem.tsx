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
      activeOpacity={0.75}
      style={{
        alignItems: "center",
        marginRight: 16,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isSelected ? (COLORS.primary || "#111827") : "#F3F4F6",
          borderWidth: 1,
          borderColor: isSelected ? (COLORS.primary || "#111827") : "#E5E7EB",
          elevation: isSelected ? 3 : 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.12 : 0,
          shadowRadius: 4,
        }}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={isSelected ? "#FFFFFF" : "#374151"}
        />
      </View>

      <Text
        style={{
          marginTop: 6,
          fontSize: 12,
          fontWeight: isSelected ? "700" : "600",
          color: isSelected ? (COLORS.primary || "#111827") : "#4B5563",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}