import { getCCFClient } from "../../infrastructure/prosoft.js";

export class ProsoftMovements {
  async list(ccfAccount, { page, startDate, endDate } = {}) {
    const client = getCCFClient();
    const response = await client.post("/ObtenerMovimientos", {
      NumCuentaCCF: ccfAccount,
      Pagina: page,
      FechaInicial: startDate || undefined,
      FechaFinal: endDate || undefined,
    });

    return response.data;
  }

  async listAll(ccfAccount, { startDate, endDate } = {}) {
    let allMovements = [];
    let page = 1;
    let response = undefined;
    do {
      response = await this.list(ccfAccount, {
        page,
        startDate,
        endDate,
      }).catch(() => ({ Movimientos: [] }));
      allMovements = allMovements.concat(response.Movimientos);
      page++;
    } while (response.Movimientos.length);
    return allMovements;
  }
}
