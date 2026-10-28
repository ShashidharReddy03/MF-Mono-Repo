import { View } from "react-native";
import Logo from "./Logo";

/**
 * Drawn over the app whenever it leaves the foreground, so the OS task
 * switcher snapshot never shows balances or account numbers.
 */
const PrivacyOverlay = ({ visible }: { visible: boolean }) =>
  visible ? (
    <View className="absolute inset-0 items-center justify-center bg-primary">
      <Logo light />
    </View>
  ) : null;

export default PrivacyOverlay;
