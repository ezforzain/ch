import MarketplaceSection from '../components/marketplace/MarketplaceSection';

/** /marketplace — the full filterable product grid, previously embedded mid-page on
 * Home. Thin on purpose: all the actual state/logic lives in MarketplaceSection so it
 * can be reused as-is; Home now shows a small MarketplaceTeaser instead of this. */
export default function Marketplace() {
  return <MarketplaceSection />;
}
