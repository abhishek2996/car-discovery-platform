"use client";

import { create } from "zustand";

// ── Dealer dashboard filters ──────────────────────────────────────

type InventoryFilters = {
  search: string;
  stockStatus: string;
  visibility: string;
  sort: string;
};

type LeadFilters = {
  status: string;
  type: string;
  search: string;
  sort: string;
};

type DealerDashboardState = {
  inventoryFilters: InventoryFilters;
  leadFilters: LeadFilters;
  selectedEntityId: string | null;
  setInventoryFilter: <K extends keyof InventoryFilters>(
    key: K,
    value: InventoryFilters[K],
  ) => void;
  resetInventoryFilters: () => void;
  setLeadFilter: <K extends keyof LeadFilters>(
    key: K,
    value: LeadFilters[K],
  ) => void;
  resetLeadFilters: () => void;
  setSelectedEntity: (id: string | null) => void;
};

const defaultInventoryFilters: InventoryFilters = {
  search: "",
  stockStatus: "",
  visibility: "",
  sort: "",
};

const defaultLeadFilters: LeadFilters = {
  status: "",
  type: "",
  search: "",
  sort: "",
};

export const useDealerDashboardStore = create<DealerDashboardState>((set) => ({
  inventoryFilters: { ...defaultInventoryFilters },
  leadFilters: { ...defaultLeadFilters },
  selectedEntityId: null,

  setInventoryFilter: (key, value) =>
    set((s) => ({
      inventoryFilters: { ...s.inventoryFilters, [key]: value },
    })),
  resetInventoryFilters: () =>
    set({ inventoryFilters: { ...defaultInventoryFilters } }),

  setLeadFilter: (key, value) =>
    set((s) => ({
      leadFilters: { ...s.leadFilters, [key]: value },
    })),
  resetLeadFilters: () => set({ leadFilters: { ...defaultLeadFilters } }),

  setSelectedEntity: (id) => set({ selectedEntityId: id }),
}));

// ── Admin dashboard filters ───────────────────────────────────────

type AdminFilters = {
  search: string;
  status: string;
  dateRange: string;
  sort: string;
};

type AdminDashboardState = {
  filters: AdminFilters;
  setFilter: <K extends keyof AdminFilters>(
    key: K,
    value: AdminFilters[K],
  ) => void;
  resetFilters: () => void;
  selectedEntityId: string | null;
  setSelectedEntity: (id: string | null) => void;
};

const defaultAdminFilters: AdminFilters = {
  search: "",
  status: "",
  dateRange: "",
  sort: "",
};

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  filters: { ...defaultAdminFilters },
  selectedEntityId: null,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultAdminFilters } }),

  setSelectedEntity: (id) => set({ selectedEntityId: id }),
}));

// ── Comparison wizard store ───────────────────────────────────────

type ComparisonState = {
  selectedVariantIds: string[];
  addVariant: (id: string) => void;
  removeVariant: (id: string) => void;
  clearAll: () => void;
};

export const useComparisonStore = create<ComparisonState>((set) => ({
  selectedVariantIds: [],

  addVariant: (id) =>
    set((s) => {
      if (s.selectedVariantIds.length >= 3) return s;
      if (s.selectedVariantIds.includes(id)) return s;
      return { selectedVariantIds: [...s.selectedVariantIds, id] };
    }),

  removeVariant: (id) =>
    set((s) => ({
      selectedVariantIds: s.selectedVariantIds.filter((v) => v !== id),
    })),

  clearAll: () => set({ selectedVariantIds: [] }),
}));
