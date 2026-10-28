import { DatePicker, type DatePickerProps } from "antd";

const BaseDatePicker = ({ className, ...props }: DatePickerProps) => (
  <DatePicker size="large" format="DD/MM/YYYY" inputReadOnly {...props} className={`w-full ${className ?? ""}`} />
);

export default BaseDatePicker;
