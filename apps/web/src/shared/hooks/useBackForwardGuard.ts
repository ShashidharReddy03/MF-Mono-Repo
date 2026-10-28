import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { Modal } from "antd";
import { useLogout, t } from "@mf-bank/shared";

/**
 * Browser back/forward (history POP) inside the private area asks the user
 * to confirm, and confirming logs them out. In-app navigation (PUSH) is
 * unaffected. Replaces the demo's pushState trap with React Router's
 * useBlocker, which reliably stops the navigation before it happens.
 */
export const useBackForwardGuard = () => {
  const logout = useLogout();
  const blocker = useBlocker(({ historyAction }) => historyAction === "POP");

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    Modal.confirm({
      title: t("Log out?"),
      content: t("Using the browser's back or forward button will end your secure session."),
      okText: t("Log out"),
      cancelText: t("Stay"),
      centered: true,
      onOk: () => {
        blocker.reset();
        void logout();
      },
      onCancel: () => blocker.reset(),
    });
  }, [blocker, logout]);
};
