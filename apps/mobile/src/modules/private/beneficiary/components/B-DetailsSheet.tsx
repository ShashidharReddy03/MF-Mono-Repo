import { View } from "react-native";
import { BENEFICIARY_TYPE_LABEL, type Beneficiary, t } from "@mf-bank/shared";
import BaseModal from "@/shared/ui/base/BaseModal";
import BaseButton from "@/shared/ui/base/BaseButton";
import DetailsList from "@/shared/ui/components/DetailsList";

type Props = { beneficiary: Beneficiary | null; onClose: () => void; onDelete: (b: Beneficiary) => void };

const BDetailsSheet = ({ beneficiary: b, onClose, onDelete }: Props) => (
  <BaseModal open={!!b} onClose={onClose} title={t("Beneficiary details")} dismissable>
    {b && (
      <View className="gap-4">
        <DetailsList
          items={[
            { get label() { return t("Name"); }, value: b.beneficiaryName },
            { get label() { return t("Nickname"); }, value: b["Alias Name"] },
            { get label() { return t("Account number"); }, value: b.maskedAcno },
            { get label() { return t("Bank"); }, value: b.beneficiaryBank || BENEFICIARY_TYPE_LABEL[b.Type] },
            { get label() { return t("Mobile"); }, value: b.beneficiaryMobile || "—" },
            { get label() { return t("Email"); }, value: b.beneficiaryEmail || "—" },
          ]}
        />
        <BaseButton label={t("Delete beneficiary")} variant="danger" onPress={() => onDelete(b)} />
      </View>
    )}
  </BaseModal>
);

export default BDetailsSheet;
