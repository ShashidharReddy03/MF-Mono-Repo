import type { ReactNode } from "react";
import { View } from "react-native";
import { Checkbox } from "@ant-design/react-native";
import BaseText from "./BaseText";

type Props = { checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; error?: string };

const BaseCheckbox = ({ checked, onChange, children, error }: Props) => (
  <View className="gap-1">
    <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)}>
      <View className="ms-2 flex-1">{children}</View>
    </Checkbox>
    {error && <BaseText className="text-xs text-danger">{error}</BaseText>}
  </View>
);

export default BaseCheckbox;
