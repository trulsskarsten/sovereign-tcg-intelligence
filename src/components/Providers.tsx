"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ViewMode = "standard" | "advanced";

interface UIState {
  isStatusOpen: boolean;
  isCommandCenterOpen: boolean;
  viewMode: ViewMode;
  priceMode: "net" | "gross";
  isEditMode: boolean;
  toggleStatus: () => void;
  toggleCommandCenter: () => void;
  toggleViewMode: () => void;
  togglePriceMode: () => void;
  toggleEditMode: () => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("standard");
  const [priceMode, setPriceMode] = useState<"net" | "gross">("net");
  const [isEditMode, setIsEditMode] = useState(false);

  // Persistence
  useEffect(() => {
    const savedStatus = localStorage.getItem("ui-status-open");
    const savedView = localStorage.getItem("ui-view-mode");
    const savedPrice = localStorage.getItem("ui-price-mode");
    if (savedStatus) setIsStatusOpen(savedStatus === "true");
    if (savedView) setViewMode(savedView as ViewMode);
    if (savedPrice) setPriceMode(savedPrice as "net" | "gross");
  }, []);

  useEffect(() => {
    localStorage.setItem("ui-status-open", String(isStatusOpen));
  }, [isStatusOpen]);

  useEffect(() => {
    localStorage.setItem("ui-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("ui-price-mode", priceMode);
  }, [priceMode]);

  const toggleStatus = () => setIsStatusOpen((prev) => !prev);
  const toggleCommandCenter = () => setIsCommandCenterOpen((prev) => !prev);
  const toggleViewMode = () => setViewMode((prev) => (prev === "standard" ? "advanced" : "standard"));
  const togglePriceMode = () => setPriceMode((prev) => (prev === "net" ? "gross" : "net"));
  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.altKey : e.altKey; // Alt/Option is mnemonic

      if (modifier) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault();
            toggleStatus();
            break;
          case "e":
            e.preventDefault();
            toggleEditMode();
            break;
          case "v":
            e.preventDefault();
            toggleViewMode();
            break;
          case "s":
            e.preventDefault();
            // Navigate to settings (future)
            break;
        }
      }

      // Command Center (Cmd+K or Ctrl+K)
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommandCenter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, isStatusOpen, isEditMode]); // Re-bind when toggle functions change (though they are stable here)

  return (
    <UIContext.Provider value={{ 
      isStatusOpen, 
      isCommandCenterOpen,
      viewMode, 
      priceMode,
      isEditMode, 
      toggleStatus, 
      toggleCommandCenter,
      toggleViewMode, 
      togglePriceMode,
      toggleEditMode 
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
