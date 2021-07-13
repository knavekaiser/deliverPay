import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal } from "./Modal";
import {
  Err_svg,
  Step_tick,
  Step_blank,
  Step_fill,
  Prog_done,
  Prog_running,
  Prog_runningBack,
} from "./Elements";
import { MilestoneReleaseForm, DisputeForm } from "./Forms";

const Hold = ({ history, location, match }) => {
  const [milestones, setMilestones] = useState([]);
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch("/api/milestone")
      .then((res) => res.json())
      .then((data) => {
        setMilestones(data);
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not update milestones.</h4>
            </div>
          </>
        );
      });
  }, []);
  return (
    <div className="holdContainer">
      <div className="benner">
        <h4>Secure your transactions</h4>
        <p>All payments and transactions come here</p>
      </div>
      <div className="head">
        <p>Milestone Status</p>
        <div className="filters">
          <div className="date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <svg
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="30.971"
              height="30.971"
              viewBox="0 0 30.971 30.971"
            >
              <path
                id="Path_299"
                data-name="Path 299"
                d="M3.992,2.42H6.775V.968a.968.968,0,1,1,1.936,0V2.42H22.26V.968a.968.968,0,1,1,1.936,0V2.42h2.783a4,4,0,0,1,3.992,3.992V26.978a4,4,0,0,1-3.992,3.992H3.992A4,4,0,0,1,0,26.978V6.412A4,4,0,0,1,3.992,2.42ZM26.978,4.355H24.2v.968a.968.968,0,1,1-1.936,0V4.355H8.71v.968a.968.968,0,1,1-1.936,0V4.355H3.992A2.059,2.059,0,0,0,1.936,6.412v2.3h27.1v-2.3A2.059,2.059,0,0,0,26.978,4.355ZM3.992,29.035H26.978a2.059,2.059,0,0,0,2.057-2.057V10.646H1.936V26.978A2.059,2.059,0,0,0,3.992,29.035Z"
                fill="#336cf9"
              />
            </svg>
          </div>
        </div>
      </div>
      <ul className="milestones">
        {milestones.map((milestone, i) => (
          <SingleMilestone
            key={i}
            milestone={milestone}
            setMilestones={setMilestones}
          />
        ))}
        {milestones.length === 0 && (
          <p className="placeholder">No transaction yet.</p>
        )}
      </ul>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </div>
  );
};
const SingleMilestone = ({ milestone, setMilestones }) => {
  const [releaseForm, setReleaseForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState(false);
  const [msg, setMsg] = useState(null);
  return (
    <li className={`milestone ${milestone.role}`} key={milestone._id}>
      <div className="clientDetail">
        <div className="profile">
          <img src={milestone.client.profileImg} />
          <p className="name">
            {milestone.client.firstName + " " + milestone.client.lastName}
          </p>
        </div>
        <div className="milestoneDetail">
          <ul>
            <li>
              <p>Role</p>-<p className="role">{milestone.role}</p>
            </li>
            <li>
              <p>Product Detail</p>-<p>{milestone.product?.dscr}</p>
            </li>
            <li>
              <p>Transaction ID</p>-<p>{milestone._id}</p>
            </li>
          </ul>
        </div>
      </div>
      <ul className={`steps ${milestone.status}`}>
        <li className="step pending">
          <div className="icons">
            <Step_tick className="default" />
            <Step_blank className="blank" />
            <Step_fill className="filled" />
          </div>
          <p>Deposite recieved</p>
        </li>
        <li className="progress pending">
          <Prog_done />
          <Prog_running />
          <Prog_runningBack />
        </li>
        <li className="step onhold">
          <div className="icons">
            <Step_tick className="default" />
            <Step_blank className="blank" />
            <Step_fill className="filled" />
          </div>
          <p>Funds on Hold</p>
        </li>
        <li className="progress onhold">
          <Prog_done />
          <Prog_running />
          <Prog_runningBack />
        </li>
        <li className="step released">
          <div className="icons">
            <Step_tick className="default" />
            <Step_blank className="blank" />
            <Step_fill className="filled" />
          </div>
          <p>Released</p>
        </li>
      </ul>
      <div className="clas">
        <h4>₹{milestone.amount}</h4>
        {milestone.role === "buyer" ? (
          <div className="btns">
            {(milestone.status === "pending" ||
              milestone.status === "inProgress") && (
              <Link
                className="dispute"
                to={`#`}
                onClick={() => setDisputeForm(true)}
              >
                Manual verification
              </Link>
            )}
            {milestone.status === "released" && (
              <Link className="released" to={`#`}>
                Released
              </Link>
            )}
            {milestone.status === "dispute" && (
              <Link className="disputed" to={`#`}>
                Dispute
              </Link>
            )}
          </div>
        ) : (
          <div className="btns">
            {milestone.status === "pending" && (
              <Link
                to={`/account/hold/${milestone._id}/approve`}
                onClick={() => {
                  fetch("/api/approveMilestone", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      milestone_id: milestone._id,
                      amount: milestone.amount,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.code === "ok") {
                        setMilestones((prev) => {
                          const newMilestones = [...prev];
                          const index = newMilestones.findIndex(
                            (item) => item._id === milestone._id
                          );
                          newMilestones[index] = {
                            ...milestone,
                            client: prev[index].client,
                          };
                          return newMilestones;
                        });
                      } else if (data.code === 403) {
                        setMsg(
                          <>
                            <button onClick={() => setMsg(null)}>Okay</button>
                            <div>
                              <Err_svg />
                              <h4>
                                Could not approve milestone due to low balance.
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
                              <h4>
                                Could not approve milestone. Please try again.
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
                            <h4>
                              Could not approve milestone. Make sure you're
                              online
                            </h4>
                          </div>
                        </>
                      );
                    });
                }}
              >
                Approve
              </Link>
            )}
            {milestone.status === "inProgress" && (
              <Link
                onClick={() => setReleaseForm(true)}
                to={`/account/hold/${milestone._id}/release`}
              >
                Release
              </Link>
            )}
            {milestone.status === "released" && (
              <Link
                className="dispute"
                to={`#`}
                onClick={() => setDisputeForm(true)}
              >
                Manual verification
              </Link>
            )}
            {milestone.status === "dispute" && (
              <Link
                className="disputeRes"
                to={"#"}
                onClick={() => setDisputeForm(true)}
              >
                Approve Dispute
              </Link>
            )}
            <Modal open={msg} className="msg">
              {msg}
            </Modal>
          </div>
        )}
      </div>
      <Modal open={releaseForm} className="milestoneReleaseForm">
        <div className="head">
          <p className="modalName">Release Money</p>
          <button onClick={() => setReleaseForm(false)}>
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
        <MilestoneReleaseForm
          milestone={milestone}
          setReleaseForm={setReleaseForm}
          onSuccess={(milestone) => {
            setMilestones((prev) => {
              const newMilestones = [...prev];
              const index = newMilestones.findIndex(
                (item) => item._id === milestone._id
              );
              newMilestones[index] = {
                ...milestone,
                client: prev[index].client,
                role: prev[index].role,
              };
              return newMilestones;
            });
            setReleaseForm(false);
          }}
        />
      </Modal>
      <Modal open={disputeForm} className="disputeForm">
        <div className="head">
          <p className="modalName">Manual Verification</p>
          <button onClick={() => setDisputeForm(false)}>
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
        <DisputeForm
          milestone={milestone}
          setDisputeForm={setDisputeForm}
          onSuccess={(milestone) => {
            setMilestones((prev) => {
              const newMilestones = [...prev];
              const index = newMilestones.findIndex(
                (item) => item._id === milestone._id
              );
              newMilestones[index] = {
                ...milestone,
                client: prev[index].client,
                role: prev[index].role,
              };
              return newMilestones;
            });
            setDisputeForm(false);
          }}
        />
      </Modal>
    </li>
  );
};

export default Hold;
