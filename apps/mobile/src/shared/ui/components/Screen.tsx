import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@mf-bank/shared";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
};

/** Safe area + keyboard avoiding + scroll (optional pull-to-refresh) */
const Screen = ({ children, scroll = true, edges = ["top"], refreshing, onRefresh, className = "" }: Props) => (
  <SafeAreaView edges={edges} className="flex-1 bg-surface">
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`grow px-5 pb-10 pt-4 ${className}`}
          refreshControl={
            onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.secondary} /> : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 px-5 pt-4 ${className}`}>{children}</View>
      )}
    </KeyboardAvoidingView>
  </SafeAreaView>
);

export default Screen;
