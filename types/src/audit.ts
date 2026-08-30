export type AuditActor = "exporter" | "buyer" | "system" | "mock_bank" | "seed" | "ops";

export interface AuditEvent {
  id: string;
  when: string;
  event: string;
  actor: AuditActor;
  entity: string;
  privileged: boolean;
  /** State immediately before this event, when applicable (e.g. prior status). */
  beforeState?: Record<string, unknown>;
  /** State immediately after this event. */
  afterState?: Record<string, unknown>;
  /** What justified the action — a document reference, a dispute reason, etc. */
  evidence?: string;
}
