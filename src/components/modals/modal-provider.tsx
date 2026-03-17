"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CreateContactModal, CreateDealModal, CreateTaskModal, ScheduleMeetingModal, ComposeEmailModal, ImportContactsModal } from "@/components/modals";
import CreateCompanyModal from "@/components/modals/create-company";
import CreateInvoiceModal from "@/components/modals/create-invoice";

type ModalType = "contact" | "deal" | "task" | "meeting" | "email" | "import" | "company" | "invoice" | null;

interface ModalContextType {
  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<Record<string, any>>({});

  const openModal = useCallback((type: ModalType, props: Record<string, any> = {}) => {
    setActiveModal(type);
    setModalProps(props);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalProps({});
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <CreateContactModal open={activeModal === "contact"} onClose={closeModal} />
      <CreateDealModal open={activeModal === "deal"} onClose={closeModal} />
      <CreateTaskModal open={activeModal === "task"} onClose={closeModal} editTask={modalProps.editTask || null} />
      <ScheduleMeetingModal open={activeModal === "meeting"} onClose={closeModal} />
      <ComposeEmailModal open={activeModal === "email"} onClose={closeModal} {...modalProps} />
      <ImportContactsModal open={activeModal === "import"} onClose={closeModal} />
      <CreateCompanyModal open={activeModal === "company"} onClose={closeModal} />
      <CreateInvoiceModal open={activeModal === "invoice"} onClose={closeModal} />
    </ModalContext.Provider>
  );
}
