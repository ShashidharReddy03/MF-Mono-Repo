import { Table, type TableProps } from "antd";

/** Horizontal scroll on small screens, sensible pagination defaults */
function BaseTable<T extends object>({ pagination, ...props }: TableProps<T>) {
  return (
    <Table<T>
      size="middle"
      scroll={{ x: "max-content" }}
      pagination={pagination === false ? false : { pageSize: 10, showSizeChanger: false, hideOnSinglePage: true, ...pagination }}
      {...props}
    />
  );
}

export default BaseTable;
