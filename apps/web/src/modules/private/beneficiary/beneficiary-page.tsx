import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Skeleton } from "antd";
import { DeleteOutlined, PlusOutlined, SearchOutlined, RightOutlined } from "@ant-design/icons";
import {
  BENEFICIARY_TYPE_LABEL,
  initials,
  useBeneficiaries,
  type Beneficiary,
  type BeneficiaryFilter, t } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseInput from "@/shared/ui/base/BaseInput";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import { ROUTES } from "@/app/routes/routes";
import BDetailsModal from "./components/B-DetailsModal";

const BeneficiaryPage = () => {
  const navigate = useNavigate();
  const b = useBeneficiaries();
  const [selected, setSelected] = useState<Beneficiary | null>(null);

  const confirmDelete = (ben: Beneficiary) =>
    Modal.confirm({
      title: t("Delete beneficiary?"),
      content: t("{{name}} ({{account}}) will be removed. You can add them again later.", { name: ben.beneficiaryName, account: ben.maskedAcno }),
      okText: t("Delete"),
      okButtonProps: { danger: true },
      cancelText: t("Cancel"),
      centered: true,
      onOk: async () => {
        if (await b.remove(ben)) setSelected(null);
      },
    });

  const addButton = (
    <BaseButton
      type="primary"
      icon={<PlusOutlined />}
      label={t("Add beneficiary")}
      onClick={() => navigate(ROUTES.private.addBeneficiary)}
    />
  );

  return (
    <>
      <PageHeader title={t("Beneficiaries")} description={t("People and accounts you can pay.")} actions={addButton} />

      <div className="rounded-2xl border border-primary/10 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <BaseInput
            prefix={<SearchOutlined className="text-muted" />}
            placeholder={t("Search by name, nickname or account")}
            value={b.search}
            onChange={(e) => b.setSearch(e.target.value)}
            allowClear
            className="sm:!w-80"
          />
          <BaseSegmented<BeneficiaryFilter>
            value={b.typeFilter}
            onChange={b.setTypeFilter}
            options={[
              { label: `${t("All")} (${b.counts.ALL})`, value: "ALL" },
              { label: `${BENEFICIARY_TYPE_LABEL.SCU} (${b.counts.SCU})`, value: "SCU" },
              { label: `${BENEFICIARY_TYPE_LABEL.LOCAL} (${b.counts.LOCAL})`, value: "LOCAL" },
            ]}
          />
        </div>

        {b.loading && !b.list.length ? (
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        ) : b.filtered.length ? (
          <ul className="divide-y divide-primary/5">
            {b.filtered.map((ben) => (
              <li key={ben.benid} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => setSelected(ben)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-start hover:bg-surface/60"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/5 text-sm font-bold text-primary">
                    {initials(ben.beneficiaryName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-primary">
                      {ben.beneficiaryName}
                      <span className="ms-2 font-normal text-muted">· {ben["Alias Name"]}</span>
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {ben.beneficiaryBank || BENEFICIARY_TYPE_LABEL[ben.Type]} · {ben.maskedAcno}
                    </span>
                  </span>
                  <span
                    className={`hidden rounded-full px-2.5 py-0.5 text-2xs font-semibold sm:inline ${
                      ben.Type === "SCU" ? "bg-secondary-light text-secondary-dark" : "bg-surface text-muted"
                    }`}
                  >
                    {BENEFICIARY_TYPE_LABEL[ben.Type]}
                  </span>
                  <RightOutlined className="text-xs text-muted rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label={t("Delete {{name}}", { name: ben.beneficiaryName })}
                  onClick={() => confirmDelete(ben)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <DeleteOutlined />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <BaseEmpty
            title={b.list.length ? t("No beneficiaries match your search") : t("You haven't added any beneficiaries yet")}
            action={!b.list.length ? addButton : undefined}
          />
        )}
      </div>

      <BDetailsModal beneficiary={selected} onClose={() => setSelected(null)} onDelete={confirmDelete} />
    </>
  );
};

export default BeneficiaryPage;
