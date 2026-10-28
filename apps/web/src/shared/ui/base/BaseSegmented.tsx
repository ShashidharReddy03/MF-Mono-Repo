import { Segmented, type SegmentedProps } from "antd";

function BaseSegmented<T extends string>(props: SegmentedProps<T>) {
  return <Segmented<T> {...props} />;
}

export default BaseSegmented;
