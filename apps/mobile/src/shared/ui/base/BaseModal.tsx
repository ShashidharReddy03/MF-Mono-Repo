import type { ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, t } from "@mf-bank/shared";
import BaseText from "./BaseText";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** tap outside to close (off by default, like the web BaseModal) */
  dismissable?: boolean;
};

/** Bottom sheet modal used for pickers, details and confirmations */
const BaseModal = ({ open, onClose, title, children, dismissable = false }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={dismissable ? onClose : undefined} />
        <View className="max-h-[85%] rounded-t-3xl bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 16 }}>
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-primary/15" />
          {title && (
            <View className="mb-4 flex-row items-center justify-between">
              <BaseText weight="bold" className="text-lg">
                {title}
              </BaseText>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel={t("Close")}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>
          )}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BaseModal;
