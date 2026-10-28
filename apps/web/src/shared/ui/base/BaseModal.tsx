import { Modal, type ModalProps } from "antd";
import type { ReactNode } from "react";

type BaseModalProps = { children: ReactNode } & ModalProps;

/** Blurred mask, not closable by clicking outside or pressing Esc */
const BaseModal = ({ children, ...props }: BaseModalProps) => (
  <Modal centered destroyOnHidden footer={null} maskClosable={false} keyboard={false} {...props}>
    <div className="pt-2">{children}</div>
  </Modal>
);

export default BaseModal;
