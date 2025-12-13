import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showAlertsOnly: boolean;
  setShowAlertsOnly: (show: boolean) => void;
  appliedFilters: {
    site: string;
    dateRange: { start: Date; end: Date };
    search: string;
    alertsOnly: boolean;
  };
  applyFilters: () => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSite] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(2025, 0, 1),
    end: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // Applied filters state (what's actually being used for filtering)
  const [appliedFilters, setAppliedFilters] = useState({
    site: "all",
    dateRange: {
      start: new Date(2025, 0, 1),
      end: new Date(),
    },
    search: "",
    alertsOnly: false,
  });

  const applyFilters = () => {
    setAppliedFilters({
      site: selectedSite,
      dateRange: dateRange,
      search: searchQuery,
      alertsOnly: showAlertsOnly,
    });
  };

  const clearFilters = () => {
    const defaultDateRange = {
      start: new Date(2025, 0, 1),
      end: new Date(),
    };
    
    setSelectedSite("all");
    setDateRange(defaultDateRange);
    setSearchQuery("");
    setShowAlertsOnly(false);
    
    setAppliedFilters({
      site: "all",
      dateRange: defaultDateRange,
      search: "",
      alertsOnly: false,
    });
  };

  return (
    <FilterContext.Provider
      value={{
        selectedSite,
        setSelectedSite,
        dateRange,
        setDateRange,
        searchQuery,
        setSearchQuery,
        showAlertsOnly,
        setShowAlertsOnly,
        appliedFilters,
        applyFilters,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
