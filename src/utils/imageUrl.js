const SIZE_ORDER = {
  icon: ["icon", "thumbnail", "full"],
  thumbnail: ["thumbnail", "full", "icon"],
  full: ["full", "thumbnail", "icon"],
};

const parseImage = (image) => {
  if (typeof image !== "string") return image;
  const value = image.trim();
  if (!value || value === "[object Object]") return null;
  if ((value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]"))) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

export const getImageUrl = (image, preferredSize = "thumbnail", fallback = "") => {
  const parsed = parseImage(image);
  if (typeof parsed === "string") return parsed;
  if (Array.isArray(parsed)) {
    return getImageUrl(parsed[0], preferredSize, fallback);
  }
  if (!parsed || typeof parsed !== "object") return fallback;

  const keys = [
    ...(SIZE_ORDER[preferredSize] || SIZE_ORDER.thumbnail),
    "original",
    "original_url",
    "image_url",
    "url",
    "src",
    "path",
  ];
  for (const key of keys) {
    if (parsed[key]) {
      const resolved = getImageUrl(parsed[key], preferredSize);
      if (resolved) return resolved;
    }
  }
  return fallback;
};

export const parseImageList = (images) => {
  const parsed = parseImage(images);
  return Array.isArray(parsed) ? parsed : [];
};
