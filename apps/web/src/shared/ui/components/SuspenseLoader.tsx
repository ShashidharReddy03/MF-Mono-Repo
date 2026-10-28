import { Spin } from "antd";

const SuspenseLoader = () => (
  <div className="grid min-h-[240px] w-full place-items-center">
    <Spin />
  </div>
);

export default SuspenseLoader;
