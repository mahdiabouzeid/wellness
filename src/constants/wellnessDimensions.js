export const WELLNESS_DIMENSION_ORDER = [
  "Physical",
  "Emotional",
  "Social",
  "Environmental",
  "Intellectual",
  "Occupational",
  "Financial",
  "Spiritual",
];

export const WELLNESS_DIMENSION_COLORS = {
  physical: "#FB7185",
  emotional: "#F97316",
  social: "#EAB308",
  environmental: "#14B8A6",
  intellectual: "#38BDF8",
  occupational: "#0F766E",
  vocational: "#0F766E",
  financial: "#22C55E",
  spiritual: "#8B5CF6",
};

const WELLNESS_DIMENSION_INDEX = WELLNESS_DIMENSION_ORDER.reduce((acc, dimension, index) => {
  acc[dimension.toLowerCase()] = index;
  return acc;
}, {});

export const normalizeWellnessDimension = (dimension) =>
  String(dimension || "").trim().toLowerCase();

export const getWellnessDimensionColor = (dimension, fallback = "#0F766E") =>
  WELLNESS_DIMENSION_COLORS[normalizeWellnessDimension(dimension)] || fallback;

export const sortByWellnessDimensionOrder = (items, getDimensionName) =>
  [...items].sort((first, second) => {
    const firstName = normalizeWellnessDimension(getDimensionName(first));
    const secondName = normalizeWellnessDimension(getDimensionName(second));
    const firstIndex = WELLNESS_DIMENSION_INDEX[firstName] ?? Number.MAX_SAFE_INTEGER;
    const secondIndex = WELLNESS_DIMENSION_INDEX[secondName] ?? Number.MAX_SAFE_INTEGER;

    if (firstIndex !== secondIndex) {
      return firstIndex - secondIndex;
    }

    return firstName.localeCompare(secondName);
  });
