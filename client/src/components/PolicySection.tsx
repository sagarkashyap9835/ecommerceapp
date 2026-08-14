import React from "react";
import { View, Text, StyleSheet } from "react-native";

type PolicySectionProps = {
  title: string;
  content: string | string[];
};

export default function PolicySection({ title, content }: PolicySectionProps) {
  const blocks = Array.isArray(content) ? content : [content];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {blocks.map((paragraph, index) => (
        <Text key={`${title}-${index}`} style={styles.text}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 8,
  },
});
