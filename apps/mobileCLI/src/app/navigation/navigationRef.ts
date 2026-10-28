import { createNavigationContainerRef } from "@react-navigation/native";
import type { PublicStackParamList } from "./types";

export const navigationRef = createNavigationContainerRef<PublicStackParamList>();
