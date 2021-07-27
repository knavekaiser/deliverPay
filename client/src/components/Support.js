import { useState, useEffect } from "react";
import { Link, Route, Switch } from "react-router-dom";
import { Arrow_left_svg, Combobox } from "./Elements";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    fetch(`/api/getTickets?${status ? `status=${status}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, [status]);
  return (
    <div className="ticketContainer">
      <Link to="/account/support">
        <Arrow_left_svg />
        Back
      </Link>
      <p className="benner">Tickets</p>
      <div className="content">
        <div className="head">
          <section>
            <label>Show</label>
            <Combobox
              defaultValue={0}
              options={[
                { label: "Open", value: "open" },
                { label: "Closed", value: "closed" },
                { label: "All", value: "" },
              ]}
              onChange={(e) => setStatus(e.value)}
            />
          </section>
        </div>
        <table className="tickets">
          <thead>
            <tr>
              <th>Department</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="ticket">
                <td>{ticket.department}</td>
                <td>{ticket.issue}</td>
                <td>{ticket.status}</td>
                <td>{ticket.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const SingleTicket = ({ ticket, setTickets }) => {
  return (
    <div className="ticket">
      <ul>
        {ticket.messages.map((message) => (
          <li key={message._id}>{}</li>
        ))}
      </ul>
    </div>
  );
};

const Support = ({ history, location, match }) => {
  return (
    <>
      <Switch>
        <Route path="/account/support/ticket" component={Tickets} />
        <Route path="/">
          <div className="supportContainer">
            <div className="benner">
              <Link className="ticketLink" to="/account/support/ticket">
                My Tickets
              </Link>
              <h1>Support portal</h1>
              <p>
                Search for an answer or browse help topics to create a ticket
              </p>
              <form>
                <input
                  type="text"
                  required={true}
                  placeholder="Eg: How does the Delivery pay Hold Works"
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
        </Route>
      </Switch>
    </>
  );
};

export default Support;
