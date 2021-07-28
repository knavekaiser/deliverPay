import { useState } from "react";
import { Header, Footer } from "./Elements";
import { useHistory } from "react-router-dom";
import { Succ_svg, Err_svg } from "./Elements";
import { Modal } from "./Modal";
import TextareaAutosize from "react-textarea-autosize";
require("./styles/generic.scss");

const ContactUs = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    let phone = null;
    let email = null;
    const emailReg = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const phoneReg = new RegExp(
      /((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/
    );
    if (emailReg.test(contact.toLowerCase())) {
      email = contact.toLowerCase();
    } else if (phoneReg.test(contact.toLowerCase())) {
      phone = "+91" + contact.replace(/^\+?9?1?/, "");
    } else {
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>Enter a valid email or phone number</h4>
          </div>
        </>
      );
      return;
    }
    fetch("/api/contactUsRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        message,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "ok") {
          setMsg(
            <>
              <button onClick={() => history.push("/")}>Go Home</button>
              <div>
                <Succ_svg />
                <h4>Contact Request submitted.</h4>
              </div>
            </>
          );
        } else {
          setMsg(
            <>
              <button onClick={() => setMsg(null)}>Okay</button>
              <div>
                <Err_svg />
                <h4>Contact Request could not be submitted.</h4>
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
                Contact Request could not be submitted. Make sure you're online.
              </h4>
            </div>
          </>
        );
      });
  };
  return (
    <div className="generic contactUs">
      <Header />
      <div className="content">
        <h1>Contact us</h1>
        <p>Drop us a message. We will get back to you.</p>
        <section className="contactForm">
          <form onSubmit={submit}>
            <section>
              <label>Name</label>
              <input
                type="text"
                required={true}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </section>
            <section>
              <label>Contact</label>
              <input
                type="text"
                required={true}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </section>
            <section>
              <label>Message</label>
              <TextareaAutosize
                type="text"
                required={true}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </section>
            <section className="btns">
              <button className="submit">Send</button>
            </section>
          </form>
        </section>
      </div>
      <Footer />
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </div>
  );
};

export default ContactUs;
