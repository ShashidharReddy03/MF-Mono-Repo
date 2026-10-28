import { Empty } from "antd";
import type { ReactNode } from "react";

const BaseEmpty = ({ title, action }: { title: string; action?: ReactNode }) => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-muted">{title}</span>}>
    {action}
  </Empty>
);

export default BaseEmpty;
