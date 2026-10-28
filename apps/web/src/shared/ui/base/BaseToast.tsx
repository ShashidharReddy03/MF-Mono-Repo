import { message } from "antd";
import { CheckCircleFilled, CloseCircleFilled, InfoCircleFilled } from "@ant-design/icons";
import type { ToastAdapter } from "@mf-bank/shared";

/**
 * Web implementation of the shared ToastAdapter (antd message).
 * Fixed keys → repeated errors replace each other instead of stacking.
 */
export const toast: Required<ToastAdapter> = {
  success: (content) => {
    if (typeof content !== "string") return;
    message.open({ key: "toast_success", content, duration: 5, icon: <CheckCircleFilled className="text-secondary" /> });
  },
  error: (content) => {
    if (typeof content !== "string") return;
    message.open({ key: "toast_error", content, duration: 6, icon: <CloseCircleFilled className="text-danger" /> });
  },
  info: (content) => {
    if (typeof content !== "string") return;
    message.open({ key: "toast_info", content, duration: 5, icon: <InfoCircleFilled className="text-primary" /> });
  },
};
