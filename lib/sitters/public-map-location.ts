/**
 * Server-side record shape for a sitter's proposed public map location.
 * This is only a type/API boundary until persistent sitter consent is added.
 */
export type PublicMapLocationRecord = {
  sitterId: string;
  publicAreaLabel: string;
  approximateLatitude: number;
  approximateLongitude: number;
  approvalStatus: "pending" | "approved" | "withdrawn";
  approvalTimestamp: string | null;
  withdrawalTimestamp: string | null;
};

/** Only this approved, active shape may be returned to the owner-facing UI. */
export type ApprovedPublicMapLocation = {
  sitterId: string;
  publicAreaLabel: string;
  approximateLatitude: number;
  approximateLongitude: number;
  approvalStatus: "approved";
  approvalTimestamp: string;
  withdrawalTimestamp: null;
};

/**
 * Fail closed: pending, withdrawn, malformed, or unapproved locations never
 * become map data. A missing record also serializes to null.
 */
export function toApprovedPublicMapLocation(
  record: PublicMapLocationRecord | null | undefined,
): ApprovedPublicMapLocation | null {
  const approvalTimestamp = record?.approvalTimestamp;

  if (
    !record ||
    record.approvalStatus !== "approved" ||
    !approvalTimestamp ||
    record.withdrawalTimestamp ||
    !record.publicAreaLabel.trim() ||
    !Number.isFinite(record.approximateLatitude) ||
    record.approximateLatitude < -90 ||
    record.approximateLatitude > 90 ||
    !Number.isFinite(record.approximateLongitude) ||
    record.approximateLongitude < -180 ||
    record.approximateLongitude > 180
  ) {
    return null;
  }

  return {
    sitterId: record.sitterId,
    publicAreaLabel: record.publicAreaLabel.trim(),
    approximateLatitude: record.approximateLatitude,
    approximateLongitude: record.approximateLongitude,
    approvalStatus: "approved",
    approvalTimestamp,
    withdrawalTimestamp: null,
  };
}
