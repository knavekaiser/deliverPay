import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { Route, Switch, useHistory, Link } from "react-router-dom";
import { Checkbox, Succ_svg, Err_svg, Header, Footer } from "./Elements";
import { GoogleLogin } from "react-google-login";
import { Modal } from "./Modal";
require("./styles/apply.scss");

const WorkRequestForm = () => {
  const { user } = useContext(SiteContext);
  const history = useHistory();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [resume, setResume] = useState("");
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
        resume,
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
      <p className="title">Apply Now</p>
      <ul className="contactDetail">
        <li>
          <p>WhatsApp</p>
          <p>+91 9557059871</p>
        </li>
        <li>
          <p>Email</p>
          <p>support@deliverypay.in</p>
        </li>
      </ul>
      <form onSubmit={submit}>
        <section>
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            required={true}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </section>
        <section>
          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            required={true}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </section>
        <section>
          <label>Email</label>
          <input
            type="email"
            name="email"
            required={true}
            value={email}
            onChange={(e) => {
              setErrMsg(null);
              setEmail(e.target.value);
            }}
          />
        </section>
        <section>
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            required={true}
            value={phone}
            pattern="((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}"
            onChange={(e) => {
              setErrMsg(null);
              if (e.target.value.match(/^\+91\d{0,10}$/)) {
                setPhone(e.target.value);
              }
            }}
          />
        </section>
        <section className="resume">
          <label>Resume</label>
          <input
            name="resume"
            required={true}
            placeholder="Paste the URL to your Resume on Google Drive or DropBox"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </section>
        <button disabled={errMsg} type="submit">
          Send
        </button>
      </form>
      {errMsg && <p className="errMsg">{errMsg}</p>}
      <Modal className="msg" open={modal}>
        {modal}
      </Modal>
    </div>
  );
};

function Apply() {
  const { setUser, user } = useContext(SiteContext);
  const history = useHistory();
  return (
    <div className="generic apply">
      <Header />
      <main>
        <div className="banner">
          <div className="header">
            <h1>Delivery Pay</h1>
            <p className="subtitle">Never Pay Without Using Delivery pay</p>
          </div>
        </div>
        <div className="form">
          <WorkRequestForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Apply;
