import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useLayoutEffect,
  Fragment,
  lazy,
} from "react";
import { SiteContext } from "../SiteContext";
import { Link, Route } from "react-router-dom";
import { Modal } from "./Modal";
import {
  Combobox,
  Succ_svg,
  Err_svg,
  Plus_svg,
  Minus_svg,
  Arrow_up_svg,
  Arrow_down_svg,
  Img,
} from "./Elements";
import moment from "moment";

const Moment = lazy(() => import("react-moment"));

function generateGreetings() {
  const currentHour = moment().format("HH");
  if (currentHour >= 3 && currentHour < 12) {
    return "Good Morning";
  } else if (currentHour >= 12 && currentHour < 15) {
    return "Good Afternoon";
  } else if (currentHour >= 15 && currentHour < 20) {
    return "Good Evening";
  } else if (currentHour >= 20 && currentHour < 3) {
    return "Good Night";
  } else {
    return "Hello";
  }
}

function loadScript(src) {
  return new Promise((res, rej) => {
    if (!document.querySelector(`script[src="${src}"]`)) {
      const scr = document.createElement("script");
      scr.src = src;
      document.body.appendChild(scr);
      scr.onload = () => res(true);
      scr.onerror = () => rej(true);
    } else {
      res(true);
    }
  });
}

const Wallet = ({ history, location, match }) => {
  const { user, setUser } = useContext(SiteContext);
  const [balance, setBalance] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState([]);
  const [addMoneyAmount, setAddMoneyAmount] = useState("");
  const [rewards, setRewards] = useState([]);
  const [addMoneySuccess, setAddMoneySuccess] = useState(false);
  const [addMoneyFailed, setAddMoneyFailed] = useState(false);
  const [withdrawMoneyAmount, setWithdrawMoneyAmount] = useState("");
  const [withdrawMoneyFail, setWithdrawMoneyFail] = useState(false);
  const [withdrawOptions, setWithdrawOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const withdrawMoney = (method) => {
    let url;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    switch (method.__t) {
      case "BankCard":
        options.body = JSON.stringify({
          paymentMethod: method.__t,
          amount: withdrawMoneyAmount,
          accountDetail: {
            number: +method.cardNumber,
            name: method.nameOnCard,
          },
        });
        break;
      case "BankAccount":
        options.body = JSON.stringify({
          paymentMethod: method.__t,
          amount: withdrawMoneyAmount,
          accountDetail: {
            name: method.name,
            ifsc: method.ifsc,
            account_number: method.accountNumber,
          },
        });
        break;
      case "VpaAccount":
        options.body = JSON.stringify({
          paymentMethod: method.__t,
          amount: withdrawMoneyAmount,
          accountDetail: {
            address: method.address,
          },
        });
      default:
        return;
    }
    setLoading(true);
    fetch("/api/withdrawMoney", options)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          setUser((prev) => ({
            ...prev,
            balance: prev.balance - data.transaction.amount,
          }));
          setBalance((prev) => prev - data.transaction.amount);
          history.push("/account/wallet");
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4 className="amount">₹{data.transaction?.amount}</h4>
                <h4>Money withdrawed!</h4>
              </div>
            </>
          );
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Insufficient fun.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not withdraw money. Please try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setWithdrawMoneyFail(true);
      });
  };
  const handleOrder = (order, key) => {
    const Razorpay = window.Razorpay;
    if (Razorpay) {
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        accept_partial: false,
        name: `${user.firstName} ${user.lastName}`,
        description: "Add money to Delivery Pay wallet",
        image: "/logo_big.jpg",
        order_id: order.id,
        handler: (res) => {
          fetch("/api/addMoney", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionId: res.razorpay_payment_id,
              razorSignature: res.razorpay_signature,
              razorOrderId: res.razorpay_order_id,
            }),
          })
            .then((res) => res.json())
            .then(({ code, user, transaction, message }) => {
              if (code === "ok") {
                history.push("/account/wallet");
                setAddMoneyFailed(false);
                setAddMoneySuccess(transaction);
                setBalance((prev) => prev + transaction.amount);
                setAddMoneyAmount("");
                setLoading(false);
              } else {
                setMsg(
                  <>
                    <button onClick={() => setMsg(null)}>Okay</button>
                    <div>
                      <Err_svg />
                      <h4>
                        Error happend. Make sure you're payment details are
                        correct.
                      </h4>
                    </div>
                  </>
                );
              }
            })
            .catch((err) => {
              console.log(err);
              setAddMoneyFailed(true);
            });
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#336cf9" },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
      };
      const rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", (res) => {
        setAddMoneyFailed(true);
        setLoading(false);
      });
      rzp1.open();
    }
  };
  const addMoneySubmit = (e) => {
    e.preventDefault();
    fetch("/api/createAddMoneyOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: addMoneyAmount }),
    })
      .then((res) => res.json())
      .then(({ order, key }) => {
        setLoading(false);
        if (order) {
          handleOrder(order, key);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Error happend. Please try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Error happend. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js");
    fetch("/api/dashboardData")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMonthlyBalance(data.monthlyBalance);
          setBalance(data.balance);
          setRewards(data.rewards);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not update balance.</h4>
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
              <h4>Could not update balance.</h4>
            </div>
          </>
        );
      });
  }, []);
  useEffect(() => {
    if (!addMoneyAmount) {
      history.push("/account/wallet");
    }
    if (!withdrawMoneyAmount) {
      history.push("/account/wallet");
    }
    setLoading(false);
  }, [addMoneyAmount, withdrawMoneyAmount]);
  return (
    <div className="walletContainer">
      <div className="leftSection">
        <div className="nameTag">
          <h2>Hello {user.firstName},</h2>
          <p className="greetings">{generateGreetings()}</p>
        </div>
        <div className="balance">
          <div className="currentBalance">
            <p className="label">Wallet Balance</p>
            <h1>₹ {balance.fix()}</h1>
            <p className="updateTime">
              <Moment format="ddd, DD MMM YYYY">{new Date()}</Moment>
            </p>
          </div>
          <Graph data={monthlyBalance} />
        </div>
        <div className="addWithdraw">
          <div className="add money">
            <p className="label">Add Money</p>
            <form onSubmit={addMoneySubmit}>
              <input
                type="number"
                step="0.01"
                min="10"
                value={addMoneyAmount}
                onChange={(e) => setAddMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                required={true}
              />
              <button>Proceed</button>
            </form>
          </div>
          {
            //   <div className="withdraw money">
            //   <p className="label">Withdraw</p>
            //   <form
            //     onSubmit={(e) => {
            //       e.preventDefault();
            //       if (withdrawMoneyAmount > balance) {
            //         setMsg(
            //           <>
            //             <button onClick={() => setMsg(null)}>Okay</button>
            //             <div>
            //               <Err_svg />
            //               <h4>
            //                 Enter an amount less or equal to currect balance.
            //               </h4>
            //             </div>
            //           </>
            //         );
            //       } else {
            //         history.push("/account/wallet/withdrawMoney");
            //       }
            //     }}
            //   >
            //     <input
            //       type="number"
            //       step="0.01"
            //       min="10"
            //       placeholder="Enter ammount"
            //       required={true}
            //       value={withdrawMoneyAmount}
            //       onChange={(e) => setWithdrawMoneyAmount(e.target.value)}
            //     />
            //     <button>Proceed</button>
            //   </form>
            // </div>
          }
        </div>
        <div className="rewards">
          <p className="label">Rewards</p>
          <ul className="cards">
            {rewards.map((item, i) => (
              <li key={i}>
                <p className="rewardName">{item.name}</p>
                <div>
                  {item.img && <Img src={item.img} />}
                  {item.amount && <p className="amount">₹{item.amount}</p>}
                  <p className="rewardDscr">{item.dscr}</p>
                </div>
                {!item.redeemed && (
                  <button
                    className="redeem"
                    onClick={() => {
                      setMsg(
                        <>
                          <div>
                            <h4>Redeeming Reward...</h4>
                          </div>
                        </>
                      );
                      fetch("/api/redeemReward", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ _id: item._id }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.code === "ok") {
                            setRewards((prev) =>
                              prev.map((item) => {
                                if (item._id === data.reward._id) {
                                  return data.reward;
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
                                  <h4>Reward succefully redeemed</h4>
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
                                  <h4>Could not redeem reward.</h4>
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
                                <h4>
                                  Could not redeem reward. Make sure you're
                                  online.
                                </h4>
                              </div>
                            </>
                          );
                        });
                    }}
                  >
                    Redeem
                  </button>
                )}
              </li>
            ))}
            {rewards.length === 0 ? (
              <li className="placeholder">Nothing yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="rightSection">
        <Cards paymentMethods={user.paymentMethods} />
        <Transactions />
      </div>
      <Modal
        className="paymentMethodsForm"
        head={true}
        label="Add Payment Method"
        setOpen={() => {
          history.push("/account/wallet/addMoney");
        }}
        open={location.pathname.startsWith(
          "/account/wallet/addMoney/addPaymentMethod"
        )}
      >
        <PaymentMethodForm
          onSuccess={() => history.push("/account/wallet/addMoney")}
        />
      </Modal>
      <Modal
        className="addMoney"
        head={true}
        label="Withdraw Money"
        setOpen={() => {
          history.push("/account/wallet");
        }}
        open={location.pathname.startsWith("/account/wallet/withdrawMoney")}
        style={
          loading
            ? {
                filter: "grayscale(.4)",
                pointerEvents: "none",
              }
            : {}
        }
      >
        <PaymentOption
          label="Where do you want to recieve your money?"
          action={withdrawMoney}
        />
      </Modal>
      <Modal open={addMoneySuccess} className="msg">
        <button onClick={() => setAddMoneySuccess(null)}>Okay</button>
        <div>
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
          <h4 className="amount">₹{addMoneySuccess?.amount}</h4>
          <h4>Money added!</h4>
        </div>
      </Modal>
      <Modal open={withdrawMoneyFail} className="msg">
        <button
          onClick={() => {
            setLoading(false);
            setWithdrawMoneyFail(null);
          }}
        >
          Okay
        </button>
        <div>
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
          <h4>Could not withdraw money.</h4>
        </div>
      </Modal>
      <Modal open={false} className="msg">
        <button onClick={() => setAddMoneyFailed(null)}>Okay</button>
        <div>
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
              fill="url(#linear-gradient)"
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
          <h4>Add money failed</h4>
        </div>
      </Modal>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};

const Graph = ({ data }) => {
  const max =
    data.sort((a, b) => (a.balance < b.balance ? 1 : -1))[0]?.balance?.fix() ||
    0;
  return (
    <div className="graph">
      <p className="label">Analytics</p>
      <ul className="bars" data-max={`₹ ${max || 0}`}>
        {data.map((month, i) => {
          return (
            <li key={i}>
              <div
                className="bar"
                style={{ height: `${month.balance / (max / 100)}%` }}
              />
              <label className="month">{month._id}</label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
const PaymentOption = ({ label, action }) => {
  const { user, setUser } = useContext(SiteContext);
  return (
    <div className="paymentOptions">
      <p className="label">{label}</p>
      <div className="options">
        {user.paymentMethods.map((method, i) => (
          <Fragment key={method._id}>
            {method.__t === "BankCard" && (
              <BankCard card={method} onClick={(card) => action(card)} />
            )}
            {method.__t === "BankAccount" && (
              <BankAccount account={method} onClick={(card) => action(card)} />
            )}
          </Fragment>
        ))}
        {user.paymentMethods.length === 0 && (
          <div className="placeholder">No payment method added.</div>
        )}
      </div>
      <Link className="addMethodLink" to="addMoney/addPaymentMethod">
        Add payment method
      </Link>
    </div>
  );
};
const PaymentMethodForm = ({ onSuccess }) => {
  const [type, setType] = useState("netBanking");
  return (
    <div className="addPaymentMethod">
      {
        //   <section className="paymentOption">
        //   <div className="header" onClick={() => setType("upi")}>
        //     <div className={`redial ${type === "upi" && "active"}`}>
        //       <div className="fill" />
        //     </div>
        //     <label>
        //       UPI <Img src="/payment_upi.png" />
        //     </label>
        //   </div>
        //   {type === "upi" && <UpiForm />}
        // </section>
      }
      {
        //   <section className="paymentOption">
        //   <div className="header" onClick={() => setType("bankCard")}>
        //     <div className={`redial ${type === "bankCard" && "active"}`}>
        //       <div className="fill" />
        //     </div>
        //     <label>
        //       Add Debit/Credit Card <Img src="/payment_visa.png" />{" "}
        //       <Img src="/payment_mc.png" />
        //     </label>
        //   </div>
        //   {type === "bankCard" && <BankCardForm onSuccess={onSuccess} />}
        // </section>
      }
      <section className="paymentOption">
        <div className="header" onClick={() => setType("netBanking")}>
          <div className={`redial ${type === "netBanking" && "active"}`}>
            <div className="fill" />
          </div>
          <label>Net Banking</label>
        </div>
        {type === "netBanking" && <NetBankingForm onSuccess={onSuccess} />}
      </section>
    </div>
  );
};

export const UpiForm = () => {
  const [id, setId] = useState("");
  const submit = (e) => {
    e.preventDefault();
    setId("Coming soon!");
  };
  return (
    <form className="paymentMethodForm upi" onSubmit={submit}>
      <label>Please enter your UPI ID</label>
      <section>
        <input
          type="text"
          value={id}
          required={true}
          name="upiId"
          onChange={(e) => setId(e.target.value)}
          placeholder="Ex: MobileNumber@upi"
        />
        <button type="submit">Verify</button>
      </section>
    </form>
  );
};
export const BankCardForm = ({ prefill, onSuccess }) => {
  const { setUser } = useContext(SiteContext);
  const [brand, setBrand] = useState(prefill?.brand || null);
  const [name, setName] = useState(prefill?.nameOnCard || "");
  const [cardNumber, setCardNumber] = useState(prefill?.cardNumber || "");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState(prefill?.cvv || "");
  const [unsupporetdCard, setUnsuppportedCard] = useState(false);
  const years = (() => {
    const year = new Date().getFullYear();
    const years = [];
    for (var i = 0; i < 15; i++) {
      years.push({ label: year + i, value: (year + i).toString().substr(2) });
    }
    return years;
  })();
  const [msg, setMsg] = useState(null);
  useEffect(() => {}, [expYear, expMonth]);
  const submit = (e) => {
    e.preventDefault();
    if (brand === null) {
      setUnsuppportedCard(true);
      setTimeout(() => setUnsuppportedCard(false), 1500);
      return;
    }
    fetch(prefill ? "/api/editPaymentMethod" : "/api/addPaymentMethod", {
      method: prefill ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "BankCard",
        brand,
        nameOnCard: name,
        cardNumber,
        exp: `${expMonth}/${expYear}`,
        cvv,
        ...(prefill && { _id: prefill._id }),
      }),
    })
      .then((res) => res.json())
      .then(({ paymentMethod }) => {
        if (paymentMethod) {
          if (!prefill) {
            setUser((prev) => ({
              ...prev,
              paymentMethods: [...prev.paymentMethods, paymentMethod],
            }));
          } else {
            setUser((prev) => ({
              ...prev,
              paymentMethods: prev.paymentMethods.map((item) => {
                if (item._id === paymentMethod._id) {
                  return paymentMethod;
                } else {
                  return item;
                }
              }),
            }));
          }
          onSuccess?.(paymentMethod);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>
                  Payment method could not be {prefill ? "updated" : "added"}.
                  Please try again.
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
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Error happaned. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <form className="paymentMethodForm bankCard" onSubmit={submit}>
      {!prefill && (
        <p className="note">
          We’ll save this card for your convenience. Remove it by going to Your
          Account section
        </p>
      )}
      <section className="inputs">
        <input
          type="text"
          name="name"
          placeholder="Name on your card"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={true}
        />
        <input
          type="number"
          name="cardNumber"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => {
            if (e.target.value.match(/^3[47][0-9]{13}$/)) {
              setBrand("amex");
            } else if (e.target.value.match(/^4[0-9]{12}(?:[0-9]{3})?$$/)) {
              setBrand("visa");
            } else if (
              e.target.value.match(
                /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/
              )
            ) {
              setBrand("masterCard");
            } else {
              setBrand(null);
            }
            setCardNumber(e.target.value);
          }}
          required={true}
        />
        <section className="exp">
          <label>Expiry Date</label>
          <Combobox
            placeholder="Month"
            options={[
              { label: "Jan", value: "01" },
              { label: "Feb", value: "02" },
              { label: "Mar", value: "03" },
              { label: "Apr", value: "04" },
              { label: "May", value: "05" },
              { label: "Jun", value: "06" },
              { label: "Jul", value: "07" },
              { label: "Aug", value: "08" },
              { label: "Sep", value: "09" },
              { label: "Oct", value: "10" },
              { label: "Nov", value: "11" },
              { label: "Dec", value: "12" },
            ]}
            required={true}
            onChange={(e) => setExpMonth(e.value)}
          />
          <Combobox
            placeholder="Year"
            options={years}
            required={true}
            onChange={(e) => setExpYear(e.value)}
          />
        </section>
        <section className="cvv">
          <label>CVV</label>
          <input
            type="number"
            name="cvv"
            required={true}
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
          />
        </section>
      </section>
      <button>Save</button>
      {unsupporetdCard && (
        <p className="cardErr">Enter valid Visa/MasterCard</p>
      )}
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </form>
  );
};
export const NetBankingForm = ({ prefill, onSuccess }) => {
  const { setUser } = useContext(SiteContext);
  const [bank, setBank] = useState(prefill?.bank || "");
  const [name, setName] = useState(prefill?.name || "");
  const [ifsc, setIfsc] = useState(prefill?.ifsc || "");
  const [city, setCity] = useState(prefill?.city || "");
  const [type, setType] = useState(prefill?.type || "");
  const [msg, setMsg] = useState(null);
  const [accountNumber, setAccountNumber] = useState(
    prefill?.accountNumber || ""
  );
  const submit = (e) => {
    e.preventDefault();
    fetch(prefill ? "/api/editPaymentMethod" : "/api/addPaymentMethod", {
      method: prefill ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "BankAccount",
        name,
        bank,
        ifsc,
        accountNumber,
        city,
        accountType: type,
        ...(prefill && { _id: prefill._id }),
      }),
    })
      .then((res) => res.json())
      .then(({ paymentMethod }) => {
        if (paymentMethod) {
          if (!prefill) {
            setUser((prev) => ({
              ...prev,
              paymentMethods: [...prev.paymentMethods, paymentMethod],
            }));
          } else {
            setUser((prev) => ({
              ...prev,
              paymentMethods: prev.paymentMethods.map((item) => {
                if (item._id === paymentMethod._id) {
                  return paymentMethod;
                } else {
                  return item;
                }
              }),
            }));
          }
          onSuccess?.(paymentMethod);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not update payment method. Please try again.</h4>
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
              <h4>
                Could not updated payment method. Make sure you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  return (
    <form className="paymentMethodForm netBanking" onSubmit={submit}>
      <section className="inputs">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={true}
        />
        <input
          type="text"
          name="bank"
          placeholder="Bank"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          required={true}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required={true}
        />
        <input
          type="text"
          name="type"
          placeholder="Account type ie. Savings / Current"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required={true}
        />
        <input
          type="text"
          name="accountNumber"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required={true}
        />
        <input
          type="text"
          name="ifsc"
          placeholder="IFSC"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          required={true}
        />
      </section>
      <button type="submit">Save</button>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </form>
  );
};

export const BankCard = ({ card, onClick }) => {
  return (
    <div className="paymentMethod card" onClick={() => onClick?.(card)}>
      <Img
        className="logo"
        src={card.brand === "visa" ? "/payment_visa.png" : "/payment_mc.png"}
      />
      <p className="cardNumber">
        **** **** **** **** {card.cardNumber.substr(-4)}
      </p>
      <p className="cardHolder">{card.nameOnCard}</p>
      <p className="exp">{card.exp}</p>
    </div>
  );
};
export const BankAccount = ({ account, onClick }) => {
  return (
    <div
      className="paymentMethod bankAccount"
      onClick={() => onClick?.(account)}
    >
      <p className="bank">{account.bank}</p>
      {
        // <p className="accountType">{account.type}</p>
      }
      <p className="name">{account.name}</p>
      <p className="accountNumber">{account.accountNumber}</p>
      <p className="ifsc">{account.ifsc}</p>
      {
        // <p className="city">{account.city}</p>
      }
    </div>
  );
};

export const Cards = ({ paymentMethods }) => {
  const container = useRef(null);
  const [style, setStyle] = useState({});
  const [wrapperStyle, setWrapperStyle] = useState({});
  const [index, setIndex] = useState(0);
  const [paymentForm, setPaymentForm] = useState(false);
  useLayoutEffect(() => {
    const { width } = container.current.getBoundingClientRect();
    setStyle({
      width,
      height: width * 0.55,
    });
    setWrapperStyle({
      transform: `translateX(${-(width * index)}px)`,
    });
  }, [index]);
  return (
    <div className="savedCards">
      <div className="wrapper" ref={container}>
        <ul className="cards" style={wrapperStyle}>
          {paymentMethods.map((method, i) => (
            <li style={style} key={i}>
              {method._id && method.__t === "BankCard" && (
                <BankCard card={method} />
              )}
              {method._id && method.__t === "BankAccount" && (
                <BankAccount account={method} />
              )}
            </li>
          ))}
          {paymentMethods.length === 0 && (
            <li style={style}>
              <p className="placeholder">Withdraw Payments</p>
            </li>
          )}
        </ul>
        <button
          className="addPaymentMethod"
          onClick={() => setPaymentForm(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="15.999"
            viewBox="0 0 16 15.999"
          >
            <path
              id="Union_1"
              data-name="Union 1"
              d="M-4613,16V9h-7V7h7V0h2V7h7V9h-7v7Z"
              transform="translate(4620)"
              fill="#2699fb"
            />
          </svg>
        </button>
      </div>
      {index > 0 && (
        <button className="prev" onClick={() => setIndex((prev) => prev - 1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="31.818"
            height="44.147"
            viewBox="0 0 31.818 44.147"
          >
            <defs>
              <filter
                id="Path_217"
                x="0"
                y="0"
                width="31.818"
                height="44.147"
                filterUnits="userSpaceOnUse"
              >
                <feOffset dx="-3" dy="3" input="SourceAlpha" />
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feFlood floodOpacity="0.161" />
                <feComposite operator="in" in2="blur" />
                <feComposite in="SourceGraphic" />
              </filter>
            </defs>
            <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Path_217)">
              <g
                id="Path_217-2"
                data-name="Path 217"
                transform="translate(27.32 4.5) rotate(90)"
                fill="#858585"
              >
                <path
                  d="M 27.53220176696777 15.71776485443115 C 26.13888931274414 15.2262544631958 24.10462951660156 14.50919151306152 22.07958030700684 13.79734325408936 C 14.74783992767334 11.22007274627686 14.70039939880371 11.22007274627686 14.5736198425293 11.22007274627686 C 14.44684028625488 11.22007274627686 14.39939975738525 11.22007274627686 7.067659854888916 13.79734325408936 C 5.042610645294189 14.50919151306152 3.00835108757019 15.2262544631958 1.615038275718689 15.71776485443115 L 14.5736198425293 0.7635064125061035 L 27.53220176696777 15.71776485443115 Z"
                  stroke="none"
                />
                <path
                  d="M 14.5736198425293 1.526998519897461 L 3.229276657104492 14.61841773986816 C 4.349065780639648 14.22377777099609 5.627307891845703 13.77366733551025 6.901840209960938 13.32564258575439 C 14.31408023834229 10.72007274627686 14.33368015289307 10.72007274627686 14.5736198425293 10.72007274627686 C 14.81355953216553 10.72007274627686 14.83315944671631 10.72007274627686 22.24539947509766 13.32564258575439 C 23.51993179321289 13.77366733551025 24.79817390441895 14.22377777099609 25.9179630279541 14.61841773986816 L 14.5736198425293 1.526998519897461 M 14.5736198425293 1.9073486328125e-06 L 29.14723968505859 16.81802368164063 C 29.14723968505859 16.81802368164063 14.71584987640381 11.72007274627686 14.5736198425293 11.72007274627686 C 14.43138980865479 11.72007274627686 0 16.81802368164063 0 16.81802368164063 L 14.5736198425293 1.9073486328125e-06 Z"
                  stroke="none"
                  fill="#858585"
                />
              </g>
            </g>
          </svg>
        </button>
      )}
      {index + 1 < paymentMethods.length && (
        <button className="next" onClick={() => setIndex((prev) => prev + 1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="31.818"
            height="44.147"
            viewBox="0 0 31.818 44.147"
          >
            <defs>
              <filter
                id="Path_217"
                x="0"
                y="0"
                width="31.818"
                height="44.147"
                filterUnits="userSpaceOnUse"
              >
                <feOffset dx="-3" dy="3" input="SourceAlpha" />
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feFlood floodOpacity="0.161" />
                <feComposite operator="in" in2="blur" />
                <feComposite in="SourceGraphic" />
              </filter>
            </defs>
            <g transform="matrix(1, 0, 0, 1, 0, 0)" filter="url(#Path_217)">
              <g
                id="Path_217-2"
                data-name="Path 217"
                transform="translate(27.32 4.5) rotate(90)"
                fill="#858585"
              >
                <path
                  d="M 27.53220176696777 15.71776485443115 C 26.13888931274414 15.2262544631958 24.10462951660156 14.50919151306152 22.07958030700684 13.79734325408936 C 14.74783992767334 11.22007274627686 14.70039939880371 11.22007274627686 14.5736198425293 11.22007274627686 C 14.44684028625488 11.22007274627686 14.39939975738525 11.22007274627686 7.067659854888916 13.79734325408936 C 5.042610645294189 14.50919151306152 3.00835108757019 15.2262544631958 1.615038275718689 15.71776485443115 L 14.5736198425293 0.7635064125061035 L 27.53220176696777 15.71776485443115 Z"
                  stroke="none"
                />
                <path
                  d="M 14.5736198425293 1.526998519897461 L 3.229276657104492 14.61841773986816 C 4.349065780639648 14.22377777099609 5.627307891845703 13.77366733551025 6.901840209960938 13.32564258575439 C 14.31408023834229 10.72007274627686 14.33368015289307 10.72007274627686 14.5736198425293 10.72007274627686 C 14.81355953216553 10.72007274627686 14.83315944671631 10.72007274627686 22.24539947509766 13.32564258575439 C 23.51993179321289 13.77366733551025 24.79817390441895 14.22377777099609 25.9179630279541 14.61841773986816 L 14.5736198425293 1.526998519897461 M 14.5736198425293 1.9073486328125e-06 L 29.14723968505859 16.81802368164063 C 29.14723968505859 16.81802368164063 14.71584987640381 11.72007274627686 14.5736198425293 11.72007274627686 C 14.43138980865479 11.72007274627686 0 16.81802368164063 0 16.81802368164063 L 14.5736198425293 1.9073486328125e-06 Z"
                  stroke="none"
                  fill="#858585"
                />
              </g>
            </g>
          </svg>
        </button>
      )}
      <Modal
        head={true}
        label="Add Payment Method"
        setOpen={setPaymentForm}
        className="paymentMethodsForm"
        open={paymentForm}
      >
        <PaymentMethodForm
          onSuccess={(method) => {
            setPaymentForm(false);
          }}
        />
      </Modal>
    </div>
  );
};
const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setTransactions(data);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not get transactions</h4>
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
              <h4>Error happened. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, []);
  return (
    <div className="transactions">
      <div className="head">
        <p>All Transaction History</p>
      </div>
      <ul className="allTransactions">
        {transactions.map((transaction) => (
          <SingleTransaction key={transaction._id} transaction={transaction} />
        ))}
        {transactions.length === 0 && (
          <p className="placeholder">No transaction yet.</p>
        )}
      </ul>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const SingleTransaction = ({ transaction }) => {
  let icon = null;
  switch (transaction.__t) {
    case "AddMoney":
      icon = (
        <>
          <div className="icon">
            <Plus_svg />
          </div>
          <p className="detail">Money added to wallet</p>
        </>
      );
      break;
    case "WithdrawMoney":
      icon = (
        <>
          <div className="icon">
            <Minus_svg />
          </div>
          <p className="detail">Money withdrawal from Wallet</p>
        </>
      );
      break;
    case "P2PTransaction":
      icon =
        transaction.amount < 0 ? (
          <>
            <div className="icon">
              <Arrow_up_svg />
            </div>
            <p className="detail">
              Paid to{" "}
              <span className="userName">
                {transaction.client?.firstName +
                  " " +
                  transaction.client?.lastName}
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="icon">
              <Arrow_down_svg />
            </div>
            <p className="detail">
              Received from{" "}
              <span className="userName">
                {transaction.client?.firstName +
                  " " +
                  transaction.client?.lastName}
              </span>
            </p>
          </>
        );
      break;
    default:
      icon =
        transaction.amount < 0 ? (
          <>
            <div className="icon">
              <Minus_svg />
            </div>
            <p className="detail">{transaction.note}</p>
          </>
        ) : (
          <>
            <div className="icon">
              <Plus_svg />
            </div>
            <p className="detail">{transaction.note}</p>
          </>
        );
  }
  return (
    <li className="transaction">
      {icon}
      <p className="amount">₹{Math.abs(transaction.amount.fix())}</p>
    </li>
  );
};

export default Wallet;
