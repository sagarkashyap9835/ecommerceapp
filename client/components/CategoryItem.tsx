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
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: isSelected ? (COLORS.primary || "#111827") : "#FFFFFF",
        borderWidth: 1,
        borderColor: isSelected ? (COLORS.primary || "#111827") : "#E5E7EB",
      }}
    >
      <Ionicons
        name={item.icon as any}
        size={18}
        color={isSelected ? "#FFFFFF" : (COLORS.primary || "#111827")}
      />
      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: isSelected ? "700" : "600",
          color: isSelected ? "#FFFFFF" : "#4B5563",
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}