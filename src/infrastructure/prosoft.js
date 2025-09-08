import axios from "axios";
import { config } from "./config.js";

export function getCCFClient() {
  const ccfClient = axios.create({
    baseURL: config.env.PROSOFT_CCF_BASE_URL || "",
  });

  ccfClient.interceptors.request.use((axiosConfig) => {
    axiosConfig.headers["Content-Type"] = "application/json";
    axiosConfig.data = {
      ...axiosConfig.data,
      Contexto: {
        HostId: config.env.PROSOFT_CCF_HOST_ID,
        CodUsuario: "ditto-cli",
      },
    };
    return axiosConfig;
  });

  return ccfClient;
}
