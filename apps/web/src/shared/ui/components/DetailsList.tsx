import type { DetailsItem } from "@mf-bank/shared";

/** Label/value rows for confirmation & success screens */
const DetailsList = ({ items }: { items?: DetailsItem[] }) =>
  items?.length ? (
    <dl className="divide-y divide-primary/10 rounded-lg border border-primary/10">
      {items.map((d) => (
        <div key={d.label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
          <dt className="text-muted">{d.label}</dt>
          <dd className="text-end font-medium text-primary">{d.value}</dd>
        </div>
      ))}
    </dl>
  ) : null;

export default DetailsList;
