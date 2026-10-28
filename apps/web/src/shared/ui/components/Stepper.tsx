import { Steps } from "antd";

type StepperProps = { steps: readonly string[]; current: number };

/** Wizard progress. The last step (success) shows as finished. */
const Stepper = ({ steps, current }: StepperProps) => (
  <Steps
    size="small"
    current={current}
    status={current === steps.length - 1 ? "finish" : "process"}
    items={steps.map((title) => ({ title }))}
    responsive={false}
    className="mf-stepper"
  />
);

export default Stepper;
