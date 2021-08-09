import React, { createContext, useState, useEffect } from "react";
import { LS } from "./components/Elements";

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(LS.get("userType"));
  const [cart, setCart] = useState(JSON.parse(LS.get("localCart")) || []);
  useEffect(() => {
    LS.set("localCart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (userType === "seller") {
      document.body.style.setProperty("--blue", `#2598b6`);
    } else {
      document.body.style.setProperty("--blue", `#3b2ab4`);
    }
    LS.set("userType", userType);
  }, [userType]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        cart,
        setCart,
        userType,
        setUserType,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};
