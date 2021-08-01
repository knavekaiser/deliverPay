import { useState } from "react";
import { Header, Footer } from "./Elements";
import { useHistory } from "react-router-dom";
import { Succ_svg, Err_svg } from "./Elements";
import { Modal } from "./Modal";
import TextareaAutosize from "react-textarea-autosize";
require("./styles/contactUs.scss");

const ContactUs = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
        setLoading(false);
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
        setLoading(false);
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
        <div className="head">
          <p>Let's Connect</p>
          <h1>Contact</h1>
          <p className="subtitle">
            We are always here to help. Our Customer care works 7 Days a week.
            <br />
            Even on holidays.
          </p>
        </div>
        <section className="cla">
          <div className="detail">
            <div className="address">
              <svg
                preserveAspectRatio="xMidYMid meet"
                data-bbox="53.5 36.5 93 127"
                viewBox="53.5 36.5 93 127"
                height="200"
                width="200"
                xmlns="http://www.w3.org/2000/svg"
                data-type="color"
                role="presentation"
                aria-hidden="true"
                aria-labelledby="svgcid-5zcduyjsq5qc"
              >
                <defs></defs>
                <title id="svgcid-5zcduyjsq5qc"></title>
                <g>
                  <path
                    d="M99.999 163.5l-3.25-3.895C94.986 157.487 53.5 107.468 53.5 82.916 53.5 57.323 74.359 36.5 99.999 36.5c25.644 0 46.501 20.823 46.501 46.416 0 24.551-41.483 74.571-43.252 76.688l-3.249 3.896zm0-118.56c-20.978 0-38.046 17.036-38.046 37.977 0 16.359 25.019 51.015 38.046 67.305 13.029-16.29 38.048-50.946 38.048-67.305 0-20.942-17.068-37.977-38.048-37.977z"
                    fill="#000000"
                    data-color="1"
                  ></path>
                  <path
                    d="M99.999 101.658c-10.351 0-18.775-8.407-18.775-18.741 0-10.335 8.424-18.743 18.775-18.743 10.353 0 18.777 8.408 18.777 18.743 0 10.333-8.424 18.741-18.777 18.741zm0-29.046c-5.69 0-10.32 4.621-10.32 10.304 0 5.68 4.63 10.303 10.32 10.303 5.692 0 10.324-4.622 10.324-10.303 0-5.682-4.632-10.304-10.324-10.304z"
                    fill="#000000"
                    data-color="1"
                  ></path>
                </g>
              </svg>
              <label>Address</label>
              <p>
                C2, Sector 1,
                <br /> Noida -201301 UP
              </p>
            </div>
            <div className="phone">
              <svg
                preserveAspectRatio="xMidYMid meet"
                data-bbox="38.999 39 122.001 122"
                viewBox="38.999 39 122.001 122"
                height="200"
                width="200"
                xmlns="http://www.w3.org/2000/svg"
                data-type="color"
                role="presentation"
                aria-hidden="true"
                aria-labelledby="svgcid-azkqa2rntmwv"
              >
                <defs></defs>
                <title id="svgcid-azkqa2rntmwv"></title>
                <g>
                  <path
                    d="M66.248 47.383c2.234 0 4.783.813 6.746 3.742 5.289 7.88 10.39 15.304 13.215 20.359.956 1.715 1.884 6.569-1.238 10.083-2.696 3.029-5.074 3.772-6.511 5.984-.985 1.524-2.11 4.931-.259 8.848 2.213 4.678 4.913 8.52 10.838 14.54 6.018 5.917 9.859 8.615 14.546 10.829 1.53.722 2.984.99 4.276.99 2.019 0 3.647-.651 4.573-1.249 2.213-1.434 2.958-3.812 5.989-6.507 1.827-1.621 4.014-2.15 5.935-2.15 1.779 0 3.33.454 4.152.916 5.057 2.82 12.484 7.919 20.372 13.203 5.532 3.707 3.515 9.499 2.736 11.32-.783 1.821-4.788 7.847-13.4 12.352-2.37 1.239-5.497 1.974-9.288 1.974-11.935 0-30.424-7.304-52.356-29.225-28.895-28.88-32.402-51.787-27.261-61.607 4.506-8.61 10.536-12.613 12.36-13.392.854-.368 2.589-1.01 4.575-1.01zm0-8.383c-3.278 0-6.106.923-7.9 1.699C54.8 42.211 47.294 47.555 41.88 57.9c-6.765 12.922-3.295 39.381 28.762 71.419C98.22 156.883 118.998 161 128.929 161c5.024 0 9.457-.987 13.175-2.93 10.331-5.404 15.687-12.899 17.222-16.475 3.579-8.37 1.312-16.839-5.772-21.589-1.216-.813-2.421-1.623-3.606-2.42-6.566-4.414-12.769-8.585-17.35-11.141-2.239-1.252-5.244-1.975-8.238-1.977-4.382 0-8.36 1.473-11.504 4.264-2.088 1.855-3.389 3.574-4.34 4.827-.196.259-.44.582-.628.813h-.027c-.197 0-.43-.062-.694-.187-3.482-1.644-6.597-3.675-12.199-9.178-5.508-5.6-7.54-8.714-9.185-12.193-.152-.321-.191-.558-.189-.718.231-.188.557-.433.817-.63 1.255-.95 2.973-2.249 4.826-4.33 5.306-5.974 5.143-14.623 2.3-19.731-2.579-4.614-6.782-10.857-11.234-17.465-.772-1.148-1.557-2.312-2.346-3.487C76.736 41.648 71.866 39 66.248 39z"
                    fill="#000000"
                    data-color="1"
                  ></path>
                </g>
              </svg>
              <label>Phone</label>
              <p>+91-9557059871</p>
            </div>
            <div className="email">
              <svg
                preserveAspectRatio="xMidYMid meet"
                data-bbox="35 56 130 88"
                viewBox="35 56 130 88"
                height="200"
                width="200"
                xmlns="http://www.w3.org/2000/svg"
                data-type="color"
                role="presentation"
                aria-hidden="true"
                aria-labelledby="svgcid-77p6ax-o92ara"
              >
                <defs></defs>
                <title id="svgcid-77p6ax-o92ara"></title>
                <g>
                  <path
                    d="M35 56v88h130V56H35zm64.879 58.87L49.15 64.499h101.455L99.879 114.87zM72.191 99.311l-28.755 30.025V70.757l28.755 28.554zm6.009 5.967l21.679 21.525 21.677-21.525 28.93 30.224H49.254L78.2 105.278zm49.364-5.967l29-28.796v59.092l-29-30.296z"
                    fill="#000000"
                    data-color="1"
                  ></path>
                </g>
              </svg>
              <label>Email</label>
              <p>care@deliverypay.in</p>
            </div>
            <div className="social">
              <svg
                preserveAspectRatio="xMidYMid meet"
                data-bbox="42 39.499 116 121"
                viewBox="42 39.499 116 121"
                height="200"
                width="200"
                xmlns="http://www.w3.org/2000/svg"
                data-type="color"
                role="presentation"
                aria-hidden="true"
              >
                <defs></defs>
                <g>
                  <path
                    d="M153.456 94.317c-3.926-5.122-9.922-7.943-16.878-7.943h-12.117c4.984-10.908 5.154-26.807 1.188-36.237-2.887-6.862-7.829-10.638-13.919-10.638-1.652 0-3.381.29-5.14.855-8.689 2.802-9.015 9.724-9.303 15.83-.42 8.874-1.056 21.923-23.628 38.773v-8.465H42v72.826h31.66v-9.008c5.418 4.908 13.13 10.189 21.245 10.189h36.611c7.637 0 15.169-5.777 17.152-13.15l8.222-30.59c2.272-8.452 1.021-16.634-3.434-22.442zm-88.219 56.579H50.423V94.92h14.814v55.976zm83.517-36.324l-8.222 30.592c-.989 3.685-5.201 6.911-9.015 6.911H94.905c-7.958 0-17.306-9.198-21.245-13.896v-32.876c30.727-20.874 31.546-38.253 32.042-48.721.304-6.46.663-7.302 3.472-8.211.922-.297 1.784-.447 2.557-.447 2.555 0 4.622 1.844 6.152 5.48 4.2 9.986 2.012 27.905-4.183 34.236l-7.003 7.157h29.88c4.339 0 7.865 1.605 10.192 4.644 2.849 3.716 3.572 9.227 1.985 15.131z"
                    fill="#000000"
                    data-color="1"
                  ></path>
                </g>
              </svg>
              <label>Social Media</label>
              <div className="socials">
                <a href="#">
                  <img src="/fb_icon.webp" />
                </a>
                <a href="#">
                  <img src="/in_icon.webp" />
                </a>
                <a href="#">
                  <img src="/insta_icon.webp" />
                </a>
              </div>
            </div>
          </div>
          <div className="contactForm">
            <form onSubmit={submit}>
              <section>
                <label>Full Name</label>
                <input
                  type="text"
                  required={true}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </section>
              <section>
                <label>Email or Phone</label>
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
          </div>
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
