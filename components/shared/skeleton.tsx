import type { CSSProperties } from "react";

type SkeletonProps = {
  className?: string;
  height?: string | number;
  width?: string | number;
};

const styleFor = ({ height, width }: SkeletonProps): CSSProperties => ({ height, width });

/** Accessible visual placeholder primitives for data that is still being retrieved. */
export function Skeleton({ className = "", height, width }: SkeletonProps) {
  return <span aria-hidden="true" className={`ps-skeleton ${className}`} style={styleFor({ height, width })} />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return <div aria-hidden="true" className={`ps-skeleton-text ${className}`}>{Array.from({ length: lines }, (_, index) => <Skeleton key={index} width={index === lines - 1 ? "68%" : "100%"} />)}</div>;
}

export function SkeletonCircle({ size = "3rem", className = "" }: { size?: string | number; className?: string }) {
  return <Skeleton className={`ps-skeleton--circle ${className}`} height={size} width={size} />;
}

export function SkeletonButton({ width = "7rem", className = "" }: { width?: string | number; className?: string }) {
  return <Skeleton className={`ps-skeleton--button ${className}`} width={width} />;
}

export function SkeletonCard({ className = "", image = true }: { className?: string; image?: boolean }) {
  return <article aria-hidden="true" className={`ps-skeleton-card ${className}`}>{image ? <Skeleton className="ps-skeleton-card__image" /> : null}<div className="ps-skeleton-card__body"><div className="ps-skeleton-row"><Skeleton width="42%" /><Skeleton width="25%" /></div><SkeletonText lines={2} /><SkeletonButton /></div></article>;
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }: { rows?: number; columns?: number; className?: string }) {
  return <div aria-hidden="true" className={`ps-skeleton-table ${className}`} style={{ "--skeleton-columns": columns } as CSSProperties}><div className="ps-skeleton-table__row ps-skeleton-table__head">{Array.from({ length: columns }, (_, index) => <Skeleton key={index} />)}</div>{Array.from({ length: rows }, (_, row) => <div className="ps-skeleton-table__row" key={row}>{Array.from({ length: columns }, (_, column) => <Skeleton key={column} width={column === columns - 1 ? "62%" : "100%"} />)}</div>)}</div>;
}

export function SkeletonForm({ fields = 4, className = "" }: { fields?: number; className?: string }) {
  return <div aria-hidden="true" className={`ps-skeleton-form ${className}`}>{Array.from({ length: fields }, (_, index) => <div key={index}><Skeleton width="34%" height=".75rem" /><Skeleton height="2.75rem" /></div>)}<SkeletonButton width="9rem" /></div>;
}

export function SkeletonPage({ variant = "cards", title = true }: { variant?: "cards" | "table" | "form" | "dashboard" | "article" | "profile" | "listing"; title?: boolean }) {
  return <main className={`ps-skeleton-page ps-skeleton-page--${variant}`} aria-busy="true" aria-label="Loading content"><span className="sr-only">Loading content…</span>{title ? <header className="ps-skeleton-page__heading"><Skeleton width="min(18rem, 62%)" height="2rem" /><Skeleton width="min(30rem, 90%)" /></header> : null}{variant === "dashboard" ? <><div className="ps-skeleton-stats">{Array.from({ length: 4 }, (_, index) => <SkeletonCard image={false} key={index} />)}</div><div className="ps-skeleton-dashboard"><SkeletonCard image={false} /><SkeletonTable rows={4} columns={4} /></div></> : null}{variant === "table" ? <><div className="ps-skeleton-toolbar"><Skeleton height="2.75rem" width="min(20rem, 100%)" /><SkeletonButton /></div><SkeletonTable /></> : null}{variant === "form" ? <SkeletonForm /> : null}{variant === "cards" || variant === "listing" ? <><div className="ps-skeleton-toolbar"><Skeleton height="2.75rem" width="min(20rem, 100%)" /><SkeletonButton /></div><div className="ps-skeleton-grid">{Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}</div></> : null}{variant === "article" ? <article className="ps-skeleton-article"><Skeleton width="7rem" /><Skeleton width="92%" height="3.5rem" /><Skeleton width="70%" height="1rem" /><Skeleton className="ps-skeleton-article__cover" /><SkeletonText lines={6} /></article> : null}{variant === "profile" ? <div className="ps-skeleton-profile"><div className="ps-skeleton-profile__header"><SkeletonCircle size="5rem" /><div><Skeleton width="12rem" height="1.5rem" /><Skeleton width="16rem" /></div></div><SkeletonForm fields={5} /></div> : null}</main>;
}
