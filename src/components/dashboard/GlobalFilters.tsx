import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter, Calendar, X } from "lucide-react";
import { useFilters } from "@/contexts/FilterContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function GlobalFilters() {
  const { 
    selectedSite, 
    setSelectedSite, 
    dateRange, 
    setDateRange, 
    searchQuery, 
    setSearchQuery, 
    showAlertsOnly, 
    setShowAlertsOnly, 
    applyFilters,
    clearFilters 
  } = useFilters();

  const handleApplyFilters = () => {
    applyFilters();
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-4">
      <div className="card-ai-glass p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="w-[200px] h-9 border-[hsl(var(--input-border))]">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="main">Main Clinic</SelectItem>
                <SelectItem value="north">North Branch</SelectItem>
                <SelectItem value="west">West Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] h-9 justify-start text-left font-normal border-[hsl(var(--input-border))]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4 text-[hsl(var(--primary))]" />
                {dateRange?.start && dateRange?.end ? (
                  <>
                    {format(dateRange.start, "LLL dd, y")} - {format(dateRange.end, "LLL dd, y")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 card-ai-glass" align="start">
              <div className="p-3">
                <div className="text-sm font-medium mb-2 text-[hsl(var(--primary))]">Start Date</div>
                <DayPicker
                  mode="single"
                  selected={dateRange.start}
                  onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                  className="pointer-events-auto"
                />
                <div className="text-sm font-medium mb-2 mt-4 text-[hsl(var(--primary))]">End Date</div>
                <DayPicker
                  mode="single"
                  selected={dateRange.end}
                  onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
                  className="pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by SKU or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 border-[hsl(var(--input-border))]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <label className="text-sm text-muted-foreground">Alerts Only</label>
            <Switch checked={showAlertsOnly} onCheckedChange={setShowAlertsOnly} />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="h-9 bg-gradient-ai text-white hover:opacity-90">
              <Filter className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button onClick={clearFilters} variant="outline" className="h-9 border-[hsl(var(--input-border))]">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}