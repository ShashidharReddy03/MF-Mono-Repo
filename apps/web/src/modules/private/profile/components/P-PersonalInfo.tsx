import { Skeleton } from "antd";
import { initials, maskAccount, t, useProfile } from "@mf-bank/shared";
import DetailsList from "@/shared/ui/components/DetailsList";

/** Personal details + accounts linked to internet banking (demo: PersonalInfo + AccountsLinked) */
const PPersonalInfo = () => {
  const p = useProfile();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary-light text-xl font-bold text-secondary-dark">
          {initials(p.name)}
        </span>
        <div>
          <div className="text-lg font-semibold text-primary">{p.name}</div>
          <div className="text-sm text-muted">{t("Internet Banking")}</div>
        </div>
      </div>
      <DetailsList items={p.details} />

      <section>
        <h3 className="mb-3 text-base font-semibold text-primary">{t("Linked accounts")}</h3>
        {p.loading && !p.accounts.length ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <ul className="divide-y divide-primary/5 rounded-xl border border-primary/10">
            {p.accounts.map((a) => (
              <li key={a.accountNumber} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-primary">{a.accountName}</div>
                  <div className="text-xs text-muted">
                    {a.accountType} · {a.currency} · <span dir="ltr">{maskAccount(a.accountNumber)}</span>
                  </div>
                </div>
                <span className="rounded-full bg-secondary-light px-2.5 py-0.5 text-2xs font-semibold text-secondary-dark">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PPersonalInfo;
