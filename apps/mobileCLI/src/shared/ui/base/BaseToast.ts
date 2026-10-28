import { Alert } from "react-native";
import type { ToastAdapter } from "@mf-bank/shared";

export const toast: Required<ToastAdapter> = {
  success: (message) => Alert.alert("Success", message),
  error: (message) => Alert.alert("Error", message),
  info: (message) => Alert.alert("Information", message),
};
