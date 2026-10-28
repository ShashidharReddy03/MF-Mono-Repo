import dayjs, { type Dayjs } from "dayjs";
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Dropdown, Alert } from "antd";
import {
  minStatementDate,
  STATEMENT_PRESETS,
  STATEMENT_MAX_MONTHS,
  toDisplayDate,
  type FullStatementData,
  type FullStatementTransactionRow,
  type StatementRangePreset, t } from "@mf-bank/shared";
import BaseSegmented from "@/shared/ui/base/BaseSegmented";
import BaseDatePicker from "@/shared/ui/base/BaseDatePicker";
import BaseButton from "@/shared/ui/base/BaseButton";
import BaseTable from "@/shared/ui/base/BaseTable";
import BaseEmpty from "@/shared/ui/base/BaseEmpty";
import AmountText from "@/shared/ui/components/AmountText";

type Props = {
  preset: StatementRangePreset;
  onPreset: (p: StatementRangePreset) => void;
  customRange: { from: Date | null; to: Date | null };
  onCustomRange: (r: { from: Date | null; to: Date | null }) => void;
  rangeError?: string;
  range?: { from: Date; to: Date };
  data: FullStatementData | null;
  loading: boolean;
  downloading: boolean;
  onView: () => void;
  onDownload: (format: "pdf" | "xls") => void;
};

const toDayjs = (d: Date | null) => (d ? dayjs(d) : null);

/** Anything older than 6 months or in the future is not selectable */
const disabledDate = (current: Dayjs) =>
  current.isAfter(dayjs(), "day") || current.isBefore(dayjs(minStatementDate()), "day");

const SFullStatement = (p: Props) => {
  const columns = [
    { title: t("Date"), dataIndex: "Date", key: "Date", width: 120 },
    {
      title: t("Description"),
      dataIndex: "Description",
      key: "Description",
      render: (v: string, r: FullStatementTransactionRow) => (
        <div>
          <div className="font-medium text-primary">{v}</div>
          <div className="text-xs text-muted">{t("Ref")} {r.TransactionId}</div>
        </div>
      ),
    },
    {
      title: t("Amount"),
      dataIndex: "Amount",
      key: "Amount",
      align: "right" as const,
      render: (v: string, r: FullStatementTransactionRow) => <AmountText amount={v} indicator={r.Indicator} />,
    },
    {
      title: t("Balance"),
      dataIndex: "Balance",
      key: "Balance",
      align: "right" as const,
      render: (v: string) => <AmountText amount={v} className="font-normal text-muted" />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-xl bg-surface p-4">
        <BaseSegmented<StatementRangePreset>
          value={p.preset}
          onChange={p.onPreset}
          options={STATEMENT_PRESETS.map((x) => ({ label: x.label, value: x.key }))}
          className="self-start"
        />

        {p.preset === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("From")}</label>
              <BaseDatePicker
                value={toDayjs(p.customRange.from)}
                disabledDate={disabledDate}
                onChange={(d) => p.onCustomRange({ ...p.customRange, from: d ? d.toDate() : null })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("To")}</label>
              <BaseDatePicker
                value={toDayjs(p.customRange.to)}
                disabledDate={disabledDate}
                onChange={(d) => p.onCustomRange({ ...p.customRange, to: d ? d.toDate() : null })}
              />
            </div>
          </div>
        )}

        {p.preset === "custom" && p.rangeError && p.customRange.from && p.customRange.to && (
          <Alert type="warning" showIcon title={p.rangeError} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {p.range
              ? `${toDisplayDate(p.range.from)} – ${toDisplayDate(p.range.to)}`
              : t("Statements are available for the last {{n}} months.", { n: STATEMENT_MAX_MONTHS })}
          </span>
          <div className="flex gap-2">
            <Dropdown
              disabled={!p.range}
              menu={{
                items: [
                  { key: "pdf", icon: <FilePdfOutlined />, label: "PDF", onClick: () => p.onDownload("pdf") },
                  { key: "xls", icon: <FileExcelOutlined />, get label() { return t("Excel"); }, onClick: () => p.onDownload("xls") },
                ],
              }}
            >
              <BaseButton icon={<DownloadOutlined />} label={t("Download")} loading={p.downloading} disabled={!p.range} />
            </Dropdown>
            <BaseButton type="primary" label={t("View statement")} onClick={p.onView} loading={p.loading} disabled={!p.range} />
          </div>
        </div>
      </div>

      {p.data ? (
        <BaseTable<FullStatementTransactionRow>
          rowKey="TransactionId"
          columns={columns}
          dataSource={p.data.Transactions}
          loading={p.loading}
          locale={{ emptyText: <BaseEmpty title={t("No transactions in this period")} /> }}
        />
      ) : (
        <BaseEmpty title={t("Choose a period and select “View statement”.")} />
      )}
    </div>
  );
};

export default SFullStatement;
