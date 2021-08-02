import { useState, useEffect, useContext, useRef } from "react";
import { Link, useHistory, Route } from "react-router-dom";
import { SiteContext } from "../SiteContext";
import Moment from "react-moment";
import { Modal } from "./Modal";
import moment from "moment";
import { Succ_svg, Err_svg, X_svg, UploadFiles, Actions } from "./Elements";
import { io } from "socket.io-client";
import { MilestoneForm } from "./Account";
import TextareaAutosize from "react-textarea-autosize";
require("./styles/deals.scss");

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
  const [rooms, setRooms] = useState([]);
  const [msg, setMsg] = useState(null);
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
  useEffect(() => {
    chatWrapper.current?.scrollBy(0, chatWrapper.current.scrollHeight);
  }, [chat]);
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
            <Actions>
              <Link className="pay" to={`/account/deals/${userCard._id}/pay`}>
                Pay
              </Link>
              <Link to={`/account/deals/${userCard._id}/report`}>Report</Link>
              <button>Block</button>
            </Actions>
          </div>
          <ul className="chats" ref={chatWrapper}>
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
                  {msg.text && <p className="text">{msg.text}</p>}
                  {msg.media && <MediaBubble link={msg.media} />}
                  {(timestamp || i === chat.length - 1) && (
                    <Moment className="timestamp" format="hh:mm a">
                      {msg.createdAt}
                    </Moment>
                  )}
                </li>
              );
            })}
          </ul>
          {userCard.firstName && <ChatForm rooms={rooms} user={userCard._id} />}
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
        head={true}
        label="Create Milestone"
        open={history.location.pathname.match(/^\/account\/deals\/.+\/pay$/)}
        setOpen={() => history.push(`/account/deals/${userCard._id}`)}
      >
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
      <Route
        path="/account/deals/:_id/report"
        component={({ location }) => (
          <Modal
            open={true}
            head={true}
            label="Report User"
            className="userReport"
            setOpen={() =>
              history.push(location.pathname.replace(/\/report/, ""))
            }
          >
            <div className="content">
              <ReportForm
                user={userCard}
                onSuccess={() => {
                  history.push(
                    history.location.pathname.replace(/\/report/, "")
                  );
                  setMsg(
                    <>
                      <button onClick={() => setMsg(null)}>Okay</button>
                      <div>
                        <Succ_svg />
                        <h4>User has been reported.</h4>
                      </div>
                    </>
                  );
                }}
              />
            </div>
          </Modal>
        )}
      />
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

const MediaBubble = ({ link }) => {
  let view = null;
  let fullView = null;
  const [open, setOpen] = useState(false);
  if (link.match(/(\.gif|\.png|\.jpg|\.jpeg|\.webp)$/)) {
    view = <img src={link} onClick={() => setOpen(true)} />;
  } else if (link.match(/(\.mp3|\.ogg|\.amr|\.m4a|\.flac|\.wav|\.aac)$/)) {
    view = <audio src={link} controls="on" />;
  } else if (link.match(/(\.mp4|\.mov|\.avi|\.flv|\.wmv|\.webm)$/)) {
    view = (
      <div className={`videoThumb`}>
        <video src={link} onClick={() => setOpen(true)} />
        <img src="/play_btn.png" />
      </div>
    );
    fullView = <video src={link} controls="on" autoPlay="on" />;
  } else {
    view = (
      <a href={link} target="_blank" className="link">
        <img src="/file_icon.png" />
        {link}
      </a>
    );
  }
  return (
    <div className="file">
      {view}
      <Modal open={open} className="chatMediaView">
        <button className="close" onClick={() => setOpen(false)}>
          <X_svg />
        </button>
        {fullView || view}
      </Modal>
    </div>
  );
};

const ChatForm = ({ rooms, user }) => {
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [files, setFiles] = useState([]);
  const submit = async (e) => {
    e.preventDefault();
    if (!socket.connected) {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Could not connect to server. Make sure you're online.</h4>
          </div>
        </>
      );
      return;
    }
    const cdn = process.env.REACT_APP_CDN_HOST;
    const media = files.length
      ? await UploadFiles({
          files,
          setMsg,
        })
      : [];
    if (media.length) {
      media.forEach((link, i) => {
        socket.emit("messageToServer", {
          rooms,
          message: {
            to: user,
            media: link,
          },
        });
      });
      setFiles([]);
    }
    if (value && rooms.length) {
      socket.emit("messageToServer", {
        rooms,
        message: {
          to: user,
          text: value,
        },
      });
      inputRef.current.focus();
      setValue("");
    }
  };
  return (
    <>
      <form
        onSubmit={submit}
        ref={formRef}
        className={loading ? "loading" : ""}
      >
        <Preview files={files} setFiles={setFiles} />
        <section>
          <TextareaAutosize
            ref={inputRef}
            type="text"
            value={value}
            style={{ height: "100px" }}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.keyCode === 13 && !e.altKey) {
                submit(e);
              } else if (e.keyCode === 13 && e.altKey) {
                setValue(value + "\n");
              }
            }}
          />
          <div className="fileUpload">
            <input
              type="file"
              multiple={true}
              onChange={(e) => {
                setFiles((prev) => [
                  ...prev,
                  ...[...e.target.files].filter(
                    (item) => !files.some((file) => file.name === item.name)
                  ),
                ]);
              }}
            />
            <img src="/paperclip.svg" />
          </div>
        </section>
        <button type="submit" disabled={loading}>
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
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};
const ReportForm = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/reportUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user._id,
        message,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          onSuccess?.(data);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Report could not be submitted. try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Report could not be submitted. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form onSubmit={submit}>
        <section>
          <label>Messag</label>
          <TextareaAutosize
            required={true}
            onChange={(e) => setMessage(e.target.value)}
          />
        </section>
        <section className="btns">
          <button className="submit">Submit</button>
        </section>
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

const Preview = ({ files, setFiles }) => {
  if (files.length === 0) {
    return null;
  }
  return (
    <div className="preview">
      {files.map((item) => {
        const file = {
          type: item.type,
          name: item.name,
          url: URL.createObjectURL(item),
        };
        const img = file.type.startsWith("image");
        return (
          <div key={item.name} className={`file ${img ? "thumb" : "any"}`}>
            <button
              className="close"
              type="button"
              onClick={() =>
                setFiles((prev) =>
                  prev.filter((item) => file.name !== item.name)
                )
              }
            >
              <X_svg />
            </button>
            <img
              className={img ? "thumb" : ""}
              src={img ? file.url : "/file_icon.png"}
            />
            {!img && <p className="filename">{item.name}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default Deals;
