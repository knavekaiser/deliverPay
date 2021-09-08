import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { SiteContext } from "../SiteContext";
import {
  NumberInput,
  Combobox,
  Err_svg,
  FileInput,
  UploadFiles,
  Img,
} from "./Elements";
import { Link } from "react-router-dom";
import { Modal } from "./Modal";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const MilestoneForm = ({
  action,
  client,
  onSuccess,
  definedAmount,
  order,
  refund,
  strict,
}) => {
  const { user, setUser, config } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [addressForm, setAddressForm] = useState(false);
  const [userDetail, setUserDetail] = useState({ ...user });
  const [clientDetail, setClientDetail] = useState({ ...client });
  const [dscr, setDscr] = useState("");
  const [amount, setAmount] = useState(definedAmount || "");
  const [fee, setFee] = useState(0);
  const [msg, setMsg] = useState(null);
  const onTimeout = useRef();
  const requestMilestone = useCallback(() => {
    fetch("/api/requestMilestone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: client._id,
        amount,
        dscr,
        order,
        refund,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.({ ...data });
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not request milestone. Try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not request milestone. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [clientDetail, userDetail, amount, dscr]);
  const createMilestone = useCallback(() => {
    fetch("/api/createMilestone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller: { ...clientDetail },
        amount,
        dscr,
        order,
        refund,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.({ ...data });
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Insufficient fund</h4>
                <Link to="/account/profile/wallet">
                  Add Money to your wallet now.
                </Link>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not create milestone. Try again</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not create milestone. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [clientDetail, userDetail, amount, dscr]);
  useEffect(() => {
    setFee(() => {
      return ((+amount / 100) * config.fee).fix();
    });
  }, [amount]);
  return (
    <>
      <form
        className="milestonesForm"
        onSubmit={(e) => {
          setLoading(true);
          e.preventDefault();
          toast(
            <div className="toast">
              Milestone is being{" "}
              {action === "create" ? "created." : "requested."}{" "}
              <button
                className="undo"
                onClick={() => {
                  onTimeout.current = null;
                }}
              >
                Undo
              </button>
            </div>,
            {
              position: "bottom-center",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              onClose: () => {
                onTimeout.current?.();
                setLoading(false);
              },
              draggable: true,
              progress: undefined,
            }
          );
          if (action === "create") {
            onTimeout.current = createMilestone;
          } else {
            onTimeout.current = requestMilestone;
          }
        }}
      >
        <section className="transactionDetail">
          <section className="amount">
            <label>Amount</label>
            <NumberInput
              readOnly={strict}
              min={10}
              defaultValue={definedAmount || 0}
              required={true}
              onChange={(e) => setAmount((+e.target.value).toString())}
            />
          </section>
          {amount && (
            <>
              {action === "create" && (
                <label className="receivable">
                  {client.firstName} {client.lastName} will recieve ₹
                  {(amount - fee).fix()}
                </label>
              )}
              {action === "request" && (
                <label className="receivable">
                  You will recieve ₹{(amount - fee).fix()}
                </label>
              )}
            </>
          )}
          <section>
            <label>Detail</label>
            <input
              value={dscr}
              required={true}
              onChange={(e) => setDscr(e.target.value)}
            />
          </section>
          <button type="submit">
            {action === "create" ? "Create Milestone" : "Request Milestone"}
          </button>
        </section>
        <section className="clientDetail">
          {action === "request" && (
            <>
              <Img src={client?.profileImg || "/profile-user.jpg"} />
              <label>Buyer Information</label>
              <div className="detail">
                <section className="profileDetail">
                  <p className="name">
                    {client?.firstName + " " + client?.lastName}
                  </p>
                  <p className="phone">{client?.phone}</p>
                  <p className="email">{client?.email}</p>
                </section>
                {client?.address?.street && (
                  <section className="address">
                    <p className="street">
                      {client.address?.street}, {client.address?.city},{" "}
                      {client.address?.zip}
                    </p>
                  </section>
                )}
              </div>
            </>
          )}
          {action === "request" ? null : (
            <div className="sellerInfo">
              <Img src={clientDetail?.profileImg || "/profile-user.jpg"} />
              <label>Seller Information</label>
              <div className="detail">
                <section className="profileDetail">
                  <p className="name">
                    {clientDetail?.firstName} {clientDetail?.lastName}
                  </p>
                  <p className="phone">{clientDetail?.phone}</p>
                  <p className="email">{clientDetail?.email}</p>
                </section>
              </div>
            </div>
          )}
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
export const MilestoneReleaseForm = ({
  milestone,
  setReleaseForm,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(milestone.amount);
  const [msg, setMsg] = useState(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        fetch("/api/releaseMilestone", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: milestone._id, amount }),
        })
          .then((res) => res.json())
          .then(({ code, milestone }) => {
            if (milestone) {
              onSuccess?.(milestone);
            } else if (code === 403) {
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Err_svg />
                    <h4>Could not release Milestone due to low balance.</h4>
                  </div>
                </>
              );
            } else {
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Err_svg />
                    <h4>Could not release Milestone.</h4>
                  </div>
                </>
              );
            }
          })
          .catch((err) => {
            console.log(err);
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not release Milestone. Make sure you're online.</h4>
              </div>
            </>;
          });
      }}
    >
      You sure want to release this Milestone?
      {
        // <label>How much money you want to release?</label>
        //   <NumberInput
        //   defaultValue={amount}
        //   onChange={(e) => setAmount(e.target.value)}
        // />
      }
      <section className="btns">
        <button type="submit">Confirm</button>
        <button
          className="cancel"
          type="button"
          onClick={() => setReleaseForm(false)}
        >
          Cancel
        </button>
      </section>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </form>
  );
};

export const AddressForm = ({ client, onSuccess, onCancel }) => {
  const [name, setName] = useState(
    client ? client.name || client.firstName + " " + client.lastName : ""
  );
  const [phone, setPhone] = useState(client?.phone || "");
  const [zip, setZip] = useState(client?.address?.zip || "");
  const [locality, setLocatily] = useState(client?.address?.locality || "");
  const [street, setStreet] = useState(client?.address?.street || "");
  const [city, setCity] = useState(client?.address?.city || "");
  const [state, setState] = useState(client?.address?.state || "");
  const [landmark, setLandmark] = useState(client?.address?.landmark || "");
  const [altPhone, setAltPhone] = useState(client?.address?.altPhone || "");
  return (
    <form
      className="addressForm"
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess?.({
          address: {
            name,
            phone,
            street,
            city,
            state,
            zip,
            locality,
            landmark,
            altPhone,
          },
        });
      }}
    >
      <section>
        <label htmlFor="name">Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          name="name"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="phone">Phone Number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          name="phone"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="zip">PIN Code</label>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          type="number"
          name="zip"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="locality">Locality</label>
        <input
          value={locality}
          onChange={(e) => setLocatily(e.target.value)}
          type="text"
          name="locality"
          required={true}
        />
      </section>
      <section className="street">
        <label htmlFor="address">Address</label>
        <textarea
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          resiz="off"
          type="text"
          name="address"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="city">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          type="text"
          name="city"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="state">State</label>
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          type="text"
          name="state"
          required={true}
        />
      </section>
      <section>
        <label htmlFor="landmark">Landmark (Optional)</label>
        <input
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          type="text"
          name="landmark"
        />
      </section>
      <section>
        <label htmlFor="altPhone">Alternate Phone (Optional)</label>
        <input
          value={altPhone}
          onChange={(e) => setAltPhone(e.target.value)}
          type="tel"
          name="altPhone"
        />
      </section>
      <button className="save">Save</button>
      <button className="cancel" type="button" onClick={() => onCancel?.()}>
        Cancel
      </button>
      <section className="pBtm" />
    </form>
  );
};

export const DisputeForm = ({ milestone, setDisputeForm, onSuccess }) => {
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [dscr, setDscr] = useState("");
  const [caseFiles, setCaseFiles] = useState([]);
  const [msg, setMsg] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileLinks = caseFiles.length
      ? await UploadFiles({
          files: caseFiles,
          setMsg,
        })
      : [];
    fetch("/api/fileDispute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue,
        milestoneId: milestone._id,
        defendantId: milestone.client._id,
        _case: { dscr, files: fileLinks },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.milestone);
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>
                  Insufficient fund! you have to have ₹500 in your wallet to
                  file a dispute.
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
                <h4>Could not file dispute.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(true);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not file dispute. make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form className="disputeForm" onSubmit={submit}>
        <h4>You feel like you are getting scammed?</h4>
        <section>
          <label htmlFor="issue">Issue</label>
          <Combobox
            name="issue"
            options={
              milestone.role === "buyer"
                ? [
                    {
                      label: "Buyer Not Releasing Payments",
                      value: "Buyer Not Releasing Payments",
                    },
                  ]
                : [
                    {
                      label: "Goods Not Received",
                      value: "Goods Not Received",
                    },
                    {
                      label: "Services Not Received",
                      value: "Services Not Received",
                    },
                    {
                      label: "Damaged",
                      value: "Damaged",
                    },
                    {
                      label: "Not As Agreed",
                      value: "Not As Agreed",
                    },
                    {
                      label: "Not As Displayed",
                      value: "Not As Displayed",
                    },
                  ]
            }
            onChange={(e) => {
              setIssue(e.value);
            }}
          />
        </section>
        <section>
          <label htmlFor="description">Description</label>
          <TextareaAutosize
            name="description"
            value={dscr}
            required={true}
            onChange={(e) => setDscr(e.target.value)}
          />
        </section>
        <section>
          <label htmlFor="for">
            Upload images to prove your case. ie: Product of image, proof of
            delivery.
          </label>
          <FileInput
            multiple={true}
            accept="audio/*,video/*,image/*"
            onChange={(e) => setCaseFiles(e)}
          />
        </section>
        <section className="btns">
          <button className="submit" type="submit">
            Submit
          </button>
          <button className="cancel" type="button">
            Cancel
          </button>
        </section>
        <div className="pBtm" />
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};

export const TicketForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(false);
  const [issue, setIssue] = useState("");
  const [milestone, setMilestone] = useState("");
  const [transaction, setTransaction] = useState("");
  const [files, setFiles] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileLinks = files.length ? await UploadFiles({ files, setMsg }) : [];
    fetch("/api/openTicket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue,
        milestone,
        transaction,
        message: {
          body: message,
          files: fileLinks,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.ticket);
        } else if (data.message === "milestone ID is invalid") {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Milestone Id is invalid.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Ticket could not be submitted.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Ticket could not be submitted. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form className="ticketForm" onSubmit={submit}>
        <section>
          <label>Issue</label>
          <input
            value={issue}
            required={true}
            onChange={(e) => setIssue(e.target.value)}
          />
        </section>
        <section>
          <label>Milestone ID (optional)</label>
          <input
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
          />
        </section>
        <section>
          <label>Transaction ID (optional)</label>
          <input
            value={transaction}
            onChange={(e) => setTransaction(e.target.value)}
          />
        </section>
        <section>
          <label>Detail</label>
          <TextareaAutosize
            required={true}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </section>
        <section>
          <label htmlFor="for">Upload relevant files (optional)</label>
          <FileInput onChange={(files) => setFiles(files)} />
        </section>
        <section className="btns">
          <button className="submit" type="submit">
            Submit
          </button>
          <button className="cancel" type="button">
            Cancel
          </button>
        </section>
        <div className="pBtm" />
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};
export const TicketReplyForm = ({ _id, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(false);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fileLinks = files.length ? await UploadFiles({ files, setMsg }) : [];
    fetch("/api/addTicketReply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id,
        message: { body: message, files: fileLinks },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.(data.ticket);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Reply could not be submitted.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Reply could not be submitted. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <form className="ticketReplyForm" onSubmit={submit}>
        <section>
          <label>Message</label>
          <TextareaAutosize
            required={true}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </section>
        <section>
          <label htmlFor="for">Upload relevant files (optional)</label>
          <FileInput
            accept="audio/*,video/*,image/*"
            multiple={true}
            onChange={(files) => setFiles(files)}
          />
        </section>
        <section className="btns">
          <button className="submit" type="submit">
            Submit
          </button>
          <button className="cancel" type="button">
            Cancel
          </button>
        </section>
        <div className="pBtm" />
      </form>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};
