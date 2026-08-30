import { mockEscrowService } from "./mocks/mockEscrowService.js";
import { mockFxService } from "./mocks/mockFxService.js";
import { mockComplianceService } from "./mocks/mockComplianceService.js";
import { mockKycService } from "./mocks/mockKycService.js";
import { consoleNotifier } from "./mocks/consoleNotifier.js";
import { createMockPaymentGateway } from "./mocks/mockPaymentGateway.js";

export const services = {
  escrowService: mockEscrowService,
  fxService: mockFxService,
  complianceService: mockComplianceService,
  kycService: mockKycService,
  notifier: consoleNotifier,
  paymentGateway: createMockPaymentGateway(mockEscrowService),
};

export type Services = typeof services;
