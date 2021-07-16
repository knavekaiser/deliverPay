import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { Route, Switch, useHistory, useLocation, Link } from "react-router-dom";
import { Checkbox, Succ_svg, Err_svg } from "./Elements";
import { GoogleLogin } from "react-google-login";
import { Modal } from "./Modal";
require("../components/styles/userStart.scss");

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const WorkRequestForm = () => {
  const { user } = useContext(SiteContext);
  const history = useHistory();
  const query = useQuery();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [dscr, setDscr] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const [modal, setModal] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (!phone.match(/^\+91\d{10}$/)) {
      setErrMsg("Enter valid phone number");
      return;
    }
    if (errMsg) return;
    fetch("/api/workRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email,
        dscr,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setModal(
            <>
              <div>
                <Succ_svg />
                <h4>Request submitted</h4>
              </div>
              <Link to="/" onClick={() => setModal(null)}>
                Go home
              </Link>
            </>
          );
        } else {
          setModal(
            <>
              <button onClick={() => setModal(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Could not submit request. Please try again.</h4>
              </div>
            </>
          );
        }
      })
      .catch((err) => {
        console.log(err);
        setModal(
          <>
            <button onClick={() => setModal(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>Could not submit request. Make sure you're online.</h4>
            </div>
          </>
        );
      });
  };
  return (
    <div className="formWrapper">
      <img
        className="logo"
        onClick={() => history.push("")}
        src="/logo_land.jpg"
        alt="Delivery pay logo"
      />
      <p className="title">Introduce yourself</p>
      <form onSubmit={submit}>
        <input
          type="text"
          name="firstName"
          required={true}
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          name="lastName"
          required={true}
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          name="email"
          required={true}
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setErrMsg(null);
            setEmail(e.target.value);
          }}
        />
        <input
          type="tel"
          name="phone"
          required={true}
          placeholder="Phone number"
          value={phone}
          onChange={(e) => {
            setErrMsg(null);
            if (e.target.value.match(/^\+91\d{0,10}$/)) {
              setPhone(e.target.value);
            }
          }}
        />
        <textarea
          className="dscr"
          name="dscr"
          required={true}
          placeholder="Why join Delivery Pay team?"
          value={dscr}
          onChange={(e) => {
            setDscr(e.target.value);
          }}
        />
        <section className="checkbox">
          <Checkbox required={true} />
          <label>I accept to the Terms and Conditions and Privacy Policy</label>
        </section>
        <button disabled={errMsg} type="submit">
          Submit
        </button>
      </form>
      {errMsg && <p className="errMsg">{errMsg}</p>}
      <Modal className="msg" open={modal}>
        {modal}
      </Modal>
    </div>
  );
};

function JobApplication() {
  const { setUser, user } = useContext(SiteContext);
  const history = useHistory();
  return (
    <div className="userStart">
      <div className="banner">
        <header>
          <h3>Help us make Delivery Pay better.</h3>
          <p>Join our team of hard working people.</p>
        </header>
        <img
          className="illustration"
          src="/landingPage_illustration.svg"
          alt="illustration"
        />
      </div>
      <div className="forms">
        <WorkRequestForm />
      </div>
    </div>
  );
}

export default JobApplication;
