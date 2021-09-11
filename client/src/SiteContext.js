import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useHistory } from "react-router-dom";
import { LS } from "./components/Elements";
import { io } from "socket.io-client";
export const socket = io();

export const SiteContext = createContext();
export const Provider = ({ children }) => {
  const { gtag, ga } = window;
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(LS.get("userType") || "");
  const [cart, setCart] = useState(JSON.parse(LS.get("localCart")) || []);
  const [sellerCart, setSellerCart] = useState(
    JSON.parse(LS.get("localSellerCart")) || []
  );
  const [config, setConfig] = useState({});
  useEffect(() => {
    LS.set("localCart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    LS.set("localSellerCart", JSON.stringify(sellerCart));
  }, [sellerCart]);
  useEffect(() => {
    if (userType === "seller") {
      document.body.style.setProperty("--blue", `#2598b6`);
    } else {
      document.body.style.setProperty("--blue", `#3b2ab4`);
    }
    LS.set("userType", userType);
  }, [userType]);
  useEffect(() => {
    fetch("/api/siteConfig")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setConfig(data.config || {});
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    if (user) {
      gtag("set", { user_id: user._id });
      ga("set", "userId", user._id);
    }
  }, [user]);
  return (
    <SiteContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        cart,
        setCart,
        sellerCart,
        setSellerCart,
        userType,
        setUserType,
        config,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const history = useHistory();
  const { user } = useContext(SiteContext);
  const [windowFocus, setWindowFocus] = useState(true);
  const [connectedRooms, setConnectedRooms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [unread, setUnread] = useState(0);
  const effectRan = useRef(false);
  useEffect(() => {
    if (user && contacts.length === 0) {
      fetch("/api/getChat")
        .then((res) => res.json())
        .then((data) => {
          setContacts(() =>
            data
              .map((chat) => {
                const status = user.blockList?.some(
                  (item) => item === chat.client._id
                )
                  ? "blocked"
                  : chat.clientBlock
                  ? "blockedByClient"
                  : "";
                return {
                  ...chat,
                  ...(chat.client.phone && { status }),
                  unread: chat.messages.filter((msg) => {
                    return new Date(msg.createdAt) > new Date(chat.lastSeen);
                  }).length,
                };
              })
              .sort((a, b) => {
                if (
                  new Date(a.messages[a.messages.length - 1]?.createdAt) >
                  new Date(b.messages[b.messages.length - 1]?.createdAt)
                ) {
                  return -1;
                } else {
                  return 1;
                }
              })
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [user]);
  useEffect(() => {
    const focusHandler = (e) => setWindowFocus(true);
    const blurHandler = (e) => setWindowFocus(false);
    window.addEventListener("focus", focusHandler);
    window.addEventListener("blur", blurHandler);
    return () => {
      window.removeEventListener("focus", focusHandler);
      window.removeEventListener("blur", blurHandler);
    };
  }, []);
  useEffect(() => {
    if (!effectRan.current && user) {
      socket.on("connect", () => {
        console.log("connected");
      });
      socket.on("disconnect", () => {
        console.log("disconnected from socket");
      });
      socket.on(
        "connectedToRoom",
        ({ rooms, newChat, client, clientRoom_id }) => {
          if (newChat) {
            setContacts((prev) =>
              prev.map((chat) => {
                if (chat.client._id === client) {
                  return {
                    ...chat,
                    _id: clientRoom_id,
                  };
                } else {
                  return chat;
                }
              })
            );
          }
          setRooms(rooms);
        }
      );
      socket.on("messageToUser", (payload) => {
        const focus =
          setWindowFocus &&
          history.location.pathname.replace("/account/deals/", "") ===
            payload.from;
        if (payload.from) {
          setContacts((prev) => {
            const newContacts = prev
              .map((chat) => {
                const newMessages = [
                  ...chat.messages,
                  { ...payload, createdAt: new Date(), updatedAt: new Date() },
                ];
                if (payload.from === user?._id) {
                  if (chat.client._id === payload.to) {
                    return {
                      ...chat,
                      lastSeen: new Date().toISOString(),
                      unread: null,
                      messages: newMessages,
                    };
                  }
                } else {
                  if (chat.client._id === payload.from) {
                    return {
                      ...chat,
                      messages: newMessages,
                      unread: newMessages.filter(
                        (msg) =>
                          new Date(msg.createdAt) > new Date(chat.lastSeen)
                      ).length,
                    };
                  }
                }
                return chat;
              })
              .sort((a, b) =>
                new Date(a.messages[a.messages.length - 1]?.createdAt) >
                new Date(b.messages[b.messages.length - 1]?.createdAt)
                  ? -1
                  : 1
              );
            return newContacts;
          });
          if (!focus) {
            socket.emit("clientAway", payload);
          }
        }
      });
      socket.on("newChat", (payload) => {
        setContacts((prev) => {
          return [
            { ...payload.chat },
            ...prev.filter(({ _id }) => _id !== payload.chat?._id),
          ];
        });
      });
      effectRan.current = true;
    }
  }, [user]);
  useEffect(() => {
    if (contacts.map((room) => room._id).join("") !== connectedRooms.join("")) {
      socket.emit("joinRooms", { rooms: contacts.map((room) => room._id) });
      setConnectedRooms(contacts.map((room) => room._id));
    }
  }, [contacts]);
  useEffect(() => {
    setUnread(contacts.reduce((a, c) => a + c.unread, 0));
  }, [contacts]);
  return (
    <ChatContext.Provider
      value={{
        contacts,
        setContacts,
        unread,
        rooms,
        setRooms,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
