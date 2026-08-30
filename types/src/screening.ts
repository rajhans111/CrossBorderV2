export type ScreeningStatus = "Needs_review" | "Cleared" | "Blocked";

export interface ScreeningCase {
  id: string;
  entityName: string;
  list: string;
  status: ScreeningStatus;
  note: string;
}
