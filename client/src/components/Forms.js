import { useState, useEffect } from "react";
import { NumberInput, Combobox } from "./Elements";

export const MilestoneReleaseForm = ({
  milestone,
  setReleaseForm,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(milestone.amount);
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
              alert("something went wrong");
            }
          })
          .catch((err) => {
            console.log(err);
            alert("something went wrong");
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
    </form>
  );
};

export const DisputeForm = ({ milestone, setDisputeForm, onSuccess }) => {
  const [issue, setIssue] = useState("");
  const [dscr, setDscr] = useState("");
  const [caseFiles, setCaseFiles] = useState([]);
  const submit = (e) => {
    e.preventDefault();
    // upload files here
    fetch("/api/fileDispute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue,
        milestoneId: milestone._id,
        defendantId: milestone.client._id,
        _case: { dscr, caseFiles },
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then(({ milestone }) => {
            onSuccess?.(milestone);
          });
        } else if (res.status === 403) {
          alert(
            "Insufficient fund! you have to have ₹500 in your wallet to file a dispute."
          );
        } else {
          alert("someting went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("someting went wrong");
      });
  };
  return (
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
        <textarea
          name="description"
          value={dscr}
          required={true}
          onChange={(e) => setDscr(e.target.value)}
        />
      </section>
      <section className="fileInput">
        <label htmlFor="for">
          Upload images to prove your case. ie: Product of image, proof of
          delivery.
        </label>
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
          required={true}
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
  );
};
