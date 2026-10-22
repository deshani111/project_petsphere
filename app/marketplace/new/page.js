import { redirect } from "next/navigation";
import { getCurrentMarketplaceSeller } from "../../../lib/session";
import NewMarketplaceAdPage from "../../owner/marketplace/new/page";

export default async function MarketplaceAdPage() {
  const seller = await getCurrentMarketplaceSeller();
  if (!seller) redirect("/login");
  return <NewMarketplaceAdPage sellerRole={seller.role} marketplaceShell />;
}
