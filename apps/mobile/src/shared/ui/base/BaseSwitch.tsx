import { Switch } from "react-native";
import { colors } from "@mf-bank/shared";

type Props = { value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; accessibilityLabel?: string };

/** Brand-coloured on/off switch */
const BaseSwitch = ({ value, onValueChange, disabled, accessibilityLabel }: Props) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    accessibilityLabel={accessibilityLabel}
    trackColor={{ true: colors.secondary, false: `${colors.muted}55` }}
    thumbColor="#FFFFFF"
  />
);

export default BaseSwitch;
