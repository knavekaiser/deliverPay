import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  lazy,
  useContext,
} from "react";
import { SiteContext } from "../SiteContext";
import { Link, Route, Switch } from "react-router-dom";
import { Modal, Confirm } from "./Modal";
import {
  Arrow_left_svg,
  Combobox,
  X_svg,
  Err_svg,
  Succ_svg,
  Pagination,
  Chev_down_svg,
  Media,
  Moment,
  moment,
} from "./Elements";
import { DateRange } from "react-date-range";
import { TicketForm, TicketReplyForm } from "./Forms";
import TextareaAutosize from "react-textarea-autosize";

require("./styles/singleTicket.scss");
require("./styles/table.scss");

const BugReportForm = ({ onSuccess }) => {
  const { user } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(
    user ? user.firstName + " " + user.lastName : ""
  );
  const [phone, setPhone] = useState(user ? user.phone : "");
  const [issue, setIssue] = useState("");
  const [dscr, setDscr] = useState("");
  const [msg, setMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("/api/bugReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        issue,
        dscr,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.code === "ok") {
          onSuccess?.();
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Report could not be submitted.</h4>
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
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </section>
        <section>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </section>
        <section>
          <label>Issue</label>
          <input value={issue} onChange={(e) => setIssue(e.target.value)} />
        </section>
        <section>
          <label>Description</label>
          <TextareaAutosize
            value={dscr}
            onChange={(e) => setDscr(e.target.value)}
          />
        </section>
        <section className="btns">
          <button className="submit">Submit</button>
        </section>
      </form>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
      {loading && (
        <div className="spinnerContainer">
          <div className="spinner" />
        </div>
      )}
    </>
  );
};

export const Tickets = ({ history, location, pathname }) => {
  const dateFilterRef = useRef();
  const [ticketForm, setTicketForm] = useState(false);
  const [msg, setMsg] = useState(null);
  const [total, setTotal] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [sort, setSort] = useState({ column: "createdAt", order: "dsc" });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [dateOpen, setDateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [datePickerStyle, setDatePickerStyle] = useState({});
  const [dateFilter, setDateFilter] = useState(false);
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
  useEffect(() => {
    const startDate = moment({
      time: dateRange?.startDate,
      format: "YYYY-MM-DD",
    });
    const endDate = moment({
      time: dateRange?.endDate.setHours(24, 0, 0, 0),
      format: "YYYY-MM-DD",
    });
    fetch(
      `/api/getTickets?${new URLSearchParams({
        page,
        perPage,
        sort: sort.column,
        sort: sort.order,
        ...(search && { q: search }),
        ...(dateFilter && {
          dateFrom: startDate,
          dateTo: endDate,
        }),
      }).toString()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setTickets(data.tickets.tickets);
          setTotal(data.tickets.pageInfo[0]?.count || 0);
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not get tickets.</h4>
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
              <h4>Could not get tickets. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  }, [page, perPage, sort.column, sort.order, search, dateFilter]);
  return (
    <div className="table ticketContainer">
      <div style={{ display: "none" }}>
        <X_svg />
      </div>
      <div className="head">
        <h3>Tickets</h3>
        <button onClick={() => setTicketForm(true)}>Open Ticket</button>
      </div>
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
            placeholder="Search issue"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X_svg />
            </button>
          )}
        </section>
        <section
          className={`date ${dateFilter ? "open" : ""}`}
          ref={dateFilterRef}
        >
          <svg
            onClick={() => setDateOpen(true)}
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
                  To: <Moment format="DD MMM, YYYY">{dateRange.endDate}</Moment>
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
      <table cellSpacing={0} cellPadding={0}>
        <thead>
          <tr>
            <th
              className={
                sort.column === "createdAt" ? "sort" + " " + sort.order : ""
              }
              onClick={() => {
                setSort((prev) => ({
                  column: "createdAt",
                  order: prev.order === "dsc" ? "asc" : "dsc",
                }));
              }}
            >
              Date <Chev_down_svg />
            </th>
            <th
              className={
                sort.column === "issue" ? "sort" + " " + sort.order : ""
              }
              onClick={() => {
                setSort((prev) => ({
                  column: "issue",
                  order: prev.order === "dsc" ? "asc" : "dsc",
                }));
              }}
            >
              Issue <Chev_down_svg />
            </th>
            <th
              className={
                sort.column === "status" ? "sort" + " " + sort.order : ""
              }
              onClick={() => {
                setSort((prev) => ({
                  column: "status",
                  order: prev.order === "dsc" ? "asc" : "dsc",
                }));
              }}
            >
              Status <Chev_down_svg />
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((item) => (
            <tr
              key={item._id}
              onClick={() =>
                history.push(`/account/support/ticket/${item._id}`)
              }
            >
              <td>
                <Moment format="hh:mm a, DD MMM, YYYY">{item.createdAt}</Moment>
              </td>
              <td>{item.issue}</td>
              <td>{item.status}</td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr className="placeholder">
              <td>Nothing yet.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <Pagination
              total={total}
              perPage={perPage}
              currentPage={page}
              btns={5}
              setPage={setPage}
            />
          </tr>
        </tfoot>
      </table>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
      <Modal
        open={dateOpen}
        onBackdropClick={() => setDateOpen(false)}
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
      <Modal
        open={ticketForm}
        head={true}
        label="Open Ticket"
        setOpen={setTicketForm}
        className="formModal ticketFormModal"
      >
        <TicketForm
          onSuccess={(newTicket) => {
            setTicketForm(false);
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4>Ticket successfully submitted.</h4>
                </div>
              </>
            );
            setTickets((prev) => [newTicket, ...prev]);
          }}
        />
      </Modal>
    </div>
  );
};
export const SingleTicket = ({ history, match }) => {
  const [ticket, setTicket] = useState(null);
  const [msg, setMsg] = useState(null);
  const [replyForm, setReplyForm] = useState(false);
  useEffect(() => {
    fetch(`/api/singleTicket?_id=${match.params._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setTicket(data.ticket);
        } else {
          setMsg(
            <>
              <button onClick={() => history.push("/account/support/ticket")}>
                Go Back
              </button>
              <div>
                <Err_svg />
                <h4>Ticket could not be found.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setMsg(
          <>
            <button onClick={() => history.push("/account/support/ticket")}>
              Go Back
            </button>
            <div>
              <Err_svg />
              <h4>Ticket could not be found.</h4>
            </div>
          </>
        );
      });
  }, []);
  if (ticket) {
    return (
      <div className="ticket">
        <div className="detail">
          <Link to="/account/support/ticket" className="back">
            <Arrow_left_svg />
            Go Back
          </Link>
          <ul className="summery">
            <li className="head">Ticket Summery</li>
            <li>
              <label>Issue:</label>
              <p>{ticket.issue}</p>
            </li>
            <li>
              <label>Status:</label>
              <p>{ticket.status}</p>
            </li>
            <li>
              <label>Created at:</label>
              <p>
                <Moment format="hh:mm a, DD MMM, YYYY">
                  {ticket.createdAt}
                </Moment>
              </p>
            </li>
            <li>
              <label>Last Activity:</label>
              <p>
                <Moment format="hh:mm a, DD MMM, YYYY">
                  {ticket.updatedAt}
                </Moment>
              </p>
            </li>
          </ul>
          <ul className="milestoneDetail">
            <li className="head">Milestone Detail</li>
            {ticket.milestone ? (
              <>
                <li>
                  <label>Amount:</label>
                  <p>{ticket.milestone.amount}</p>
                </li>
                <li>
                  <label>Status:</label>
                  <p>{ticket.milestone.status}</p>
                </li>
                <li>
                  <label>Created at:</label>
                  <p>
                    <Moment format="hh:mm a, DD MMM, YYYY">
                      {ticket.milestone.createdAt}
                    </Moment>
                  </p>
                </li>
                <li>
                  <label>Verification Method:</label>
                  <p>{ticket.milestone.verification}</p>
                </li>
                <li>
                  <label>Seller:</label>
                  <p>
                    {ticket.milestone.seller.firstName +
                      " " +
                      ticket.milestone.seller.lastName}
                  </p>
                </li>
                <li>
                  <label>Buyer:</label>
                  <p>
                    {ticket.milestone.buyer.firstName +
                      " " +
                      ticket.milestone.buyer.lastName}
                  </p>
                </li>
                <li>
                  <label>Description:</label>
                  <p>{ticket.milestone.dscr}</p>
                </li>
              </>
            ) : (
              <li className="placeholder">No Detail provided</li>
            )}
          </ul>
          <ul className="transactionDetail">
            <li className="head">Transaction Detail</li>
            {ticket.transaction ? (
              <>
                <li>
                  <label>Type:</label>
                  <p>{ticket.transaction.__t}</p>
                </li>
                <li>
                  <label>Amount:</label>
                  <p>{ticket.transaction.amount}</p>
                </li>
                <li>
                  <label>Note:</label>
                  <p>{ticket.transaction.note}</p>
                </li>
                <li>
                  <label>Created at:</label>
                  <p>
                    <Moment format="hh:mm a, DD MMM, YYYY">
                      {ticket.transaction.createdAt}
                    </Moment>
                  </p>
                </li>
              </>
            ) : (
              <li className="placeholder">No Detail provided</li>
            )}
          </ul>
          <div className="pBtm" />
        </div>
        <div className="messages">
          <div className="head">
            Messages <button onClick={() => setReplyForm(true)}>Reply</button>
          </div>
          <ul>
            {[...ticket.messages].reverse().map((item, i) => (
              <li key={i}>
                <div className="user">
                  <p className="name">
                    {item.user.name}
                    <span>•</span>
                    <span className="role">{item.user.role}</span>
                    <span className="date">
                      <Moment format="hh:mm a, DD MMM, YYYY">
                        {item.createdAt}
                      </Moment>
                    </span>
                  </p>
                </div>
                <p className="message">{item.message.body}</p>
                {item.message.files.length > 0 && (
                  <div className="thumbs">
                    <Media links={item.message.files} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <Modal
          open={replyForm}
          head={true}
          label="Add reply to Ticket"
          setOpen={setReplyForm}
          className="ticketReplyFormModal"
        >
          <TicketReplyForm
            _id={ticket._id}
            onSuccess={(newTicket) => {
              setReplyForm(false);
              setTicket((prev) => ({ ...prev, messages: newTicket.messages }));
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <Succ_svg />
                    <h4>Reply has been submitted.</h4>
                  </div>
                </>
              );
            }}
          />
        </Modal>
        <Modal open={msg} className="msg">
          {msg}
        </Modal>
      </div>
    );
  }
  return (
    <div className="ticket loading">
      <div className="detail">
        <Link to="/account/support/ticket" className="back">
          <Arrow_left_svg />
          Go Back
        </Link>
        <ul className="summery">
          <li className="head">Ticket Summery</li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
        </ul>
        <ul className="milestoneDetail">
          <li className="head">Milestone Detail</li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
        </ul>
        <ul className="transactionDetail">
          <li className="head">Transaction Detail</li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
          <li>
            <label></label>
            <p></p>
          </li>
        </ul>
      </div>
      <div className="messages">
        <div className="head">Messages</div>
        <ul>
          <li>
            <div className="user">
              <div className="img" />
              <p className="name" />
            </div>
            <p className="message">
              <span />
            </p>
            <div className="thumbs">
              <div className="img" />
              <div className="img" />
            </div>
          </li>
          <li>
            <div className="user">
              <div className="img" />
              <p className="name" />
            </div>
            <p className="message">
              <span />
            </p>
            <div className="thumbs">
              <div className="img" />
              <div className="img" />
              <div className="img" />
            </div>
          </li>
        </ul>
      </div>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </div>
  );
};
const Support = ({ history, location, match }) => {
  const [msg, setMsg] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [bugReport, setBugReport] = useState(false);
  useEffect(() => {
    fetch(`/api/faq`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setFaqs(data.faqs);
        }
      });
  }, []);
  return (
    <>
      <Switch>
        <Route path="/account/support/ticket" component={Tickets} />
        <Route path="/">
          <div className="supportContainer">
            <div className="benner">
              <div className="clas">
                <Link className="ticketLink" to="/account/support/ticket">
                  My Tickets
                </Link>
                <button
                  className="ticketLink"
                  onClick={() => setBugReport(true)}
                >
                  Report Bug
                </button>
              </div>
              <h1>Support portal</h1>
              <p>
                Search for an answer or browse help topics to create a ticket
              </p>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  required={true}
                  placeholder="Eg: How does the Delivery pay Hold Works"
                  onChange={(e) => {
                    fetch(`/api/faq?q=${e.target.value}`)
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.code === "ok") {
                          setFaqs(data.faqs);
                        }
                      });
                  }}
                />
                <button type="submit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="31.336"
                    height="31.336"
                    viewBox="0 0 31.336 31.336"
                  >
                    <path
                      id="Path_1935"
                      data-name="Path 1935"
                      d="M25.4,22.708H23.98l-.5-.484a11.663,11.663,0,1,0-1.254,1.254l.484.5V25.4l8.958,8.94,2.67-2.67Zm-10.75,0a8.062,8.062,0,1,1,8.063-8.063A8.052,8.052,0,0,1,14.646,22.708Z"
                      transform="translate(-3 -3)"
                      fill="#707070"
                    />
                  </svg>
                </button>
              </form>
            </div>
            <div className="content">
              <div className="faq">
                <p className="label">FAQs</p>
                <ul>
                  {faqs.map((item) => (
                    <li key={item._id}>
                      <h4>{item.ques}</h4>
                      <p className="ans">{item.ans}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="feedback">
                <form>
                  <textarea required={true} />
                  <button>Submit</button>
                </form>
                <Link className="feedbackLink" to="/support/myFeedbacks">
                  Submitted Feedbacks
                </Link>
              </div>
            </div>
          </div>
        </Route>
      </Switch>
      <Modal
        open={bugReport}
        setOpen={setBugReport}
        className="bugReport"
        label="Report Bug"
        head={true}
      >
        <BugReportForm
          onSuccess={() => {
            setBugReport(false);
            setMsg(
              <>
                <button onClick={() => setMsg(null)}>Okay</button>
                <div>
                  <Succ_svg />
                  <h4>Report has been submitted.</h4>
                </div>
              </>
            );
          }}
        />
      </Modal>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </>
  );
};

export default Support;
