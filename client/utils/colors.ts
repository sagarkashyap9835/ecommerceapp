export const getColorName = (colorInput: string): string => {
  if (!colorInput) return "";
  
  const formatted = colorInput.trim().toUpperCase();

  const colorMap: Record<string, string> = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#000000": "Black",
    "#FFFFFF": "White",
    "#FFFF00": "Yellow",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#FFC0CB": "Pink",
    "#808080": "Gray",
    "#A52A2A": "Brown",
    "#00FFFF": "Cyan",
    "#FF00FF": "Magenta",
    "#000080": "Navy",
    "#800000": "Maroon",
    "#008080": "Teal",
    "#808000": "Olive",
    "#C0C0C0": "Silver",
    "#F5F5DC": "Beige",
    "#111827": "Dark Gray",
    "#F3F4F6": "Light Gray"
  };

  if (colorMap[formatted]) {
    return colorMap[formatted];
  }

  if (!formatted.startsWith("#")) {
    return colorInput.trim();
  }

  return colorInput.trim();
};
