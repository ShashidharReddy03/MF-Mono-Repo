import { Form, type FormProps } from "antd";
import type { ReactNode } from "react";

type FormWrapperProps<T> = { children: ReactNode } & FormProps<T>;

/** Vertical layout, autocomplete off, validate on change */
function FormWrapper<T>({ children, ...rest }: FormWrapperProps<T>) {
  return (
    <Form<T> autoComplete="off" layout="vertical" requiredMark={false} validateTrigger="onChange" {...rest}>
      {children}
    </Form>
  );
}

export default FormWrapper;
