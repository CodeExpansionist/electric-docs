"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SignInModalContextType {
  isOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

const SignInModalContext = createContext<SignInModalContextType>({
  isOpen: false,
  openSignInModal: () => {},
  closeSignInModal: () => {},
});

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSignInModal = () => setIsOpen(true);
  const closeSignInModal = () => setIsOpen(false);

  return (
    <SignInModalContext.Provider value={{ isOpen, openSignInModal, closeSignInModal }}>
      {children}
    </SignInModalContext.Provider>
  );
}

export function useSignInModal() {
  return useContext(SignInModalContext);
}
