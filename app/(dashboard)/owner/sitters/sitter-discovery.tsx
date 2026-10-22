"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownUp, CalendarDays, Check, ChevronDown, CircleHelp, MapPin, PawPrint, Search, ShieldCheck, Star } from "lucide-react";
import { SitterCard, type SitterListing } from "./sitter-card";

const SitterMap = dynamic(() => import("./sitter-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[320px] place-items-center bg-[#F8F9FB] text-xs text-[#6f6e78]" role="status">
      Loading map...
    </div>
  ),
});

type ViewMode = "both" | "list" | "map";

const unavailable = "cursor-not-allowed border-[#EEDFE1] bg-[#F8F9FB] text-[#6f6e78]";

function DisabledFilter({ children, reason }: { children: React.ReactNode; reason: string }) {
  return <button type="button" disabled title={reason} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] ${unavailable}`}>{children}</button>;
}

function ActiveFilter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] ${active ? "border-[#A63842] bg-[#A63842] text-white" : "border-[#EEDFE1] bg-white text-[#6f6e78] hover:bg-[#FFF1F2]"}`}>{children}</button>;
}

function SitterCardSkeleton() {
  return <div aria-hidden="true" className="grid min-w-0 animate-pulse grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-[#EEDFE1] bg-white p-3 sm:grid-cols-[72px_minmax(0,1fr)_145px] sm:gap-3.5 sm:p-3.5">
    <div className="size-16 rounded-lg bg-[#F3E9EA] sm:size-[72px]" />
    <div className="min-w-0 space-y-2 py-1">
      <div className="flex flex-wrap gap-2"><div className="h-3.5 w-28 rounded bg-[#F3E9EA]" /><div className="h-3.5 w-14 rounded-full bg-[#F3E9EA]" /></div>
      <div className="h-3 w-40 max-w-full rounded bg-[#F3E9EA]" />
      <div className="h-3 w-full rounded bg-[#F3E9EA]" />
      <div className="h-3 w-2/3 rounded bg-[#F3E9EA]" />
    </div>
    <div className="col-span-2 flex items-center justify-between border-t border-[#EEDFE1] pt-2.5 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
      <div className="space-y-2"><div className="h-2.5 w-20 rounded bg-[#F3E9EA]" /><div className="h-3.5 w-24 rounded bg-[#F3E9EA]" /></div>
      <div className="h-8 w-28 rounded-md bg-[#F3E9EA]" />
    </div>
  </div>;
}

export default function SitterDiscovery() {
  const [view, setView] = useState<ViewMode>("both");
  const [sitters, setSitters] = useState<SitterListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedSitterId, setSelectedSitterId] = useState<string | null>(null);
  const requestInProgress = useRef(false);
  const isMounted = useRef(false);

  const loadSitters = useCallback(async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/owner/sitters", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("SITTERS_REQUEST_FAILED");
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || !("sitters" in body) || !Array.isArray(body.sitters)) {
        throw new Error("SITTERS_RESPONSE_INVALID");
      }
      if (isMounted.current) setSitters(body.sitters as SitterListing[]);
    } catch {
      if (isMounted.current) setLoadError("Unable to load sitter profiles. Check your connection and try again.");
    } finally {
      requestInProgress.current = false;
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    void loadSitters();
    return () => { isMounted.current = false; };
  }, [loadSitters]);

  const views: Array<{ id: ViewMode; label: string }> = [
    { id: "both", label: "List & Map" },
    { id: "list", label: "List Only" },
    { id: "map", label: "Map Only" },
  ];

  const filteredSitters = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    const matches = sitters.filter((sitter) => {
      const textMatch = !query || [sitter.name, sitter.serviceArea]
        .some((value) => value?.toLocaleLowerCase().includes(query));
      return textMatch && (!availableOnly || sitter.isAvailable) && (minRating === 0 || (sitter.reviewCount > 0 && sitter.rating >= minRating));
    });

    return matches.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (sortBy === "name-desc") return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
      if (sortBy === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount || b.rating - a.rating;
      return 0;
    });
  }, [sitters, searchTerm, availableOnly, minRating, sortBy]);

  const hasApprovedMapLocations = sitters.some((sitter) => sitter.publicMapLocation?.approvalStatus === "approved");

  useEffect(() => {
    if (selectedSitterId && !filteredSitters.some((sitter) => sitter.id === selectedSitterId)) {
      setSelectedSitterId(null);
    }
  }, [filteredSitters, selectedSitterId]);

  const hasActiveFilters = Boolean(searchDraft.trim() || searchTerm || availableOnly || minRating > 0 || sortBy !== "recommended");
  const mapNotice = isLoading
    ? null
    : loadError
      ? "Sitter listings could not be loaded. The map is still available."
      : filteredSitters.length === 0
        ? sitters.length === 0 ? "No sitters are available yet." : "No sitters match the current search and filters."
        : !hasApprovedMapLocations
          ? "No approved public sitter locations are available yet."
          : null;
  const clearFilters = () => {
    setSearchDraft("");
    setSearchTerm("");
    setAvailableOnly(false);
    setMinRating(0);
    setSortBy("recommended");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchDraft.trim());
  };

  return <div className="min-w-0 max-w-full text-[#252630]">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[25px] font-bold tracking-[-.7px] sm:text-[30px]">Find Your Perfect Pet Sitter</h1></div>
      <div className="inline-flex items-center gap-2 rounded-full border border-[#EEDFE1] bg-white px-3 py-2 text-[11px] text-[#6f6e78]"><MapPin size={14} className="text-[#A63842]"/><span>Location details unavailable</span></div>
    </div>

    <section aria-label="Sitter search filters" className="mb-5 rounded-xl border border-[#EEDFE1] bg-white p-4 shadow-[0_2px_12px_rgba(37,38,48,.035)] sm:p-5">
      <form onSubmit={submitSearch} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1.25fr_1fr_auto]">
        <div className="min-w-0"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] text-[#6f6e78]">Service Type</span><button type="button" disabled title="No active sitter service listings are available" className={`flex h-10 w-full cursor-not-allowed items-center justify-between rounded-lg border px-3 text-left text-xs ${unavailable}`}>No services listed<ChevronDown size={14}/></button></div>
        <label className="min-w-0"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] text-[#6f6e78]">Name / Location</span><span className="flex h-10 items-center gap-2 rounded-lg border border-[#EEDFE1] bg-white px-3 focus-within:border-[#A63842] focus-within:ring-2 focus-within:ring-[#A63842]/10"><MapPin size={14} className="shrink-0 text-[#A63842]"/><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Name or service area" aria-label="Search by sitter name or service area" className="min-w-0 flex-1 bg-transparent text-xs text-[#252630] outline-none placeholder:text-[#6f6e78]" /></span></label>
        <div><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] text-[#6f6e78]">Dates / Pet</span><button type="button" disabled title="Date and pet matching is not part of this stage" className={`flex h-10 w-full cursor-not-allowed items-center gap-2 rounded-lg border px-3 text-left text-xs ${unavailable}`}><CalendarDays size={14}/>Not available yet</button></div>
        <div className="flex items-end"><button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#A63842] px-5 text-xs font-semibold text-white transition hover:bg-[#8E303A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] sm:w-auto"><Search size={14}/>Search</button></div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EEDFE1] pt-3">
        <DisabledFilter reason="No sitter pet-preference data is saved in the current profiles">Pet Type <ChevronDown size={12}/></DisabledFilter>
        <DisabledFilter reason="No active sitter services or prices are saved in the current profiles">Price Range <ChevronDown size={12}/></DisabledFilter>
        <label className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition ${minRating ? "border-[#A63842] bg-[#A63842] text-white" : "border-[#EEDFE1] bg-white text-[#6f6e78] hover:bg-[#FFF1F2]"}`}><Star size={12}/><span className="sr-only">Minimum rating</span><select aria-label="Minimum rating" value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} className="max-w-24 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#A63842]/50"><option className="text-[#252630]" value={0}>Rating</option><option className="text-[#252630]" value={1}>1+ stars</option><option className="text-[#252630]" value={2}>2+ stars</option><option className="text-[#252630]" value={3}>3+ stars</option><option className="text-[#252630]" value={4}>4+ stars</option><option className="text-[#252630]" value={5}>5 stars</option></select></label>
        <DisabledFilter reason="Sitter coordinates are not available, so distance cannot be calculated"><MapPin size={12}/>Distance</DisabledFilter>
        <ActiveFilter active={availableOnly} onClick={() => setAvailableOnly((current) => !current)}><Check size={12}/>Available Now</ActiveFilter>
        <DisabledFilter reason="No additional supported filters are available">More Filters</DisabledFilter>
        <button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className={`ml-auto h-8 rounded px-2 text-[11px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] ${hasActiveFilters ? "text-[#A63842] hover:underline" : "cursor-not-allowed text-[#6f6e78]"}`}>Clear All</button>
      </div>
    </section>

    <div className="mb-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div><h2 className="text-sm font-semibold">Sitter results</h2><p aria-live="polite" className="mt-0.5 text-[11px] text-[#6f6e78]">{isLoading ? "Loading sitter profiles" : loadError ? "Profiles could not be loaded" : sitters.length === 0 ? "No sitters are available yet" : `Showing ${filteredSitters.length} of ${sitters.length} sitters`}</p></div>
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <label className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-md border border-[#EEDFE1] bg-white px-2.5 text-[11px] text-[#6f6e78]"><ArrowDownUp size={13}/><span className="sr-only">Sort sitters</span><select aria-label="Sort sitters" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="max-w-32 bg-transparent text-[11px] text-[#252630] outline-none focus-visible:ring-2 focus-visible:ring-[#A63842]/50"><option value="recommended">Recommended</option><option value="name-asc">Name A-Z</option><option value="name-desc">Name Z-A</option><option value="rating">Highest rated</option><option value="reviews">Most reviewed</option></select></label>
        <div className="flex max-w-full flex-wrap rounded-md border border-[#EEDFE1] bg-white p-0.5" role="group" aria-label="Sitter results view">
          {views.map(({ id, label }) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)} className={`rounded px-2 py-1.5 text-[10px] font-medium transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#A63842] sm:px-2.5 ${view === id ? "bg-[#A63842] text-white" : "text-[#6f6e78] hover:bg-[#FFF1F2]"}`}>{label}</button>)}
        </div>
      </div>
    </div>

    <section aria-label="Sitter results and map" className={`grid min-w-0 gap-4 ${view === "both" ? "grid-cols-1 xl:h-[min(64vh,680px)] xl:min-h-[500px] xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]" : "grid-cols-1"}`}>
      {view !== "map" && <div className={`flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border border-[#EEDFE1] bg-white shadow-[0_2px_12px_rgba(37,38,48,.035)] ${view === "both" ? "h-[min(56vh,520px)] xl:h-auto" : "h-[min(72vh,760px)] min-h-[430px]"}`}>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
          {isLoading && <div className="space-y-3" role="status" aria-label="Loading sitter profiles" aria-live="polite"><span className="sr-only">Loading sitter profiles...</span>{Array.from({ length: 3 }, (_, index) => <SitterCardSkeleton key={index} />)}</div>}
          {!isLoading && loadError && <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center" role="alert"><span className="mb-3 grid size-11 place-items-center rounded-full bg-[#FFF1F2] text-[#A63842]"><PawPrint size={20}/></span><h3 className="text-sm font-semibold">Unable to load sitter profiles</h3><p className="mt-1.5 max-w-sm text-xs leading-5 text-[#6f6e78]">{loadError}</p><button type="button" onClick={() => void loadSitters()} disabled={isLoading} className="mt-4 rounded-md bg-[#A63842] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#8E303A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842] disabled:cursor-wait disabled:opacity-60">Retry</button></div>}
          {!isLoading && !loadError && sitters.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center" role="status" aria-live="polite"><span className="mb-3 grid size-11 place-items-center rounded-full bg-[#FFF1F2] text-[#A63842]"><PawPrint size={20}/></span><h3 className="text-sm font-semibold">No sitters are available yet</h3><p className="mt-1.5 max-w-sm text-xs leading-5 text-[#6f6e78]">Please check back later for available pet sitters.</p></div>}
          {!isLoading && !loadError && sitters.length > 0 && filteredSitters.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center" role="status" aria-live="polite"><span className="mb-3 grid size-11 place-items-center rounded-full bg-[#FFF1F2] text-[#A63842]"><PawPrint size={20}/></span><h3 className="text-sm font-semibold">No sitters match your search or filters</h3><p className="mt-1.5 max-w-sm text-xs leading-5 text-[#6f6e78]">Try changing your search, or clear your filters to see all available sitters.</p><button type="button" onClick={clearFilters} className="mt-4 rounded-md bg-[#A63842] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#8E303A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A63842]">Clear Filters</button></div>}
          {!isLoading && !loadError && filteredSitters.map((sitter) => (
            <SitterCard
              key={sitter.id}
              sitter={sitter}
              isSelected={selectedSitterId === sitter.id}
              onSelect={() => setSelectedSitterId((current) => current === sitter.id ? null : sitter.id)}
            />
          ))}
        </div>
      </div>}
      <div aria-hidden={view === "list"} className={`${view === "list" ? "hidden" : ""} relative min-h-[320px] min-w-0 overflow-hidden rounded-xl border border-[#EEDFE1] bg-white shadow-[0_2px_12px_rgba(37,38,48,.035)] ${view === "both" ? "h-[min(56vh,520px)] xl:h-auto" : "h-[min(72vh,760px)] min-h-[430px]"}`}>
        <SitterMap />
        {mapNotice && <div role={loadError ? "alert" : "status"} aria-live={loadError ? "assertive" : "polite"} className="pointer-events-none absolute bottom-10 left-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-[#EEDFE1] bg-white/95 px-3 py-2 text-center text-[11px] leading-4 text-[#6f6e78] shadow-md">
          {mapNotice}
        </div>}
      </div>
    </section>

    <section className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#EEDFE1] bg-white px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FFF1F2] text-[#A63842]"><ShieldCheck size={18}/></span><div><h2 className="text-xs font-semibold">PetSphere Care Guarantee</h2><p className="mt-1 text-[11px] leading-4 text-[#6f6e78]">Care guarantee information will be available here when approved support details are configured.</p></div></div>
      <span title="Care information is not configured yet" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#EEDFE1] px-3 text-[10px] font-medium text-[#6f6e78]"><CircleHelp size={13}/>Details unavailable</span>
    </section>
  </div>;
}
