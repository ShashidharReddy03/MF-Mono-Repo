import { useCallback } from "react";
import { Modal } from "@ant-design/react-native";
import { colors, useLogout, t } from "@mf-bank/shared";

/** Same confirmation copy as the web PrivateLayout */
export const useConfirmLogout = () => {
  const logout = useLogout();
  return useCallback(
    (message?: string) =>
      Modal.alert(t("Log out?"), message ?? t("You will need to sign in again to access your accounts."), [
        { text: t("Cancel"), style: "cancel" },
        { text: t("Log out"), onPress: () => void logout(), style: { color: colors.danger } },
      ]),
    [logout],
  );
};
