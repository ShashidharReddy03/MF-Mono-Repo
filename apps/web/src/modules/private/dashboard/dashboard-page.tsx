import { useNavigate } from "react-router-dom";
import { useDashboard, t } from "@mf-bank/shared";
import PageHeader from "@/shared/ui/components/PageHeader";
import BaseButton from "@/shared/ui/base/BaseButton";
import { ROUTES } from "@/app/routes/routes";
import DAccountCard from "./components/D-AccountCard";
import DTransactions from "./components/D-Transactions";
import DQuickActions from "./components/D-QuickActions";

const DashboardPage = () => {
  const navigate = useNavigate();
  const d = useDashboard();
  const firstName = d.meta?.CNAME?.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader title={t("{{greeting}}, {{name}}", { greeting: d.greeting, name: firstName })} description={t("Here's an overview of your accounts.")} />

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary">{t("Your accounts")}</h2>
          <span className="text-xs text-muted">{t("Select an account to see its activity")}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {d.accounts.map((a) => (
            <DAccountCard
              key={a.accountNumber}
              account={a}
              balance={d.balances[a.accountNumber]}
              visible={!!d.visible[a.accountNumber]}
              loading={d.balanceLoading === a.accountNumber}
              selected={d.selectedAccount === a.accountNumber}
              onSelect={() => d.setSelectedAccount(a.accountNumber)}
              onToggle={() => void d.toggleBalance(a.accountNumber)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <DTransactions
          rows={d.transactions}
          currency={d.currency}
          filter={d.filter}
          onFilter={d.setFilter}
          loading={d.miniLoading}
          footer={
            <div className="mt-3 border-t border-primary/5 pt-3">
              <BaseButton
                type="link"
                size="middle"
                className="!px-0"
                label={t("View full statement")}
                onClick={() => navigate(ROUTES.private.statements, { state: { account: d.selectedAccount } })}
              />
            </div>
          }
        />
        <DQuickActions />
      </div>
    </>
  );
};

export default DashboardPage;
