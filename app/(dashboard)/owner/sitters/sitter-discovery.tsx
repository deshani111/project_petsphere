
"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent, ReactNode } from "react";

import {
  ArrowDownUp,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import { SitterCard, type SitterListing } from "./sitter-card";

const SitterMap = dynamic(() => import("./sitter-map"), {
  ssr: false,
  loading: () => (
    <div
      className="grid h-full min-h-80 place-items-center bg-(--ps-color-surface-muted) text-xs ps-text-muted"
      role="status"
    >
      Loading map...
    </div>
  ),
});

type ViewMode = "both" | "list" | "map";

const unavailable =
  "cursor-not-allowed border-[var(--ps-color-border)] bg-[var(--ps-color-surface-muted)] ps-text-muted";

function DisabledFilter({
  children,
  reason,
}: {
  children: ReactNode;
  reason: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={reason}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] ${unavailable}`}
    >
      {children}
    </button>
  );
}

function ActiveFilter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition focus-visible:outline focus-visible:outline-offset-2 ${
        active
          ? "border-(--ps-color-primary) bg-(--ps-color-primary) text-white"
          : "border-(--ps-color-border) bg-(--ps-color-surface) ps-text-muted hover:bg-(--ps-color-primary-soft)"
      }`}
    >
      {children}
    </button>
  );
}

function SitterCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="ps-card grid min-w-0 animate-pulse grid-cols-[64px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[72px_minmax(0,1fr)_145px] sm:gap-3.5 sm:p-3.5"
    >
      <div className="size-16 rounded-lg bg-(--ps-color-surface-muted) sm:size-18" />

      <div className="min-w-0 space-y-2 py-1">
        <div className="flex flex-wrap gap-2">
          <div className="h-3.5 w-28 rounded bg-(--ps-color-surface-muted)" />
          <div className="h-3.5 w-14 rounded-full bg-(--ps-color-surface-muted)" />
        </div>

        <div className="h-3 w-40 max-w-full rounded bg-(--ps-color-surface-muted)" />
        <div className="h-3 w-full rounded bg-(--ps-color-surface-muted)" />
        <div className="h-3 w-2/3 rounded bg-(--ps-color-surface-muted)" />
      </div>

      <div className="col-span-2 flex items-center justify-between border-t border-(--ps-color-border) pt-2.5 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
        <div className="space-y-2">
          <div className="h-2.5 w-20 rounded bg-(--ps-color-surface-muted)" />
          <div className="h-3.5 w-24 rounded bg-(--ps-color-surface-muted)" />
        </div>

        <div className="h-8 w-28 rounded-md bg-(--ps-color-surface-muted)" />
      </div>
    </div>
  );
}

export default function SitterDiscovery() {
  const [view, setView] = useState<ViewMode>("both");
  const [sitters, setSitters] = useState<SitterListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedSitterId, setSelectedSitterId] = useState<string | null>(
    null
  );

  const requestInProgress = useRef(false);
  const isMounted = useRef(false);

  const loadSitters = useCallback(async () => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    try {
      const response = await fetch("/api/owner/sitters", {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("SITTERS_REQUEST_FAILED");
      }

      const body: unknown = await response.json();

      if (
        !body ||
        typeof body !== "object" ||
        !("sitters" in body) ||
        !Array.isArray(body.sitters)
      ) {
        throw new Error("SITTERS_RESPONSE_INVALID");
      }

      if (isMounted.current) {
        setSitters(body.sitters as SitterListing[]);
        setLoadError("");
      }
    } catch {
      if (isMounted.current) {
        setLoadError(
          "Unable to load sitter profiles. Check your connection and try again."
        );
      }
    } finally {
      requestInProgress.current = false;

      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const timeout = window.setTimeout(() => {
      void loadSitters();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      isMounted.current = false;
    };
  }, [loadSitters]);

  const views: Array<{ id: ViewMode; label: string }> = [
    { id: "both", label: "List & Map" },
    { id: "list", label: "List Only" },
    { id: "map", label: "Map Only" },
  ];

  // Build the service filter options from the loaded sitter profiles.
  const serviceOptions = useMemo(() => {
    return Array.from(
      new Set(
        sitters.flatMap((sitter) =>
          (sitter.services ?? [])
            .map((service) => service.name.trim())
            .filter(Boolean)
        )
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [sitters]);

  // Apply search, service, availability and rating filters.
  const filteredSitters = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();

    const matches = sitters.filter((sitter) => {
      const textMatch =
        !query ||
        [sitter.name, sitter.serviceArea].some((value) =>
          value?.toLocaleLowerCase().includes(query)
        );

      const serviceMatch =
        !selectedService ||
        (sitter.services ?? []).some(
          (service) => service.name === selectedService
        );

      return (
        textMatch &&
        serviceMatch &&
        (!availableOnly || sitter.isAvailable) &&
        (minRating === 0 ||
          (sitter.reviewCount > 0 && sitter.rating >= minRating))
      );
    });

    return matches.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      }

      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name, undefined, {
          sensitivity: "base",
        });
      }

      if (sortBy === "rating") {
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      }

      if (sortBy === "reviews") {
        return b.reviewCount - a.reviewCount || b.rating - a.rating;
      }

      return 0;
    });
  }, [
    sitters,
    searchTerm,
    selectedService,
    availableOnly,
    minRating,
    sortBy,
  ]);

  const hasApprovedMapLocations = sitters.some(
    (sitter) =>
      sitter.publicMapLocation?.approvalStatus === "approved"
  );

  const activeSelectedSitterId = filteredSitters.some(
    (sitter) => sitter.id === selectedSitterId
  )
    ? selectedSitterId
    : null;

  const hasActiveFilters = Boolean(
    searchDraft.trim() ||
      searchTerm ||
      selectedService ||
      availableOnly ||
      minRating > 0 ||
      sortBy !== "recommended"
  );

  const mapNotice = isLoading
    ? null
    : loadError
      ? "Sitter listings could not be loaded. The map is still available."
      : filteredSitters.length === 0
        ? sitters.length === 0
          ? "No sitters are available yet."
          : "No sitters match the current search and filters."
        : !hasApprovedMapLocations
          ? "No approved public sitter locations are available yet."
          : null;

  const clearFilters = () => {
    setSearchDraft("");
    setSearchTerm("");
    setSelectedService("");
    setAvailableOnly(false);
    setMinRating(0);
    setSortBy("recommended");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchDraft.trim());
  };

  return (
    <div className="ps-page min-w-0 max-w-full">
      {/* Page heading */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-[-.7px] sm:text-[30px]">
            Find Your Perfect Pet Sitter
          </h1>
        </div>

        <div className="ps-badge border border-(--ps-color-border) bg-(--ps-color-surface) ps-text-muted">
          <MapPin size={14} className="ps-text-primary" />
          <span>Location details unavailable</span>
        </div>
      </div>

      {/* Search and filters */}
      <section
        aria-label="Sitter search filters"
        className="ps-card mb-5 p-4 sm:p-5"
      >
        <form
          onSubmit={submitSearch}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1.25fr_1fr_auto]"
        >
          <div className="min-w-0">
            <label
              htmlFor="sitter-service-type"
              className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] ps-text-muted"
            >
              Service Type
            </label>

            <select
              id="sitter-service-type"
              value={selectedService}
              onChange={(event) =>
                setSelectedService(event.target.value)
              }
              disabled={serviceOptions.length === 0}
              className="h-10 w-full rounded-lg border border-(--ps-color-border) bg-(--ps-color-surface) px-3 text-xs ps-text-default outline-none focus:border-(--ps-color-primary) disabled:cursor-not-allowed disabled:bg-(--ps-color-surface-muted)"
            >
              <option value="">
                {serviceOptions.length === 0
                  ? "No services listed"
                  : "All Services"}
              </option>

              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <label className="min-w-0">
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] ps-text-muted">
              Name / Location
            </span>

            <span className="flex h-10 items-center gap-2 rounded-lg border border-(--ps-color-border) bg-(--ps-color-surface) px-3 focus-within:border-(--ps-color-primary) focus-within:ring-2 focus-within:ring-(--ps-color-primary)/10">
              <MapPin
                size={14}
                className="shrink-0 ps-text-primary"
              />

              <input
                value={searchDraft}
                onChange={(event) =>
                  setSearchDraft(event.target.value)
                }
                placeholder="Name or service area"
                aria-label="Search by sitter name or service area"
                className="min-w-0 flex-1 bg-transparent text-xs ps-text-default outline-none placeholder:ps-text-muted"
              />
            </span>
          </label>

          <div>
            <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] ps-text-muted">
              Dates / Pet
            </span>

            <button
              type="button"
              disabled
              title="Date and pet matching is not part of this stage"
              className={`flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-xs ${unavailable}`}
            >
              <CalendarDays size={14} />
              Not available yet
            </button>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="ps-btn ps-btn--primary w-full px-5 sm:w-auto"
            >
              <Search size={14} />
              Search
            </button>
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-(--ps-color-border) pt-3">
          <DisabledFilter reason="No sitter pet-preference data is saved in the current profiles">
            Pet Type <ChevronDown size={12} />
          </DisabledFilter>

          <DisabledFilter reason="No active sitter services or prices are saved in the current profiles">
            Price Range <ChevronDown size={12} />
          </DisabledFilter>

          <label
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] transition ${
              minRating
                ? "border-(--ps-color-primary) bg-(--ps-color-primary) text-white"
                : "border-(--ps-color-border) bg-(--ps-color-surface) ps-text-muted hover:bg-(--ps-color-primary-soft)"
            }`}
          >
            <Star size={12} />
            <span className="sr-only">Minimum rating</span>

            <select
              aria-label="Minimum rating"
              value={minRating}
              onChange={(event) =>
                setMinRating(Number(event.target.value))
              }
              className="max-w-24 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-(--ps-color-primary)/50"
            >
              <option className="text-[#252630]" value={0}>
                Rating
              </option>
              <option className="text-[#252630]" value={1}>
                1+ stars
              </option>
              <option className="text-[#252630]" value={2}>
                2+ stars
              </option>
              <option className="text-[#252630]" value={3}>
                3+ stars
              </option>
              <option className="text-[#252630]" value={4}>
                4+ stars
              </option>
              <option className="text-[#252630]" value={5}>
                5 stars
              </option>
            </select>
          </label>

          <DisabledFilter reason="Sitter coordinates are not available, so distance cannot be calculated">
            <MapPin size={12} />
            Distance
          </DisabledFilter>

          <ActiveFilter
            active={availableOnly}
            onClick={() =>
              setAvailableOnly((current) => !current)
            }
          >
            <Check size={12} />
            Available Now
          </ActiveFilter>

          <DisabledFilter reason="No additional supported filters are available">
            More Filters
          </DisabledFilter>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`ml-auto h-8 rounded px-2 text-[11px] font-medium focus-visible:outline focus-visible:outline-offset-2 ${
              hasActiveFilters
                ? "ps-text-primary hover:underline"
                : "cursor-not-allowed ps-text-muted"
            }`}
          >
            Clear All
          </button>
        </div>
      </section>

      {/* Results heading and view controls */}
      <div className="mb-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold ps-text-default">
            Sitter results
          </h2>

          <p
            aria-live="polite"
            className="mt-0.5 text-[11px] ps-text-muted"
          >
            {isLoading
              ? "Loading sitter profiles"
              : loadError
                ? "Profiles could not be loaded"
                : sitters.length === 0
                  ? "No sitters are available yet"
                  : `Showing ${filteredSitters.length} of ${sitters.length} sitters`}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <label className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-md border border-(--ps-color-border) bg-(--ps-color-surface) px-2.5 text-[11px] ps-text-muted">
            <ArrowDownUp size={13} />
            <span className="sr-only">Sort sitters</span>

            <select
              aria-label="Sort sitters"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="max-w-32 bg-transparent text-[11px] ps-text-default outline-none focus-visible:ring-2 focus-visible:ring-(--ps-color-primary)/50"
            >
              <option value="recommended">Recommended</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
            </select>
          </label>

          <div
            className="flex max-w-full flex-wrap rounded-md border border-(--ps-color-border) bg-(--ps-color-surface) p-0.5"
            role="group"
            aria-label="Sitter results view"
          >
            {views.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`rounded px-2 py-1.5 text-[10px] font-medium transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-offset-1 sm:px-2.5 ${
                  view === id
                    ? "bg-(--ps-color-primary) text-white"
                    : "ps-text-muted hover:bg-(--ps-color-primary-soft)"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sitter cards and map */}
      <section
        aria-label="Sitter results and map"
        className={`grid min-w-0 gap-4 ${
          view === "both"
            ? "grid-cols-1 xl:h-[min(64vh,680px)] xl:min-h-125 xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]"
            : "grid-cols-1"
        }`}
      >
        {view !== "map" && (
          <div
            className={`ps-panel flex min-h-80 min-w-0 flex-col overflow-hidden ${
              view === "both"
                ? "h-[min(56vh,520px)] xl:h-auto"
                : "h-[min(72vh,760px)] min-h-107.5"
            }`}
          >
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
              {isLoading && (
                <div
                  className="space-y-3"
                  role="status"
                  aria-label="Loading sitter profiles"
                  aria-live="polite"
                >
                  <span className="sr-only">
                    Loading sitter profiles...
                  </span>

                  {Array.from({ length: 3 }, (_, index) => (
                    <SitterCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {!isLoading && loadError && (
                <div
                  className="flex min-h-64 flex-col items-center justify-center px-5 text-center"
                  role="alert"
                >
                  <span className="mb-3 grid size-11 place-items-center rounded-full bg-(--ps-color-primary-soft) ps-text-primary">
                    <PawPrint size={20} />
                  </span>

                  <h3 className="text-sm font-semibold ps-text-default">
                    Unable to load sitter profiles
                  </h3>

                  <p className="mt-1.5 max-w-sm text-xs leading-5 ps-text-muted">
                    {loadError}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setLoadError("");
                      void loadSitters();
                    }}
                    disabled={isLoading}
                    className="ps-btn ps-btn--primary mt-4 px-3 py-2 text-[10px] disabled:cursor-wait disabled:opacity-60"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !loadError && sitters.length === 0 && (
                <div
                  className="flex min-h-64 flex-col items-center justify-center px-5 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <span className="mb-3 grid size-11 place-items-center rounded-full bg-(--ps-color-primary-soft) ps-text-primary">
                    <PawPrint size={20} />
                  </span>

                  <h3 className="text-sm font-semibold ps-text-default">
                    No sitters are available yet
                  </h3>

                  <p className="mt-1.5 max-w-sm text-xs leading-5 ps-text-muted">
                    Please check back later for available pet sitters.
                  </p>
                </div>
              )}

              {!isLoading &&
                !loadError &&
                sitters.length > 0 &&
                filteredSitters.length === 0 && (
                  <div
                    className="flex min-h-64 flex-col items-center justify-center px-5 text-center"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="mb-3 grid size-11 place-items-center rounded-full bg-(--ps-color-primary-soft) ps-text-primary">
                      <PawPrint size={20} />
                    </span>

                    <h3 className="text-sm font-semibold ps-text-default">
                      No sitters match your search or filters
                    </h3>

                    <p className="mt-1.5 max-w-sm text-xs leading-5 ps-text-muted">
                      Try changing your search, or clear your filters to see
                      all available sitters.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ps-btn ps-btn--primary mt-4 px-3 py-2 text-[10px]"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

              {!isLoading &&
                !loadError &&
                filteredSitters.map((sitter) => (
                  <SitterCard
                    key={sitter.id}
                    sitter={sitter}
                    isSelected={activeSelectedSitterId === sitter.id}
                    onSelect={() =>
                      setSelectedSitterId((current) =>
                        current === sitter.id ? null : sitter.id
                      )
                    }
                  />
                ))}
            </div>
          </div>
        )}

        {view !== "list" && (
          <div
            aria-hidden={false}
            className={`ps-panel relative min-h-80 min-w-0 overflow-hidden ${
              view === "both"
                ? "h-[min(56vh,520px)] xl:h-auto"
                : "h-[min(72vh,760px)] min-h-107.5"
            }`}
          >
            <SitterMap />

            {mapNotice && (
              <div
                role={loadError ? "alert" : "status"}
                aria-live={loadError ? "assertive" : "polite"}
                className="pointer-events-none absolute bottom-10 left-1/2 z-1000 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-(--ps-color-border) bg-(--ps-color-surface)/95 px-3 py-2 text-center text-[11px] leading-4 ps-text-muted shadow-md"
              >
                {mapNotice}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Care guarantee information */}
      <section className="ps-card mt-4 flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--ps-color-primary-soft) ps-text-primary">
            <ShieldCheck size={18} />
          </span>

          <div>
            <h2 className="text-xs font-semibold ps-text-default">
              PetSphere Care Guarantee
            </h2>

            <p className="mt-1 text-[11px] leading-4 ps-text-muted">
              Care guarantee information will be available here when
              approved support details are configured.
            </p>
          </div>
        </div>

        <span
          title="Care information is not configured yet"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--ps-color-border) px-3 text-[10px] font-medium ps-text-muted"
        >
          <CircleHelp size={13} />
          Details unavailable
        </span>
      </section>
    </div>
  );
}
