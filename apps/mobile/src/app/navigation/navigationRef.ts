import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootParamList } from "./types";

/** Lets non-screen code (e.g. the Android back handler) inspect navigation state */
export const navigationRef = createNavigationContainerRef<RootParamList>();
