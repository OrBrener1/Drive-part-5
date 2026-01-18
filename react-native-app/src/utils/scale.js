import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const BASE_WIDTH = 375;

export const ms = (value) =>
  Math.round(value * (width / BASE_WIDTH));