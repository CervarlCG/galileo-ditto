export class MovementsService {
  constructor(movements) {
    this.movements = movements;
  }

  /**
   * Get the credit movements report.
   * @returns {Promise<Array>}
   */
  getCredits = async ({ filter } = {}) => {
    return this.movements.filter(
      (m) => this.creditsFilterCallback(m) && (filter ? filter(m) : true)
    );
  };

  creditsFilterCallback = (m) => {
    return (
      (m.TipoTransaccion.trim().startsWith("CRE") ||
        m.TipoTransaccion.trim().startsWith("CR")) &&
      m.Estado === "A"
    );
  };

  /**
   * Get the debit movements report.
   * @returns {Promise<{total: number, totalStyled: string, count: number, details: Array, notFound: Array}>}
   */
  getDebits = async ({ filter } = {}) => {
    const debitMovements = this.movements.filter(
      (m) => this.debitsFilterCallback(m) && (filter ? filter(m) : true)
    );
    return this.getDebitsGrouped(debitMovements);
  };

  getDebitsGrouped = (movements) => {
    const debitMovementsGrouped = [];
    for (const m of movements) {
      if (
        m.DesMovimiento.startsWith("Congelado de saldo para la comisión") ||
        m.DesMovimiento.startsWith("Comisión por transacción saliente")
      )
        debitMovementsGrouped[debitMovementsGrouped.length - 1].Comision +=
          m.Monto;
      else debitMovementsGrouped.push({ ...m, Comision: 0 });
    }
    return debitMovementsGrouped;
  };

  debitsFilterCallback = (m) => {
    return (
      (m.TipoTransaccion.trim().startsWith("DEB") ||
        m.TipoTransaccion.trim().startsWith("DB")) &&
      m.Estado === "A"
    );
  };
}
