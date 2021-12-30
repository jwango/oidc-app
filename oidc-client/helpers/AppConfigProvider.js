import { createContext } from "react";

const appConfig = {
  gatewayUrl: "http://localhost:8080"
};

export const AppConfigContext = createContext(appConfig);
