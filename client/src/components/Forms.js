import { useState, useEffect } from "react";
import {
  NumberInput,
  Combobox,
  Err_svg,
  FileInput,
  UploadFiles,
} from "./Elements";
import { Modal } from "./Modal";
import TextareaAutosize from "react-textarea-autosize";

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
          .then(({ milestone }) => {
            if (milestone) {
              onSuccess?.(milestone);
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
      <label>How much money you want to release?</label>
      <NumberInput
        defaultValue={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
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

export const DisputeForm = ({ milestone, setDisputeForm, onSuccess }) => {
  const [issue, setIssue] = useState("");
  const [dscr, setDscr] = useState("");
  const [caseFiles, setCaseFiles] = useState([]);
  const [msg, setMsg] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
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
      .then((res) => {
        if (res.status === 200) {
          res.json().then(({ milestone }) => {
            onSuccess?.(milestone);
          });
        } else if (res.status === 403) {
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
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};

export const TicketForm = ({ onSuccess }) => {
  const [msg, setMsg] = useState(false);
  const [issue, setIssue] = useState("");
  const [milestone, setMilestone] = useState("");
  const [transaction, setTransaction] = useState("");
  const [caseFiles, setCaseFiles] = useState("");
  const [message, setMessage] = useState("");
  const submit = (e) => {
    e.preventDefault();
    // upload files here.
    const files = [];
    fetch("/api/openTicket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue,
        milestone,
        transaction,
        message: {
          body: message,
          files,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
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
        <section className="fileInput">
          <label htmlFor="for">Upload relevant files (optional)</label>
          {caseFiles.length > 0 && (
            <ul>
              {caseFiles.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          )}
          <input
            type="file"
            name="files"
            accept="audio/*,video/*,image/*"
            multiple={true}
            onChange={(e) => {
              setCaseFiles(Object.values(e.target.files));
            }}
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
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};
export const TicketReplyForm = ({ _id, onSuccess }) => {
  const [msg, setMsg] = useState(false);
  const [caseFiles, setCaseFiles] = useState("");
  const [message, setMessage] = useState("");
  const submit = (e) => {
    e.preventDefault();
    // upload files here.
    const files = [];
    fetch("/api/addTicketReply", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id,
        message: { body: message, files },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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
        <section className="fileInput">
          <label htmlFor="for">Upload relevant files (optional)</label>
          {caseFiles.length > 0 && (
            <ul>
              {caseFiles.map((file, i) => (
                <li key={i}>{file.name}</li>
              ))}
            </ul>
          )}
          <input
            type="file"
            name="files"
            accept="audio/*,video/*,image/*"
            multiple={true}
            onChange={(e) => {
              setCaseFiles(Object.values(e.target.files));
            }}
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
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};
