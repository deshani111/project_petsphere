import type { ReactNode } from "react";

type AsyncStateProps = {
  status: "loading" | "empty" | "error";
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
};

/** A consistent, announced state for data-backed dashboard panels. */
export function AsyncState({ status, title, message, onRetry, action }: AsyncStateProps) {
  const isError = status === "error";
  return (
    <div className={`async-state async-state--${status}`} role={isError ? "alert" : "status"} aria-live={isError ? "assertive" : "polite"}>
      {title ? <strong>{title}</strong> : null}
      <p>{message}</p>
      <div className="async-state__actions">
        {onRetry ? <button type="button" onClick={onRetry}>Try again</button> : null}
        {action}
      </div>
    </div>
  );
}
