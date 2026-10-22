import { redirect } from "next/navigation";
import { getCurrentMarketplaceSeller } from "../../../lib/session";
import MyAdsClient from "./my-ads-client";

export default async function MyAdsPage() {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) redirect("/login");
  return <MyAdsClient />;
}
