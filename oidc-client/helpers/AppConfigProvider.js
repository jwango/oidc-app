import { createContext, useContext } from "react";

const appConfig = {
  gatewayUrl: "http://localhost:8080"
};

export const AppConfigContext = createContext(appConfig);
export const useAppConfig = () => useContext(AppConfigContext);
