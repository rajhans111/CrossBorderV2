export interface Buyer {
  id: string;
  name: string;
  country: string;
  email: string;
  contactId: string;
  /** Unguessable token for the buyer's cross-order workspace (all their orders, one link). */
  portalToken: string;
}
