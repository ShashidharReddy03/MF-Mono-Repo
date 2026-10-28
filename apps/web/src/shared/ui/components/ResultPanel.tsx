import { Result } from "antd";
import type { DetailsItem } from "@mf-bank/shared";
import DetailsList from "./DetailsList";
import BaseButton from "../base/BaseButton";

type Props = {
  title: string;
  message?: string;
  details?: DetailsItem[];
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** "error" for a failed outcome (server Status 06) */
  status?: "success" | "error";
};

const ResultPanel = ({ title, message, details, actionLabel, onAction, secondaryLabel, onSecondary, status = "success" }: Props) => (
  <div className="flex flex-col gap-4">
    <Result status={status} title={<span className="text-primary">{title}</span>} subTitle={message} className="!p-2" />
    <DetailsList items={details} />
    <BaseButton type="primary" block label={actionLabel} onClick={onAction} />
    {secondaryLabel && onSecondary && <BaseButton block label={secondaryLabel} onClick={onSecondary} />}
  </div>
);

export default ResultPanel;
