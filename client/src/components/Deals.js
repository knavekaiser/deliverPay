import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  lazy,
} from "react";
import { Link, useHistory, Route } from "react-router-dom";
import { SiteContext, socket, ChatContext } from "../SiteContext";
import { Modal, Confirm } from "./Modal";
import {
  Succ_svg,
  Err_svg,
  X_svg,
  UploadFiles,
  Actions,
  Img,
  Moment,
  moment,
  LS,
} from "./Elements";
import TextareaAutosize from "react-textarea-autosize";
const MilestoneForm = lazy(() =>
  import("./Forms").then((mod) => ({ default: mod.MilestoneForm }))
);

require("./styles/deals.scss");

const updateChatLastSeen = (rooms) => {
  fetch("/api/updateLastSeen", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rooms }),
  });
};

const Deals = ({ history, location, match }) => {
  const { user } = useContext(SiteContext);
  const { contacts, setContacts } = useContext(ChatContext);
  const user_id = useRef();
  const [userCard, setUserCard] = useState(null);
  const [chat, setChat] = useState(null);
  useEffect(() => {
    if (userCard && userCard._id !== user_id.current) {
      socket.emit("initiateChat", {
        client_id: userCard._id,
        ...(userCard.messages === undefined && { newChat: true }),
      });
      user_id.current = userCard._id;
    }
    if (userCard) {
      setChat(userCard.messages);
    }
  }, [userCard]);
  useEffect(() => {
    if (match.params._id) {
      const person = contacts.find(
        (chat) => chat.client._id.toString() === match.params._id
      );
      if (person) {
        const { client, messages, status, lastSeen } = person;
        setUserCard({ ...client, status, messages });
      }
    }
  }, [match.params, contacts]);
  return (
    <div className={`chatContainer ${userCard ? "chatOpen" : ""}`}>
      <div className="contactsContainer">
        <UserSearch setUserCard={setUserCard} setContacts={setContacts} />
        {
          //   <div className="userCard">
          //   {userCard ? (
          //     <>
          //       <div className="profile">
          //         <Img src={userCard.profileImg || "/profile-user.jpg"} />
          //         <div className="details">
          //           <p className="name">
          //             {userCard.firstName
          //               ? userCard.firstName + " " + userCard.lastName
          //               : "Deleted user"}
          //           </p>
          //           <a className="phone">{userCard.phone}</a>
          //           <a href={`mailto:${userCard.email}`} className="email">
          //             {userCard.email}
          //           </a>
          //           <p className="add">
          //             {`${userCard.address?.city || ""} ${
          //               userCard.address?.country || ""
          //             }`}
          //           </p>
          //         </div>
          //       </div>
          //       <div className="clas">
          //         <p className="status">{userCard.status}</p>
          //         <button>Chat</button>
          //       </div>
          //     </>
          //   ) : (
          //     <p className="userCard placeholder">Select a user</p>
          //   )}
          // </div>
        }
        <p className="label">Messages</p>
        <div className="peopleWrapper">
          <ul className="people">
            {contacts.map(({ client, messages, status, lastSeen, unread }) => (
              <Person
                key={client._id}
                client={client}
                messages={messages}
                status={status}
                lastSeen={lastSeen}
                userCard={userCard}
                unread={unread}
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
        setContacts={setContacts}
        userCard={userCard}
        setUserCard={setUserCard}
        user={user}
        setChat={setChat}
      />
    </div>
  );
};

const UserSearch = ({ setUserCard, setContacts }) => {
  const history = useHistory();
  const [msg, setMsg] = useState(null);
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const formRef = useRef();
  const inviteUser = useCallback(() => {
    const phoneReg = new RegExp(
      /^(\+91|91|1|)(?=\d{10}$)/gi
      // /((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/
    );
    if (phoneReg.test(value.toLowerCase())) {
      fetch(
        `/api/inviteUser?${new URLSearchParams({
          q: "+91" + value.replace(/^(\+91|91|1|)(?=\d{10}$)/g, ""),
          origin: window.location.origin,
        }).toString()}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "ok") {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  {
                    // <h4>Invitation sent.</h4>
                  }
                  <h4>
                    An invitaion has been sent to{" "}
                    {"+91" + value.replace(/^(\+91|91|1|)(?=\d{10}$)/g, "")}.
                  </h4>
                </div>
              </>
            );
          } else {
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Err_svg />
                  <h4>Invitation could not be sent. Please try again.</h4>
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
                <h4>Invitation could not be sent. Make sure you're online.</h4>
              </div>
            </>
          );
        });
    } else {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Enter a valid phone number to send invitation.</h4>
          </div>
        </>
      );
    }
  }, [value]);
  const fetchUsers = () => {
    fetch(`/api/getUsers?q=${encodeURIComponent(value)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUsers(data);
        }
      });
    if (value === "") {
      setUsers([]);
    }
  };
  const documentClickHandler = (e) => {
    if (e.path.includes(formRef.current)) {
    } else {
      setShowUsers(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", documentClickHandler);
    return () => {
      document.removeEventListener("click", documentClickHandler);
    };
  }, []);
  useEffect(() => {
    if (value) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [value]);
  return (
    <div className="search">
      <form onSubmit={(e) => e.preventDefault()} ref={formRef}>
        <section>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17.9"
            height="17.9"
            viewBox="0 0 17.9 17.9"
          >
            <path
              id="Path_208"
              data-name="Path 208"
              d="M17.9,16.324l-3.715-3.715a7.708,7.708,0,0,0,1.576-4.728A7.832,7.832,0,0,0,7.881,0,7.832,7.832,0,0,0,0,7.881a7.832,7.832,0,0,0,7.881,7.881,7.708,7.708,0,0,0,4.728-1.576L16.324,17.9ZM2.252,7.881A5.574,5.574,0,0,1,7.881,2.252a5.574,5.574,0,0,1,5.629,5.629,5.574,5.574,0,0,1-5.629,5.629A5.574,5.574,0,0,1,2.252,7.881Z"
              transform="translate(0)"
              fill="#b9b9b9"
            />
          </svg>
          <input
            label="search"
            required={true}
            placeholder="Phone Number"
            onFocus={() => setShowUsers(true)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Link
            className={`sendReq ${
              users.length > 0 || !value ? "disabled" : ""
            }`}
            onClick={inviteUser}
            to="#"
          >
            Invite
          </Link>
        </section>
        {showUsers && users.length ? (
          <ul className="searchResult">
            {users.map((user, i) => (
              <a
                key={i}
                onClick={() => {
                  setUserCard(user);
                  setContacts((prev) => [
                    ...prev,
                    { client: user, messages: [], status: "" },
                  ]);
                  history.push(`/account/deals/${user._id}`);
                  setShowUsers(false);
                }}
              >
                <li key={i}>
                  <div className="profile">
                    <Img src={user.profileImg} />
                    <p className="name">
                      {user.firstName + " " + user.lastName}
                      <span className="phone">{user.phone}</span>
                    </p>
                  </div>
                </li>
              </a>
            ))}
          </ul>
        ) : null}
      </form>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

const Person = ({ client, messages, lastSeen, userCard, unread }) => {
  const { setContacts } = useContext(ChatContext);
  const history = useHistory();
  return (
    <li
      className={client._id === userCard?._id ? "active" : undefined}
      onClick={() => {
        history.push(`/account/deals/${client._id}`);
        setContacts((prev) =>
          prev.map((chat) => {
            if (client?._id === chat.client?._id) {
              return {
                ...chat,
                lastSeen: new Date().toISOString(),
                unread: null,
              };
            }
            return chat;
          })
        );
      }}
    >
      {
        <>
          <Img src={client.profileImg || "/profile-user.jpg"} />
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
            {unread ? <p className="unread">{unread}</p> : null}
          </div>
        </>
      }
    </li>
  );
};

export const Chat = ({
  chat,
  setChat,
  userCard,
  setUserCard,
  user,
  setContacts,
}) => {
  const { setUser, userType } = useContext(SiteContext);
  const { rooms, setRooms } = useContext(ChatContext);
  const chatWrapper = useRef(null);
  const loading = useRef(null);
  const history = useHistory();
  const [msgLoading, setMsgLoading] = useState(false);
  const [allMessages, setAllMessages] = useState(
    chat?.length >= 50 ? false : true
  );
  const [page, setPage] = useState(2);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    if (rooms.length) {
      updateChatLastSeen(rooms);
    }
    return () => {
      if (rooms.length) {
        updateChatLastSeen(rooms);
      }
    };
  }, [rooms]);
  const loadChat = () => {
    fetch(`/api/getMessages?client=${userCard._id}&page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setMsgLoading(false);
        if (data.code === "ok") {
          setContacts((prev) =>
            prev.map((chat) => {
              if (chat._id === data.contact?._id) {
                return {
                  ...chat,
                  messages: data.contact.messages,
                };
              }
              return chat;
            })
          );
          setPage((prev) => prev + 1);
          if (data.contact.total === data.contact.messages.length) {
            setAllMessages(true);
          }
        }
      })
      .catch((err) => {
        setMsgLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not get messages. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    if (chat?.length >= 50) {
      setAllMessages(false);
    } else {
      setAllMessages(true);
    }
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
              <Img src={userCard.profileImg || "/profile-user.jpg"} />
              <p className="name">
                {userCard.firstName
                  ? userCard.firstName + " " + userCard.lastName
                  : "Deleted user"}
                {userCard.lastSeen && (
                  <span className="lastSeen">
                    <Moment format="hh:mma, MMM DD">{userCard.lastSeen}</Moment>
                  </span>
                )}
              </p>
            </div>
            {(userCard.status === "" || userCard.status === "blocked") && (
              <>
                {userType === "seller" ? (
                  <Link
                    className="pay"
                    target="_blank"
                    to={`/marketplace?seller=${user._id}`}
                    onClick={() => LS.set(userCard._id)}
                  >
                    Create an Order
                  </Link>
                ) : (
                  <>
                    <Link
                      className="pay"
                      to={`/account/deals/${userCard._id}/payment`}
                    >
                      Pay
                    </Link>
                    <Link
                      className="viewShop"
                      to={`/marketplace?seller=${userCard._id}`}
                    >
                      View Shop
                    </Link>
                  </>
                )}
                <Actions>
                  {
                    userCard.status === "" && null
                    // <Link
                    //   className="pay"
                    //   to={`/account/deals/${userCard._id}/pay`}
                    // >
                    //   Pay
                    // </Link>
                  }
                  <Link to={`/account/deals/${userCard._id}/report`}>
                    Report
                  </Link>
                  <button
                    onClick={() => {
                      Confirm({
                        label: ` ${
                          userCard.status === "blocked" ? "Unblock" : "Block"
                        } User`,
                        question: `You sure want to ${
                          userCard.status === "blocked" ? "un" : ""
                        }block this user?`,
                        callback: () => {
                          const blocked = userCard.status === "blocked";
                          fetch(
                            `/api/${blocked ? "unblockUser" : "blockUser"}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                _id: userCard._id,
                              }),
                            }
                          )
                            .then((res) => res.json())
                            .then((data) => {
                              if (data.code === "ok") {
                                setUser((prev) => ({
                                  ...prev,
                                  blockList: data.blockList,
                                }));
                                setContacts((prev) =>
                                  prev.map((item) => {
                                    if (item.client._id === userCard._id) {
                                      return {
                                        ...item,
                                        status: blocked ? "" : "blocked",
                                      };
                                    } else {
                                      return item;
                                    }
                                  })
                                );
                                setMsg(
                                  <>
                                    <button onClick={() => setMsg(null)}>
                                      Okay
                                    </button>
                                    <div>
                                      <Succ_svg />
                                      <h4>
                                        User successfully {blocked && "un"}
                                        blocked.
                                      </h4>
                                    </div>
                                  </>
                                );
                              } else {
                                setMsg(
                                  <>
                                    <button onClick={() => setMsg(null)}>
                                      Okay
                                    </button>
                                    <div>
                                      <Err_svg />
                                      <h4>
                                        Could not {blocked && "un"}block user.
                                        try again.
                                      </h4>
                                    </div>
                                  </>
                                );
                              }
                            })
                            .catch((err) => {
                              console.log(err);
                              setMsg(
                                <>
                                  <button onClick={() => setMsg(null)}>
                                    Okay
                                  </button>
                                  <div>
                                    <Err_svg />
                                    <h4>
                                      Could not {blocked && "un"}block user.
                                      Make sure you're online.
                                    </h4>
                                  </div>
                                </>
                              );
                            });
                        },
                      });
                    }}
                  >
                    {userCard.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                </Actions>
              </>
            )}
          </div>
          <ul
            className="chats"
            ref={chatWrapper}
            onScroll={(e) => {
              const { y } = loading.current?.getBoundingClientRect() || {};
              if (y > 0 && !msgLoading) {
                setMsgLoading(true);
                loadChat();
              }
            }}
          >
            {[
              ...chat.map((msg, i) => (
                <Bubble chat={chat} key={msg._id} msg={msg} i={i} user={user} />
              )),
            ].reverse()}
            {!allMessages && (
              <li className="loading" ref={loading}>
                Loading
              </li>
            )}
          </ul>
          {userCard.status === "" && (
            <ChatForm
              onSuccess={() => {
                chatWrapper.current?.scrollBy(
                  0,
                  chatWrapper.current.scrollHeight * 2
                );
              }}
              rooms={rooms}
              user={userCard._id}
              newChat={!userCard.lastSeen}
            />
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
        head={true}
        label={userType === "seller" ? "Request Milestone" : "Create Milestone"}
        open={
          userCard &&
          history.location.pathname.match(/^\/account\/deals\/.+\/payment$/)
        }
        setOpen={() => history.push(`/account/deals/${userCard._id}`)}
      >
        <MilestoneForm
          action={userType === "seller" ? "request" : "create"}
          client={userCard}
          onSuccess={(milestone) => {
            history.push(`/account/deals/${userCard._id}`);
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4 className="amount">₹{milestone.milestone?.amount}</h4>
                  <h4>Milestone has been created</h4>
                </div>
                <Link to="/account/hold" onClick={() => setMsg(null)}>
                  Check your Delivery pay Hold
                </Link>
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

const Bubble = ({ chat, msg, i, user }) => {
  const history = useHistory();
  const [milestone, setMilestone] = useState(null);
  useEffect(() => {
    if (msg.milestoneId) {
      fetch(`/api/milestone?q=${msg.milestoneId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.milestones.length) {
            setMilestone(data.milestones[0]);
          }
        });
    }
  }, []);
  if (!msg) {
    return null;
  }
  const timestamp =
    Math.abs(
      new Date(msg.createdAt).getTime() -
        new Date(chat[i + 1]?.createdAt).getTime()
    ) > 120000;
  const dateStamp =
    moment({
      time: msg.createdAt,
      format: "YYYY-MM-DD",
    }) !== moment({ time: chat[i - 1]?.createdAt, format: "YYYY-MM-DD" }) ||
    i === 0;
  return (
    <li
      className={`bubble ${msg.from === user._id ? "user" : "client"} ${
        milestone ? "milestone" : ""
      }`}
    >
      {dateStamp && (
        <Moment className="dateStamp" format="MMM DD, YYYY">
          {msg.createdAt}
        </Moment>
      )}
      {msg.text && (
        <p
          className="text"
          onClick={() => {
            if (milestone) {
              history.push(`/account/hold?q=${milestone._id}`);
            }
          }}
        >
          {milestone && <span className="amount">₹{milestone.amount}</span>}
          {msg.text}
        </p>
      )}
      {msg.media && <MediaBubble link={msg.media} />}
      {(timestamp || i === chat.length - 1) && (
        <Moment className="timestamp" format="hh:mm a">
          {msg.createdAt}
        </Moment>
      )}
    </li>
  );
};
const MediaBubble = ({ link }) => {
  let view = null;
  let fullView = null;
  const [open, setOpen] = useState(false);
  if (link.match(/(\.gif|\.png|\.jpg|\.jpeg|\.webp)$/i)) {
    view = <Img src={link} onClick={() => setOpen(true)} />;
  } else if (link.match(/(\.mp3|\.ogg|\.amr|\.m4a|\.flac|\.wav|\.aac)$/i)) {
    view = <audio src={link} controls="on" />;
  } else if (link.match(/(\.mp4|\.mov|\.avi|\.flv|\.wmv|\.webm)$/i)) {
    view = (
      <div className={`videoThumb`}>
        <video src={link} onClick={() => setOpen(true)} />
        <Img src="/play_btn.png" />
      </div>
    );
    fullView = <video src={link} controls="on" autoPlay="on" />;
  } else {
    view = (
      <a href={link} target="_blank" className="link">
        <Img src="/file_icon.png" />
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

const ChatForm = ({ rooms, user, newChat }) => {
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
    if (files.length && !media.length) {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Could not send files. please try again.</h4>
          </div>
        </>
      );
      return;
    }
    if (media.length) {
      media.forEach((link, i) => {
        socket.emit("messageToServer", {
          rooms,
          ...(newChat && { newChat }),
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
        ...(newChat && { newChat }),
        message: {
          to: user,
          text: value,
        },
      });
      inputRef.current.focus();
      setValue("");
    }
  };
  useEffect(() => {
    socket.on("sendFail", ({ err }) => {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>{err}</h4>
          </div>
        </>
      );
    });
  }, []);
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, [value, files]);
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
            autoFocus={true}
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
            <Img src="/paperclip.svg" />
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
            <Img
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
