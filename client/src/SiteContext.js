import React, { createContext, useState, useEffect } from "react";
import { SS } from "./components/Elements";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cart, setCart] = useState(JSON.parse(SS.get("localCart")) || []);
  useEffect(() => {
    SS.set("localCart", JSON.stringify(cart));
  }, [cart]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        cart,
        setCart,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
