import { getCCFClient } from "../../infrastructure/prosoft.js";

export class ProsoftMovements {
  async list(ccfAccount, page = 1) {
    const client = getCCFClient();
    const response = await client.post("/ObtenerMovimientos", {
      NumCuentaCCF: ccfAccount,
      Pagina: page,
      FechaInicial: "2025-07-01T20:39:56.155Z",
      FechaFinal: "2025-09-30T20:39:56.155Z",
    });

    return response.data;
  }

  async listAll(ccfAccount) {
    let allMovements = [];
    let page = 1;
    let response = undefined;
    do {
      response = await this.list(ccfAccount, page);
      allMovements = allMovements.concat(response.Movimientos);
      page++;
    } while (response.Resultado && response.Movimientos.length);
    return allMovements;
  }
}
