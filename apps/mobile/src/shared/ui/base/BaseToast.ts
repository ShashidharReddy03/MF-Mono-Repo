import { Toast } from "@ant-design/react-native";
import type { ToastAdapter } from "@mf-bank/shared";

/**
 * Mobile implementation of the shared ToastAdapter
 * (@ant-design/react-native Toast — needs <Provider> at the root).
 */
export const toast: Required<ToastAdapter> = {
  success: (content) => Toast.success({ content, duration: 3 }),
  error: (content) => Toast.fail({ content, duration: 3.5 }),
  info: (content) => Toast.info({ content, duration: 3 }),
};
