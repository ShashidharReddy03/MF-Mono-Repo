import { Linking, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, t } from "@mf-bank/shared";
import type { Finding } from "@/core/security/deviceChecks";
import { CHECK_TEXT } from "@/core/security/securityPolicy";
import BaseText from "../base/BaseText";
import BaseButton from "../base/BaseButton";
import Logo from "./Logo";

type Props = { findings: Finding[]; isolated: boolean; updateUrl?: string; onRetry: () => void };

/**
 * Covers the whole app while a "block" or "isolate" finding is present
 * (policy in core/security/securityPolicy.ts).
 */
const DeviceSecurityBlock = ({ findings, isolated, updateUrl, onRetry }: Props) => {
  if (!findings.length) return null;
  const onlyCapture = findings.every((f) => f.id === "screenCaptured");
  const outdated = findings.some((f) => f.id === "outdatedApp") && findings.every((f) => f.id === "outdatedApp" || f.id === "screenCaptured");

  const title = isolated
    ? t("This device has been isolated")
    : outdated
      ? t("Update required")
      : onlyCapture
        ? t("Content hidden")
        : t("This device isn't secure");
  const hint = isolated
    ? t("For your safety, MF Bank has been locked on this device and the bank has been notified. Please contact us.")
    : outdated
      ? t("Update MF Bank from the app store to continue.")
      : onlyCapture
        ? t("Stop recording or sharing your screen to continue.")
        : t("For your safety, MF Bank can't be used on this device until the issue is fixed.");

  return (
    <View className="absolute inset-0 items-center justify-center bg-primary px-8" accessibilityViewIsModal>
      <Logo light />
      <View className="mt-10 h-16 w-16 items-center justify-center rounded-full bg-white/10">
        <Ionicons
          name={isolated ? "lock-closed-outline" : outdated ? "cloud-download-outline" : onlyCapture ? "eye-off-outline" : "shield-outline"}
          size={32}
          color={colors.secondary}
        />
      </View>
      <BaseText weight="bold" className="mt-5 text-center text-xl text-white">
        {title}
      </BaseText>
      <View className="mt-4 gap-2 self-stretch">
        {findings.map((f) => (
          <BaseText key={f.id} className="text-center text-sm text-white/80">
            {CHECK_TEXT[f.id].title}
          </BaseText>
        ))}
      </View>
      <BaseText className="mt-4 text-center text-xs text-white/60">{hint}</BaseText>
      {outdated && updateUrl ? (
        <View className="mt-8 self-stretch">
          <BaseButton label={t("Update app")} variant="secondary" onPress={() => void Linking.openURL(updateUrl)} />
        </View>
      ) : !onlyCapture && !isolated ? (
        <View className="mt-8 self-stretch">
          <BaseButton label={t("Check again")} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
};

export default DeviceSecurityBlock;
