import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Modal } from "./Modal";
import { Err_svg } from "./Elements";
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
            <svg
              className="default"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#fff"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#336cf9"
              />
            </svg>
            <svg
              className="blank"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_229"
                data-name="Ellipse 229"
                fill="#fff"
                stroke="#707070"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
            </svg>
            <svg
              className="filled"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#336cf9"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#fff"
              />
            </svg>
          </div>
          <p>Deposite recieved</p>
        </li>
        <li className="progress pending">
          <svg
            className="done"
            xmlns="http://www.w3.org/2000/svg"
            width="214.5"
            height="2"
            viewBox="0 0 214.5 2"
          >
            <line
              id="Line_22"
              data-name="Line 22"
              x2="214.5"
              transform="translate(0 1)"
              fill="none"
              stroke="#1be6d6"
              strokeWidth="2"
            />
          </svg>
          <svg
            className="running"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="16.55"
            viewBox="0 0 200 16.55"
          >
            <g
              id="Group_203"
              data-name="Group 203"
              transform="translate(-5063.943 -1197)"
            >
              <path
                id="Path_301"
                data-name="Path 301"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5063.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_302"
                data-name="Path 302"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5073.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_303"
                data-name="Path 303"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5083.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_304"
                data-name="Path 304"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5093.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_305"
                data-name="Path 305"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5103.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_306"
                data-name="Path 306"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5113.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_307"
                data-name="Path 307"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5123.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_308"
                data-name="Path 308"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5133.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_309"
                data-name="Path 309"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5143.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_310"
                data-name="Path 310"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5153.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_311"
                data-name="Path 311"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5163.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_312"
                data-name="Path 312"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5173.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_313"
                data-name="Path 313"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5183.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_314"
                data-name="Path 314"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5193.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_315"
                data-name="Path 315"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5203.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_316"
                data-name="Path 316"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5213.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_317"
                data-name="Path 317"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5223.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_318"
                data-name="Path 318"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5233.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_319"
                data-name="Path 319"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5243.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_320"
                data-name="Path 320"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5253.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
            </g>
          </svg>
          <svg
            className="runningBack"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="16.55"
            viewBox="0 0 200 16.55"
          >
            <g
              id="Group_226"
              data-name="Group 226"
              transform="translate(5263.943 1213.55) rotate(-180)"
            >
              <path
                id="Path_301"
                data-name="Path 301"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5063.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_302"
                data-name="Path 302"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5073.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_303"
                data-name="Path 303"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5083.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_304"
                data-name="Path 304"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5093.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_305"
                data-name="Path 305"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5103.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_306"
                data-name="Path 306"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5113.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_307"
                data-name="Path 307"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5123.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_308"
                data-name="Path 308"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5133.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_309"
                data-name="Path 309"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5143.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_310"
                data-name="Path 310"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5153.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_311"
                data-name="Path 311"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5163.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_312"
                data-name="Path 312"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5173.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_313"
                data-name="Path 313"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5183.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_314"
                data-name="Path 314"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5193.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_315"
                data-name="Path 315"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5203.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_316"
                data-name="Path 316"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5213.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_317"
                data-name="Path 317"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5223.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_318"
                data-name="Path 318"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5233.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_319"
                data-name="Path 319"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5243.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_320"
                data-name="Path 320"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5253.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
            </g>
          </svg>
        </li>
        <li className="step onhold">
          <div className="icons">
            <svg
              className="default"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#fff"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#336cf9"
              />
            </svg>
            <svg
              className="blank"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_229"
                data-name="Ellipse 229"
                fill="#fff"
                stroke="#707070"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
            </svg>
            <svg
              className="filled"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#336cf9"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#fff"
              />
            </svg>
          </div>
          <p>Funds on Hold</p>
        </li>
        <li className="progress onhold">
          <svg
            className="done"
            xmlns="http://www.w3.org/2000/svg"
            width="214.5"
            height="2"
            viewBox="0 0 214.5 2"
          >
            <line
              id="Line_22"
              data-name="Line 22"
              x2="214.5"
              transform="translate(0 1)"
              fill="none"
              stroke="#1be6d6"
              strokeWidth="2"
            />
          </svg>
          <svg
            className="running"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="16.55"
            viewBox="0 0 200 16.55"
          >
            <g
              id="Group_203"
              data-name="Group 203"
              transform="translate(-5063.943 -1197)"
            >
              <path
                id="Path_301"
                data-name="Path 301"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5063.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_302"
                data-name="Path 302"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5073.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_303"
                data-name="Path 303"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5083.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_304"
                data-name="Path 304"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5093.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_305"
                data-name="Path 305"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5103.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_306"
                data-name="Path 306"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5113.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_307"
                data-name="Path 307"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5123.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_308"
                data-name="Path 308"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5133.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_309"
                data-name="Path 309"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5143.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_310"
                data-name="Path 310"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5153.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_311"
                data-name="Path 311"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5163.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_312"
                data-name="Path 312"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5173.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_313"
                data-name="Path 313"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5183.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_314"
                data-name="Path 314"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5193.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_315"
                data-name="Path 315"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5203.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_316"
                data-name="Path 316"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5213.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_317"
                data-name="Path 317"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5223.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_318"
                data-name="Path 318"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5233.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_319"
                data-name="Path 319"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5243.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
              <path
                id="Path_320"
                data-name="Path 320"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5253.943 1213.55) rotate(-90)"
                fill="#1be6d6"
              />
            </g>
          </svg>
          <svg
            className="runningBack"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="16.55"
            viewBox="0 0 200 16.55"
          >
            <g
              id="Group_226"
              data-name="Group 226"
              transform="translate(5263.943 1213.55) rotate(-180)"
            >
              <path
                id="Path_301"
                data-name="Path 301"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5063.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_302"
                data-name="Path 302"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5073.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_303"
                data-name="Path 303"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5083.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_304"
                data-name="Path 304"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5093.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_305"
                data-name="Path 305"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5103.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_306"
                data-name="Path 306"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5113.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_307"
                data-name="Path 307"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5123.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_308"
                data-name="Path 308"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5133.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_309"
                data-name="Path 309"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5143.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_310"
                data-name="Path 310"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5153.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_311"
                data-name="Path 311"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5163.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_312"
                data-name="Path 312"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5173.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_313"
                data-name="Path 313"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5183.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_314"
                data-name="Path 314"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5193.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_315"
                data-name="Path 315"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5203.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_316"
                data-name="Path 316"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5213.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_317"
                data-name="Path 317"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5223.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_318"
                data-name="Path 318"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5233.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_319"
                data-name="Path 319"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5243.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
              <path
                id="Path_320"
                data-name="Path 320"
                d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
                transform="translate(5253.943 1213.55) rotate(-90)"
                fill="#f6577c"
              />
            </g>
          </svg>
        </li>
        <li className="step released">
          <div className="icons">
            <svg
              className="default"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#fff"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#336cf9"
              />
            </svg>
            <svg
              className="blank"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_229"
                data-name="Ellipse 229"
                fill="#fff"
                stroke="#707070"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
            </svg>
            <svg
              className="filled"
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 65 65"
            >
              <g
                id="Ellipse_110"
                data-name="Ellipse 110"
                fill="#336cf9"
                stroke="#336cf9"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
                <circle cx="32.5" cy="32.5" r="32" fill="none" />
              </g>
              <path
                id="Checkbox"
                d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
                transform="translate(17.034 20.967)"
                fill="#fff"
              />
            </svg>
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
