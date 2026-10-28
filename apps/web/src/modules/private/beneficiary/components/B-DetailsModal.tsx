import { BENEFICIARY_TYPE_LABEL, type Beneficiary, t } from "@mf-bank/shared";
import BaseModal from "@/shared/ui/base/BaseModal";
import BaseButton from "@/shared/ui/base/BaseButton";
import DetailsList from "@/shared/ui/components/DetailsList";

type Props = { beneficiary: Beneficiary | null; onClose: () => void; onDelete: (b: Beneficiary) => void };

const BDetailsModal = ({ beneficiary: b, onClose, onDelete }: Props) => (
  <BaseModal open={!!b} onCancel={onClose} title={t("Beneficiary details")} maskClosable>
    {b && (
      <div className="flex flex-col gap-5">
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
        <div className="grid grid-cols-2 gap-3">
          <BaseButton label={t("Close")} onClick={onClose} />
          <BaseButton danger label={t("Delete")} onClick={() => onDelete(b)} />
        </div>
      </div>
    )}
  </BaseModal>
);

export default BDetailsModal;
