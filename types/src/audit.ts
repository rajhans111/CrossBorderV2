export type AuditActor = "exporter" | "buyer" | "system" | "mock_bank" | "seed" | "ops";

export interface AuditEvent {
  id: string;
  when: string;
  event: string;
  actor: AuditActor;
  entity: string;
  privileged: boolean;
}
