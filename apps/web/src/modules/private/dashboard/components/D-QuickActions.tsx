import { useNavigate } from "react-router-dom";
import { FileTextOutlined, UserAddOutlined, TeamOutlined } from "@ant-design/icons";
import { ROUTES } from "@/app/routes/routes";
import { t } from "@mf-bank/shared";

const ACTIONS = [
  { get label() { return t("View statement"); }, icon: FileTextOutlined, to: ROUTES.private.statements },
  { get label() { return t("Add beneficiary"); }, icon: UserAddOutlined, to: ROUTES.private.addBeneficiary },
  { get label() { return t("Manage beneficiaries"); }, icon: TeamOutlined, to: ROUTES.private.beneficiaries },
];

const DQuickActions = () => {
  const navigate = useNavigate();
  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-primary">{t("Quick actions")}</h2>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {ACTIONS.map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-2 rounded-xl border border-primary/10 p-3 text-center text-xs font-medium text-primary transition-colors hover:border-secondary hover:bg-secondary-light lg:flex-row lg:text-left lg:text-sm"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-secondary-dark">
              <Icon />
            </span>
            {label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default DQuickActions;
