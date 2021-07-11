import { Link } from "react-router-dom";

const Support = ({ history, location, match }) => {
  return (
    <div className="supportContainer">
      <div className="benner">
        <Link className="ticketLink" to="/support/ticket">
          My Tickets
        </Link>
        <h1>Support portal</h1>
        <p>Search for an answer or browse help topics to create a ticket</p>
        <form>
          <input
            type="text"
            required={true}
            placeholder="Eg: How does the Skropay Hold Works"
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
  );
};

export default Support;
