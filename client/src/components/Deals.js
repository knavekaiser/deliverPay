import { useState, useEffect, useContext, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { SiteContext } from "../SiteContext";
import Moment from "react-moment";
import { Modal } from "./Modal";
import moment from "moment";
import { io } from "socket.io-client";
import { MilestoneForm } from "./Account";

const socket = io();

const Deals = ({ history, location, match }) => {
  const { user, setUser } = useContext(SiteContext);
  const [contacts, setContacts] = useState([]);
  const [userCard, setUserCard] = useState(null);
  const [chat, setChat] = useState(null);
  useEffect(() => {
    if (userCard) {
      setChat(userCard?.messages);
      socket.emit("initiateChat", { client_id: userCard?._id });
    }
  }, [userCard]);
  useEffect(() => {
    fetch("/api/getChat")
      .then((res) => res.json())
      .then((data) => {
        setContacts(() =>
          data.map((chat) => {
            const status = "";
            return {
              ...chat,
              ...(status && { status: status.status }),
            };
          })
        );
        history.push();
      })
      .catch((err) => {
        console.log(err);
      });
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("disconnect", () => {
      console.log("disconnected from socket");
    });
  }, []);
  useEffect(() => {
    if (match.params.phone) {
      const person = contacts.find(
        (chat) => chat.client.phone === match.params.phone
      );
      if (person) {
        const { client, messages, status } = person;
        setUserCard({ ...client, status, messages });
      }
    }
  }, [match.params, contacts]);
  useEffect(() => {
    socket.on("messageToUser", (payload) => {
      if (payload.from) {
        setContacts((prev) => {
          const newContacts = prev.map((chat) => {
            if (payload.from === user._id) {
              if (chat.client._id === payload.to) {
                return {
                  ...chat,
                  messages: [...chat.messages, payload],
                };
              }
            } else {
              if (chat.client._id === payload.from) {
                return {
                  ...chat,
                  messages: [...chat.messages, payload],
                };
              }
            }
            return chat;
          });
          return newContacts;
        });
      }
    });
    socket.emit("joinRooms", {
      rooms: contacts.map((room) => room._id),
    });
  }, []);
  return (
    <div className="chatContainer">
      <div className="contactsContainer">
        <div className="userCard">
          {userCard ? (
            <>
              <div className="profile">
                <img src={userCard.profileImg} />
                <div className="details">
                  <p className="name">
                    {userCard.firstName + " " + userCard.lastName}
                  </p>
                  <a
                    className="phone"
                    href={`tel:${userCard.phone}`}
                    className="phone"
                  >
                    {userCard.phone}
                  </a>
                  <a href={`mailto:${userCard.email}`} className="email">
                    {userCard.email}
                  </a>
                  <p className="add">
                    {`${userCard.address.city || ""} ${
                      userCard.address.country || ""
                    }`}
                  </p>
                </div>
              </div>
              <div className="clas">
                <p className="status">{userCard.status}</p>
                <button>Chat</button>
              </div>
            </>
          ) : (
            <p className="userCard placeholder">User card</p>
          )}
        </div>
        <p className="label">Messages</p>
        <div className="peopleWrapper">
          <ul className="people">
            {contacts.map(({ client, messages, status, lastSeen }) => (
              <Person
                key={client._id}
                client={client}
                messages={messages}
                status={status}
                lastSeen={lastSeen}
                userCard={userCard}
              />
            ))}
            {contacts.length === 0 && (
              <p className="placeholder">Start making payments now.</p>
            )}
          </ul>
        </div>
      </div>
      <Chat
        chat={chat}
        userCard={userCard}
        user={user}
        socket={socket}
        setChat={setChat}
      />
    </div>
  );
};

const Person = ({ client, messages, lastSeen, userCard }) => {
  const history = useHistory();
  const [unread, setUnread] = useState(
    messages.filter((msg) => new Date(msg.createdAt) > new Date(lastSeen))
      .length || false
  );
  useEffect(() => {
    if (client?._id !== userCard?._id) {
      setUnread(
        messages.filter((msg) => new Date(msg.createdAt) > new Date(lastSeen))
          .length || false
      );
    } else {
      setUnread(false);
    }
  }, [messages]);
  return (
    <li
      className={client._id === userCard?._id ? "active" : undefined}
      onClick={() => {
        history.push(`/account/deals/${client.phone}`);
      }}
    >
      {
        <>
          <img src={client.profileImg} />
          <div>
            <p className="name">{client.firstName + " " + client.lastName}</p>
            {messages.length > 0 && (
              <p className="lastMessage">
                {messages[messages.length - 1].text}
              </p>
            )}
            {unread && <p className="unread">{unread}</p>}
          </div>
        </>
      }
    </li>
  );
};

const Chat = ({ chat, setChat, userCard, user, socket }) => {
  const chatWrapper = useRef(null);
  const history = useHistory();
  const [value, setValue] = useState("");
  const [rooms, setRooms] = useState([]);
  const [msg, setMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (value && rooms.length) {
      socket.emit("messageToServer", {
        rooms,
        message: {
          to: userCard._id,
          text: value,
        },
      });
      setValue("");
    }
  };
  useEffect(() => {
    chatWrapper.current?.scrollBy(0, 9999999999999);
  }, [chat]);
  useEffect(() => {
    socket.on("connectedToRoom", ({ rooms }) => {
      setRooms(rooms);
    });
  }, []);
  useEffect(() => {
    if (rooms.length) {
      fetch("/api/updateLastSeen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rooms }),
      });
    }
    return () => {
      if (rooms.length) {
        fetch("/api/updateLastSeen", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rooms }),
        });
      }
    };
  }, [rooms]);
  return (
    <div className="chat">
      {chat ? (
        <>
          <div className="chatHead">
            <div className="profile">
              <img src={userCard.profileImg} />
              <p className="name">
                {userCard.firstName + " " + userCard.lastName}
              </p>
            </div>
            <Link className="pay" to={`/account/deals/${userCard.phone}/pay`}>
              Pay
            </Link>
          </div>
          <div className="chatWrapper" ref={chatWrapper}>
            <ul className="chats">
              {chat.map((msg, i) => {
                if (!msg) {
                  return null;
                }
                const timestamp =
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(chat[i + 1]?.createdAt).getTime()
                  ) > 300000;
                const dateStamp =
                  moment(msg.createdAt).format("YYYY-MM-DD") !==
                    moment(chat[i - 1]?.createdAt).format("YYYY-MM-DD") ||
                  i === 0;
                return (
                  <li
                    key={i}
                    className={`bubble ${
                      msg.from === user._id ? "user" : "client"
                    }`}
                  >
                    {dateStamp && (
                      <Moment className="dateStamp" format="MMM DD, YYYY">
                        {msg.createdAt}
                      </Moment>
                    )}
                    {<p className="text">{msg.text}</p>}
                    {(timestamp || i === chat.length - 1) && (
                      <Moment className="timestamp" format="hh:mm a">
                        {msg.createdAt}
                      </Moment>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <form onSubmit={submit}>
            <section>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <div className="fileUpload">
                <input type="file" />
              </div>
            </section>
            <button type="submit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26.55"
                height="25.219"
                viewBox="0 0 26.55 25.219"
              >
                <path
                  id="Path_1"
                  data-name="Path 1"
                  d="M-242.2-184.285h-13l26.55-10.786-4.252,25.219-5.531-10.637-2.127,4.68v-6.382l7.659-9.148h2.34"
                  transform="translate(255.198 195.071)"
                  fill="#fff"
                />
              </svg>
            </button>
          </form>
        </>
      ) : (
        <div className="startChat">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26.55"
            height="25.219"
            viewBox="0 0 26.55 25.219"
          >
            <path
              id="Path_1"
              data-name="Path 1"
              d="M-242.2-184.285h-13l26.55-10.786-4.252,25.219-5.531-10.637-2.127,4.68v-6.382l7.659-9.148h2.34"
              transform="translate(255.198 195.071)"
              fill="#707070"
            />
          </svg>
          <p>start a chat</p>
        </div>
      )}
      <Modal
        className="milestoneRequest"
        open={history.location.pathname.match(/^\/account\/deals\/.+\/pay$/)}
      >
        <div className="head">
          <p className="modalName">Create Milestone</p>
          <button
            onClick={() => {
              history.push(`/account/deals/${userCard.phone}`);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15.557"
              height="15.557"
              viewBox="0 0 15.557 15.557"
            >
              <defs>
                <clipPath id="clip-path">
                  <rect width="15.557" height="15.557" fill="none" />
                </clipPath>
              </defs>
              <g id="Cancel" clipPath="url(#clip-path)">
                <path
                  id="Union_3"
                  data-name="Union 3"
                  d="M7.778,9.192,1.414,15.557,0,14.142,6.364,7.778,0,1.414,1.414,0,7.778,6.364,14.142,0l1.415,1.414L9.192,7.778l6.364,6.364-1.415,1.415Z"
                  fill="#2699fb"
                />
              </g>
            </svg>
          </button>
        </div>
        <MilestoneForm
          userType="buyer"
          searchClient={userCard}
          onSuccess={(milestone) => {
            if (milestone.milestone) {
              history.push(`/account/deals/${userCard.phone}`);
            }
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  {milestone.milestone ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="158"
                      height="158"
                      viewBox="0 0 158 158"
                    >
                      <defs>
                        <linearGradient
                          id="linear-gradient"
                          x1="-0.298"
                          y1="-0.669"
                          x2="1.224"
                          y2="1.588"
                          gradientUnits="objectBoundingBox"
                        >
                          <stop offset="0" stopColor="#336cf9" />
                          <stop offset="1" stopColor="#1be6d6" />
                        </linearGradient>
                        <clipPath id="clip-path">
                          <rect width="64" height="64" fill="none" />
                        </clipPath>
                      </defs>
                      <g
                        id="Group_163"
                        data-name="Group 163"
                        transform="translate(-0.426 -0.384)"
                      >
                        <g
                          id="Group_103"
                          data-name="Group 103"
                          transform="translate(0 0)"
                        >
                          <rect
                            id="Rectangle_1104"
                            data-name="Rectangle 1104"
                            width="158"
                            height="158"
                            rx="79"
                            transform="translate(0.426 0.384)"
                            fill="url(#linear-gradient)"
                          />
                        </g>
                        <g
                          id="Component_148_2"
                          data-name="Component 148 – 2"
                          transform="translate(47.426 58.384)"
                          clipPath="url(#clip-path)"
                        >
                          <rect
                            id="Rectangle_460"
                            data-name="Rectangle 460"
                            width="64"
                            height="64"
                            transform="translate(0 0)"
                            fill="none"
                          />
                          <path
                            id="Checkbox"
                            d="M25.35,44.087,0,18.737l5.143-5.143L25.35,33.432,58.782,0l5.143,5.143Z"
                            transform="translate(0 1.728)"
                            fill="#fff"
                          />
                        </g>
                      </g>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="158"
                      height="158"
                      viewBox="0 0 158 158"
                    >
                      <defs>
                        <linearGradient
                          id="linear-gradient-red"
                          x1="-0.298"
                          y1="-0.669"
                          x2="1.224"
                          y2="1.588"
                          gradientUnits="objectBoundingBox"
                        >
                          <stop offset="0" stopColor="#f93389" />
                          <stop offset="1" stopColor="#e3003e" />
                        </linearGradient>
                      </defs>
                      <rect
                        id="Rectangle_1104"
                        data-name="Rectangle 1104"
                        width="158"
                        height="158"
                        rx="79"
                        fill="url(#linear-gradient-red)"
                      />
                      <g
                        id="Component_85_8"
                        data-name="Component 85 – 8"
                        transform="translate(49.472 49.472)"
                      >
                        <path
                          id="Union_3"
                          data-name="Union 3"
                          d="M29.527,34.9,5.368,59.057,0,53.686,24.158,29.527,0,5.368,5.368,0l24.16,24.158L53.686,0l5.371,5.368L34.9,29.527l24.16,24.158-5.371,5.371Z"
                          fill="#fff"
                        />
                      </g>
                    </svg>
                  )}
                  {milestone.milestone && (
                    <h4 className="amount">₹{milestone.milestone?.amount}</h4>
                  )}
                  <h4>{milestone.message}</h4>
                </div>
                {milestone.milestone && (
                  <Link to="/account/hold" onClick={() => setMsg(null)}>
                    Check your Delivery pay Hold
                  </Link>
                )}
              </>
            );
          }}
        />
      </Modal>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

export default Deals;
