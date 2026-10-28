import { ActivityIndicator, View } from "react-native";
import { colors, useAppSelector, t } from "@mf-bank/shared";

/**
 * Blocking overlay while any API call is in flight (shared loader slice).
 * Blocking on mobile prevents double-submits on slow networks.
 */
const GlobalLoader = () => {
  const pending = useAppSelector((s) => s.loader.pending);
  if (!pending) return null;
  return (
    <View className="absolute inset-0 items-center justify-center bg-white/40" accessibilityLabel={t("Loading")} accessibilityRole="progressbar">
      <View className="rounded-2xl bg-white p-5" style={{ elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12 }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    </View>
  );
};

export default GlobalLoader;
