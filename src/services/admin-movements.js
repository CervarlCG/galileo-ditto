import { MovementsService } from "./movements.js";

export class AdminMovementsService {
  constructor(movements) {
    this.movementsService = new MovementsService(movements);
  }

  getFeeCredits = async () => {
    return this.movementsService.getCredits({
      filter: (m) =>
        (m.DesMovimiento.startsWith("Comisión por transacción saliente") ||
          m.DesMovimiento.startsWith("Congelado de saldo para la comisión")) &&
        m.Estado === "A",
    });
  };

  getCredits = async () => {
    return this.movementsService.getCredits({
      filter: (m) =>
        !m.DesMovimiento.startsWith("Comisión por transacción saliente"),
    });
  };

  getDebits = async () => {
    return this.movementsService.getDebits();
  };
}
