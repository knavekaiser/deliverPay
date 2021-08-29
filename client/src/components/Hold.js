import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useContext,
  lazy,
} from "react";
import { SiteContext } from "../SiteContext";
import { Link, useHistory } from "react-router-dom";
import { Modal, Confirm } from "./Modal";
import {
  Err_svg,
  Step_tick,
  Step_blank,
  Step_fill,
  Prog_done,
  Prog_running,
  Prog_runningBack,
  Succ_svg,
  X_svg,
  Combobox,
  Pagination,
  Img,
  Moment,
  moment,
} from "./Elements";
import { MilestoneReleaseForm, DisputeForm } from "./Forms";
import { DateRange } from "react-date-range";
import queryString from "query-string";

require("./styles/hold.scss");

const Hold = ({ history, location, match }) => {
  const { userType } = useContext(SiteContext);
  const dateFilterRef = useRef();
  const [milestones, setMilestones] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(
    queryString.parse(location.search).page || 1
  );
  const [perPage, setPerPage] = useState(
    queryString.parse(location.search).perPage || 20
  );
  const [search, setSearch] = useState(
    queryString.parse(location.search).q?.replace(/\/(?!.*\/).*/, "") || ""
  );
  const [status, setStatus] = useState(
    queryString.parse(location.search).status || ""
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [sort, setSort] = useState({
    column: queryString.parse(location.search).sort || "createdAt",
    order: queryString.parse(location.search).order || "dsc",
  });
  const [dateFilter, setDateFilter] = useState(false);
  const [datePickerStyle, setDatePickerStyle] = useState({});
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    fetch(`/api/milestone${location.search}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMilestones(data.milestones);
          setTotal(data.total);
        }
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
  }, [location.search, userType]);
  useEffect(() => {
    const startDate = moment({
      time: dateRange?.startDate,
      format: "YYYY-MM-DD",
    });
    const endDate = moment({
      time: dateRange?.endDate.setHours(24, 0, 0, 0),
      format: "YYYY-MM-DD",
    });
    history.replace({
      pathname: location.pathname,
      search:
        "?" +
        new URLSearchParams({
          // userType,
          page,
          perPage,
          sort: sort.column,
          order: sort.order,
          ...(search && { q: search }),
          ...(dateFilter && {
            dateFrom: startDate,
            dateTo: endDate,
          }),
          ...(status && { status }),
        }).toString(),
    });
  }, [
    page,
    perPage,
    sort.column,
    sort.order,
    search,
    dateFilter,
    status,
    userType,
  ]);
  useLayoutEffect(() => {
    const {
      height,
      y,
      width,
      x,
    } = dateFilterRef.current.getBoundingClientRect();
    setDatePickerStyle({
      position: "fixed",
      top: height + y + 4,
      right: window.innerWidth - x - width,
    });
  }, []);
  return (
    <div className="holdContainer">
      <div style={{ display: "none" }}>
        <X_svg />
      </div>
      <div className="benner">
        <h4>Secure your transactions</h4>
        <p>All payments and transactions come here</p>
      </div>
      <div className="head">
        {
          // <p>Milestone Status</p>
        }
        <div className="filters">
          <section>
            <label>Total:</label>
            {total}
          </section>
          <section>
            <label>Per Page:</label>
            <Combobox
              defaultValue={0}
              options={[
                { label: "20", value: 20 },
                { label: "30", value: 30 },
                { label: "50", value: 50 },
              ]}
              onChange={(e) => setPerPage(e.value)}
            />
          </section>
          <section className="search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 23 23"
            >
              <path
                id="Icon_ionic-ios-search"
                data-name="Icon ionic-ios-search"
                d="M27.23,25.828l-6.4-6.455a9.116,9.116,0,1,0-1.384,1.4L25.8,27.188a.985.985,0,0,0,1.39.036A.99.99,0,0,0,27.23,25.828ZM13.67,20.852a7.2,7.2,0,1,1,5.091-2.108A7.155,7.155,0,0,1,13.67,20.852Z"
                transform="translate(-4.5 -4.493)"
                fill="#707070"
                opacity="0.74"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Buyer's or Seller's name, phone, Milestone ID"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X_svg />
              </button>
            )}
          </section>
          <section className="status">
            <label>Status:</label>
            <Combobox
              defaultValue={status || 0}
              options={[
                { label: "All", value: "" },
                { label: "In Progress", value: "inProgress" },
                { label: "Pending", value: "pending" },
                { label: "Release requested", value: "pendingRelease" },
                { label: "Released", value: "released" },
                { label: "Dispute", value: "dispute" },
              ]}
              onChange={(e) => setStatus(e.value)}
            />
          </section>
          <section
            className={`date ${dateFilter ? "open" : ""}`}
            ref={dateFilterRef}
            onClick={() => setDateOpen(true)}
          >
            <svg
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
            {dateFilter && (
              <>
                <div className="dates">
                  <p>
                    From:{" "}
                    <Moment format="DD MMM, YYYY">{dateRange.startDate}</Moment>
                  </p>
                  <p>
                    To:{" "}
                    <Moment format="DD MMM, YYYY">{dateRange.endDate}</Moment>
                  </p>
                </div>
                <button
                  className="clearDateFilter"
                  onClick={() => {
                    setDateRange({
                      startDate: new Date(),
                      endDate: new Date(),
                    });
                    setDateFilter(false);
                  }}
                >
                  <X_svg />
                </button>
              </>
            )}
          </section>
        </div>
      </div>
      <ul className="milestones">
        {milestones.map((milestone, i) =>
          milestone.role === "seller" ? (
            <SellerMilestone
              key={i}
              milestone={milestone}
              setMilestones={setMilestones}
            />
          ) : (
            <BuyerMilestone
              key={i}
              milestone={milestone}
              setMilestones={setMilestones}
            />
          )
        )}
        {milestones.length === 0 && (
          <p className="placeholder">No transaction yet.</p>
        )}
      </ul>
      <Pagination
        total={total}
        perPage={perPage}
        currentPage={page}
        btns={5}
        setPage={setPage}
      />
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
      <Modal
        open={dateOpen}
        onBackdropClick={() => setDateOpen(false)}
        className="datePicker"
        backdropClass="datePicker"
        style={datePickerStyle}
      >
        <DateRange
          className="dateRange"
          ranges={[dateRange]}
          onChange={(e) => {
            setDateRange(e.range1);
            if (e.range1.endDate !== e.range1.startDate) {
              setDateOpen(false);
              setDateFilter(true);
            }
          }}
        />
      </Modal>
    </div>
  );
};

const CommonMilestoneElement = ({ milestone }) => {
  return (
    <>
      <div className="clientDetail">
        <div className="profile">
          <Img src={milestone.client.profileImg || "/profile-user.jpg"} />
          <p className="name">
            {milestone.client.firstName + " " + milestone.client.lastName}
          </p>
        </div>
        <div className="milestoneDetail">
          <ul>
            <li>
              <p>Date</p>-
              <p>
                <Moment format="DD MMM, YYYY. hh:mm a">
                  {milestone.createdAt}
                </Moment>
              </p>
            </li>
            <li>
              <p>Role</p>-<p className="role">{milestone.role}</p>
            </li>
            <li>
              <p>Desciption</p>-<p>{milestone.dscr}</p>
            </li>
            <li>
              <p>Milestone ID</p>-<p>{milestone._id}</p>
            </li>
            <li className="status">
              <p>Status</p>-<p>{milestone.status}</p>
            </li>
          </ul>
        </div>
      </div>
      <ul className={`steps ${milestone.status} ${milestone.dispute?.status}`}>
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
    </>
  );
};

const SellerMilestone = ({ milestone, setMilestones }) => {
  const history = useHistory();
  const [releaseForm, setReleaseForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState(false);
  const [msg, setMsg] = useState(null);
  let myCase = null;
  let disputeFiledBy = null;
  if (milestone.dispute?.plaintiff._id === milestone.client._id) {
    myCase = milestone.dispute?.defendant?.case?.dscr;
    disputeFiledBy = "client";
  } else if (milestone.dispute?.defendant._id === milestone.client._id) {
    disputeFiledBy = "self";
  }
  const approveMilestone = () => {
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
          setMilestones((prev) =>
            prev.map((item) => {
              if (item._id === data.milestone._id) {
                return {
                  ...data.milestone,
                  client: milestone.client,
                  role: milestone.role,
                };
              } else {
                return item;
              }
            })
          );
        } else if (data.code === 403) {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not approve milestone due to low balance.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not approve milestone. Please try again.</h4>
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
              <h4>Could not approve milestone. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <li className={`milestone seller`} key={milestone._id}>
        <CommonMilestoneElement milestone={milestone} />
        <div className="clas">
          <h4>₹{milestone.amount}</h4>
          <div className="btns">
            {milestone.status === "pending" && (
              <a
                onClick={() =>
                  Confirm({
                    label: "Milestone Approval",
                    question: "You sure want to approve this milestone?",
                    callback: approveMilestone,
                  })
                }
              >
                Approve
              </a>
            )}
            {milestone.status === "pendingRelease" && (
              <a className="released">Release requested</a>
            )}
            {(milestone.status === "inProgress" ||
              milestone.status === "pendingRelease") && (
              <a onClick={() => setReleaseForm(true)}>Release</a>
            )}
            {
              //   (milestone.status === "pending" ||
              //   milestone.status === "inProgress") && (
              //   <a
              //     className="disputeRes"
              //     onClick={() =>
              //       console.log(
              //         "buyers are not allowed to cancel milestone after 30 seconds."
              //       )
              //     }
              //   >
              //     Cancel
              //   </a>
              // )
            }
            {milestone.status === "released" && (
              <a className="dispute" onClick={() => setDisputeForm(true)}>
                Raise Dispute
              </a>
            )}
            {((disputeFiledBy === "client" && myCase) ||
              disputeFiledBy === "self") && (
              <a className="disputed">Dispute {milestone.dispute?.status}</a>
            )}
            {disputeFiledBy === "client" && !myCase && (
              <a className="disputeRes" onClick={() => setDisputeForm(true)}>
                Approve Dispute
              </a>
            )}
            {milestone.status === "declined" && (
              <a className="disputed">Declined</a>
            )}
            <Modal open={msg} className="msg">
              {msg}
            </Modal>
          </div>
        </div>
        <Modal
          open={releaseForm}
          head={true}
          label="Release Money"
          setOpen={setReleaseForm}
          className="milestoneReleaseForm"
        >
          <MilestoneReleaseForm
            milestone={milestone}
            setReleaseForm={setReleaseForm}
            onSuccess={(milestone) => {
              setMilestones((prev) =>
                prev.map((item) => {
                  if (item._id === milestone._id) {
                    return {
                      ...milestone,
                      client: item.client,
                      role: item.role,
                    };
                  } else {
                    return item;
                  }
                })
              );
              setReleaseForm(false);
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4 className="amount">₹{milestone.amount}</h4>
                    <h4>Milestone has been released.</h4>
                  </div>
                </>
              );
            }}
          />
        </Modal>
        <Modal
          open={disputeForm}
          head={true}
          label="Raise Dispute"
          setOpen={setDisputeForm}
          className="disputeForm"
        >
          <DisputeForm
            milestone={milestone}
            setDisputeForm={setDisputeForm}
            onSuccess={(milestone) => {
              setMilestones((prev) =>
                prev.map((item) => {
                  if (item._id === milestone._id) {
                    return {
                      ...milestone,
                      client: item.client,
                      role: item.role,
                    };
                  } else {
                    return item;
                  }
                })
              );
              setDisputeForm(false);
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4>
                      {disputeFiledBy === "client"
                        ? "Case submit success. Dispute pending for verdict."
                        : "Dispute filed succefully."}
                    </h4>
                  </div>
                </>
              );
            }}
          />
        </Modal>
      </li>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
const BuyerMilestone = ({ milestone, setMilestones }) => {
  const [disputeForm, setDisputeForm] = useState(false);
  const [msg, setMsg] = useState(null);
  let myCase = null;
  let disputeFiledBy = null;
  if (milestone.dispute?.plaintiff._id === milestone.client._id) {
    myCase = milestone.dispute?.defendant?.case?.dscr;
    disputeFiledBy = "client";
  } else if (milestone.dispute?.defendant._id === milestone.client._id) {
    disputeFiledBy = "self";
  }
  const declineMilestone = () => {
    fetch("/api/declineMilestone", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: milestone._id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMilestones((prev) =>
            prev.map((item) => {
              if (item._id === data.milestone._id) {
                return {
                  ...data.milestone,
                  client: milestone.client,
                  role: milestone.role,
                };
              } else {
                return item;
              }
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Milestone succefully declined.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Milestone succefully declined.</h4>
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
              <h4>Could not decline milestone. Make sure you're online</h4>
            </div>
          </>
        );
      });
  };
  const cancelRequest = () => {
    fetch("/api/cancelMilestoneRequest", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: milestone._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMilestones((prev) =>
            prev.filter((item) => item._id !== milestone._id)
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Milestone request cancelled.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not cancel milestone request. Try again.</h4>
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
                Could not cancel milestone request. Make sure you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  const requestRelease = () => {
    fetch("/api/requestRelease", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: milestone._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMilestones((prev) =>
            prev.map((item) => {
              if (item._id === data.milestone._id) {
                return {
                  ...data.milestone,
                  client: milestone.client,
                  role: milestone.role,
                };
              } else {
                return item;
              }
            })
          );
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Succ_svg />
                <h4>Milestone request cancelled.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not request release. Try again.</h4>
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
              <h4>Could not request release. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <>
      <li className={`milestone buyer`} key={milestone._id}>
        <CommonMilestoneElement milestone={milestone} />
        <div className="clas">
          <h4>₹{milestone.amount}</h4>
          <div className="btns">
            {
              // milestone.status === "pending" ||
              // milestone.status === "inProgress"
              milestone.status === "pendingRelease" && (
                <>
                  <a className="released">Release requested</a>
                  <a className="dispute" onClick={() => setDisputeForm(true)}>
                    Raise Dispute
                  </a>
                </>
              )
            }
            {milestone.status === "pending" && (
              <a
                className="disputeRes"
                onClick={() =>
                  Confirm({
                    label: "Cancel Milestone request",
                    question: "You sure want to cancel this request?",
                    callback: cancelRequest,
                  })
                }
              >
                Cancel Request
              </a>
            )}
            {milestone.status === "released" && (
              <a className="released">Released</a>
            )}
            {((disputeFiledBy === "client" && myCase) ||
              disputeFiledBy === "self") && (
              <a className="disputed">Dispute {milestone.dispute?.status}</a>
            )}
            {disputeFiledBy === "client" && !myCase && (
              <a className="disputeRes" onClick={() => setDisputeForm(true)}>
                Approve Dispute
              </a>
            )}
            {milestone.status === "inProgress" && (
              <>
                <a
                  onClick={() =>
                    Confirm({
                      label: "Request Release",
                      question:
                        "You sure want to request release of this milestone?",
                      callback: requestRelease,
                    })
                  }
                >
                  Request Release
                </a>
                <a
                  className="disputeRes"
                  onClick={() =>
                    Confirm({
                      label: "Decline Milestone",
                      question: "You sure want to decline this milestone?",
                      callback: declineMilestone,
                    })
                  }
                >
                  Decline
                </a>
              </>
            )}
            {milestone.status === "declined" && (
              <a className="disputed">Declined</a>
            )}
          </div>
        </div>
        <Modal
          open={disputeForm}
          head={true}
          label="Raise Dispute"
          setOpen={setDisputeForm}
          className="disputeForm"
        >
          <DisputeForm
            milestone={milestone}
            setDisputeForm={setDisputeForm}
            onSuccess={(milestone) => {
              setMilestones((prev) =>
                prev.map((item) => {
                  if (item._id === milestone._id) {
                    return {
                      ...milestone,
                      client: item.client,
                      role: item.role,
                    };
                  } else {
                    return item;
                  }
                })
              );
              setDisputeForm(false);
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4>
                      {disputeFiledBy === "client"
                        ? "Case submit success. Dispute pending for verdict."
                        : "Dispute filed succefully."}
                    </h4>
                  </div>
                </>
              );
            }}
          />
        </Modal>
      </li>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};

export default Hold;
