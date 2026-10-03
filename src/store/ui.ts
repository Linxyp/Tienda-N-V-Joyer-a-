"use client";

import { create } from "zustand";

interface EstadoUI {
  buscador: boolean;
  menu: boolean;
  abrirBuscador: () => void;
  cerrarBuscador: () => void;
  alternarMenu: (v?: boolean) => void;
}

export const useUI = create<EstadoUI>((set) => ({
  buscador: false,
  menu: false,
  abrirBuscador: () => set({ buscador: true, menu: false }),
  cerrarBuscador: () => set({ buscador: false }),
  alternarMenu: (v) => set((s) => ({ menu: v ?? !s.menu })),
}));
