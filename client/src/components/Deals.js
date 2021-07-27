import { useState, useEffect, useContext, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { SiteContext } from "../SiteContext";
import Moment from "react-moment";
import { Modal } from "./Modal";
import moment from "moment";
import { Succ_svg, Err_svg, X_svg } from "./Elements";
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
        console.log(data);
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
    if (match.params._id) {
      const person = contacts.find(
        (chat) => chat.client._id.toString() === match.params._id
      );
      if (person) {
        const { client, messages, status, lastSeen } = person;
        setUserCard({ ...client, status, messages, lastSeen });
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
    <div className={`chatContainer ${userCard ? "chatOpen" : ""}`}>
      <div className="contactsContainer">
        <div className="userCard">
          {userCard ? (
            <>
              <div className="profile">
                <img src={userCard.profileImg || "/profile-user.jpg"} />
                <div className="details">
                  <p className="name">
                    {userCard.firstName
                      ? userCard.firstName + " " + userCard.lastName
                      : "Deleted user"}
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
                    {`${userCard.address?.city || ""} ${
                      userCard.address?.country || ""
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
        setUserCard={setUserCard}
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
        history.push(`/account/deals/${client._id}`);
      }}
    >
      {
        <>
          <img src={client.profileImg || "/profile-user.jpg"} />
          <div>
            <p className="name">
              {client.firstName
                ? client.firstName + " " + client.lastName
                : "Deleted User"}
            </p>
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

const Chat = ({ chat, setChat, userCard, setUserCard, user, socket }) => {
  const chatWrapper = useRef(null);
  const history = useHistory();
  const [value, setValue] = useState("");
  const [rooms, setRooms] = useState([]);
  const [msg, setMsg] = useState(null);
  const inputRef = useRef(null);
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
      inputRef.current.focus();
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
              <button
                className="back"
                onClick={() => {
                  history.push("/account/deals");
                  setChat(null);
                  setUserCard(null);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                >
                  <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M8,0,6.545,1.455l5.506,5.506H0V9.039H12.052L6.545,14.545,8,16l8-8Z"
                    transform="translate(16 16) rotate(180)"
                    fill="#2699fb"
                  />
                </svg>
              </button>
              <img src={userCard.profileImg || "/profile-user.jpg"} />
              <p className="name">
                {userCard.firstName
                  ? userCard.firstName + " " + userCard.lastName
                  : "Deleted user"}
                <span className="lastSeen">
                  <Moment format="hh:mma, MMM DD">{userCard.lastSeen}</Moment>
                </span>
              </p>
            </div>
            <Link className="pay" to={`/account/deals/${userCard._id}/pay`}>
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
                  ) > 120000;
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
          {userCard.firstName && (
            <form onSubmit={submit}>
              <section>
                <input
                  ref={inputRef}
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
          )}
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
              history.push(`/account/deals/${userCard._id}`);
            }}
          >
            <X_svg />
          </button>
        </div>
        <MilestoneForm
          userType="buyer"
          searchClient={userCard}
          onSuccess={(milestone) => {
            if (milestone.milestone) {
              history.push(`/account/deals/${userCard._id}`);
            }
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  {milestone.milestone ? <Succ_svg /> : <Err_svg />}
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
