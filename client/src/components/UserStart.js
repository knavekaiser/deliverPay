import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "../SiteContext";
import { Header, Footer } from "./Elements";
import { Route, Switch, useHistory, useLocation, Link } from "react-router-dom";
import { Checkbox } from "./Elements";
import { GoogleLogin } from "react-google-login";
require("../components/styles/userStart.scss");

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const RegisterForm = () => {
  const { user, setUser } = useContext(SiteContext);
  const history = useHistory();
  const query = useQuery();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [pass, setPass] = useState("");
  const [confirm_pass, setConfirm_pass] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    if (pass !== confirm_pass) {
      setErrMsg("Password did not match.");
      return;
    }
    if (!phone.match(/^\+91\d{10}$/)) {
      setErrMsg("Enter valid phone number");
      return;
    }
    if (errMsg) return;
    fetch("/api/registerUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        email: email.toLowerCase(),
        password: pass,
        ...(query.get("referer") && { referer: query.get("referer") }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(user);
          history.push("/account/home");
        } else if (data.code === 11000) {
          setErrMsg("Email/Phone already exists.");
        }
      });
  };
  useEffect(() => {
    setErrMsg(null);
  }, [confirm_pass]);
  return (
    <div className="formWrapper register">
      <img
        className="logo"
        onClick={() => history.push("")}
        src="/logo_benner.jpg"
        alt="Delivery pay logo"
      />
      <p className="title">Create your Delivery pay account</p>
      {
        //   <p className="links">
        //   Already have an account? <Link to="/u/login">Login</Link>
        // </p>
      }
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
        {
          //   <input
          //   type="email"
          //   name="email"
          //   required={true}
          //   placeholder="Email"
          //   value={email}
          //   onChange={(e) => {
          //     setErrMsg(null);
          //     setEmail(e.target.value);
          //   }}
          // />
        }
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
        <section className="pass">
          <input
            type="password"
            name="password"
            required={true}
            placeholder="Password"
            aria-autocomplete="list"
            autoComplete="new-password"
            onChange={(e) => setPass(e.target.value)}
          />
        </section>
        <section className="repeatPass">
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            required={true}
            placeholder="Confirm Password"
            aria-autocomplete="list"
            autoComplete="new-password"
            onChange={(e) => setConfirm_pass(e.target.value)}
          />
        </section>
        <section className="checkbox">
          <Checkbox required={true} />
          <label>
            I Accept{" "}
            <Link to="/terms" target="_blank">
              Terms & Conditions
            </Link>
            , User Agreement,{" "}
            <Link to="/codeOfConduct" target="_blank">
              Code of Conduct
            </Link>
            ,{" "}
            <Link to="/fees&Charges" target="_blank">
              Charges & Fee
            </Link>{" "}
            & Consent to receiving Communications via Text, Email or Phone.
          </label>
        </section>
        <button disabled={errMsg} type="submit">
          Register
        </button>
      </form>
      {errMsg && <p className="errMsg">{errMsg}</p>}
    </div>
  );
};
const LoginForm = () => {
  const { user, setUser } = useContext(SiteContext);
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [errMsg, setErrMsg] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (errMsg) return;
    e.preventDefault();
    const emailReg = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const phoneReg = new RegExp(
      /((\+*)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/
    );
    let user;
    if (phoneReg.test(username.toLowerCase())) {
      user = "+91" + username.replace(/^\+?9?1?/, "");
    } else if (emailReg.test(username.toLowerCase())) {
      user = username.toLowerCase();
    } else {
      setErrMsg("Enter valid Phone number or Email");
      return;
    }
    fetch("/api/userLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        password: pass,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          history.push("/account/home");
        } else if (data.code === 401) {
          setErrMsg("Invalid credential!");
        }
      });
  };
  const responseGoogle = (e) => {
    if (e.tokenId) {
      fetch("/api/userLoginUsingSocial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleToken: e.tokenId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(user);
            history.push("/account/home");
          } else if (data.code === 401) {
            setErrMsg("No account is associated with this Google account.");
            setTimeout(() => setErrMsg(null), 2000);
          }
        });
    }
  };
  return (
    <div className="formWrapper login">
      <img
        className="logo"
        onClick={() => history.push("")}
        src="/logo_benner.jpg"
        alt="Delivery pay logo"
      />
      {
        //   <p className="links">
        //   Don't have an account? <Link to="/u/join">Register</Link>
        // </p>
      }
      <p className="title">Login to your Delivery pay account</p>
      <form onSubmit={submit}>
        <input
          type="text"
          name="username"
          required={true}
          placeholder="Email  or Phone Number"
          value={username}
          onChange={(e) => {
            setErrMsg(false);
            setUsername(e.target.value);
          }}
        />
        <section className="pass">
          <input
            type="password"
            name="password"
            required={true}
            placeholder="Password"
            value={pass}
            onChange={(e) => {
              setErrMsg(false);
              setPass(e.target.value);
            }}
          />
          <Link className="passReset" to="/u/resetPassword">
            Forgot password?
          </Link>
        </section>
        <button disabled={errMsg} type="submit">
          Login
        </button>
      </form>
      <section className="socials">
        <GoogleLogin
          className="google"
          clientId="978249749020-kjq65au1n373ur5oap7n4ebo2fq1jdhq.apps.googleusercontent.com"
          buttonText="Continue with Google"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          cookiePolicy={"single_host_origin"}
        />
      </section>
      {errMsg && <p className="errMsg">{errMsg}</p>}
    </div>
  );
};
const PasswordReset = () => {
  const { user, setUser } = useContext(SiteContext);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [step, setStep] = useState(1);
  const [id, setId] = useState("");
  const [invalidCred, setInvadilCred] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [pass, setPass] = useState("");
  const [confirm_pass, setConfirm_pass] = useState("");
  const [errMsg, setErrMsg] = useState(false);
  const code1 = useRef(null);
  const code2 = useRef(null);
  const code3 = useRef(null);
  const code4 = useRef(null);
  const code5 = useRef(null);
  const code6 = useRef(null);
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
    if (emailReg.test(id.toLowerCase())) {
      email = id.toLowerCase();
    } else if (phoneReg.test(id.toLowerCase())) {
      phone = "+91" + id.replace(/^\+?9?1?/, "");
    }
    if (step === 1) {
      if (errMsg) return;
      if (phone || email) {
        setLoading(true);
        fetch("/api/sendUserForgotPassOTP", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, email }),
        }).then((res) => {
          setLoading(false);
          if (res.status === 200) {
            setStep(2);
          } else {
            setErrMsg("User does does not exists.");
          }
        });
      } else {
        setErrMsg("Enter a valid phone number or email.");
      }
    } else if (step === 2) {
      setLoading(true);
      fetch("/api/submitUserForgotPassOTP", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: code.join("") }),
      }).then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setStep(3);
        } else if (res.status === 400) {
          setCode(["", "", "", "", "", ""]);
          setErrMsg("Wrong code!");
        } else if (res.status === 429) {
          setStep(1);
          setId("");
          setCode(["", "", "", "", "", ""]);
          setErrMsg("Too many attempts. Start again.");
        } else if (res.status === 404) {
          setStep(1);
          setId("");
          setCode(["", "", "", "", "", ""]);
          setErrMsg("Timeout. Start again");
        }
      });
    } else if (step === 3) {
      if (pass !== confirm_pass) {
        setErrMsg("Password did not match");
        return;
      }
      setLoading(true);
      fetch("/api/userResetPass", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: code.join(""), newPass: pass }),
      })
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data.user) {
            setUser(user);
            history.push("/account/home");
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };
  useEffect(() => {
    if (code.join("")) {
      setErrMsg(null);
    }
  }, [code]);
  return (
    <div className="formWrapper resetPass">
      <img className="logo" src="/logo_benner.jpg" alt="Delivery pay logo" />
      <p className="title">Password reset</p>
      {
        //   <p className="links">
        //   Already have an account?<Link to="/u/login">Login</Link>
        // </p>
      }
      {step === 1 && (
        <form onSubmit={submit}>
          <input
            type="text"
            name="phone"
            required={true}
            placeholder="Phone Number or email"
            value={id}
            onChange={(e) => {
              setErrMsg(null);
              setId(e.target.value);
            }}
          />
          <button disabled={errMsg || loading} type="submit">
            Next
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={submit}>
          <label>
            A 6 digit code has been sent to your phone. Enter the code below.
          </label>
          <section className="code">
            <input
              ref={code1}
              type="number"
              value={code[0]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[0] = e.target.value[0] || "";
                  return newCode;
                });
                if (e.target.value.length === 1) {
                  code2.current.focus();
                }
              }}
            />
            <input
              ref={code2}
              type="number"
              value={code[1]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[1] = e.target.value[0] || "";
                  return newCode;
                });
                if (e.target.value.length === 1) {
                  code3.current.focus();
                }
              }}
            />
            <input
              ref={code3}
              type="number"
              value={code[2]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[2] = e.target.value[0] || "";
                  return newCode;
                });
                if (e.target.value.length === 1) {
                  code4.current.focus();
                }
              }}
            />
            <input
              ref={code4}
              type="number"
              value={code[3]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[3] = e.target.value[0] || "";
                  return newCode;
                });
                if (e.target.value.length === 1) {
                  code5.current.focus();
                }
              }}
            />
            <input
              ref={code5}
              type="number"
              value={code[4]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[4] = e.target.value[0] || "";
                  return newCode;
                });
                if (e.target.value.length === 1) {
                  code6.current.focus();
                }
              }}
            />
            <input
              ref={code6}
              type="number"
              value={code[5]}
              required={true}
              onChange={(e) => {
                setCode((prev) => {
                  const newCode = [...prev];
                  newCode[5] = e.target.value[0] || "";
                  return newCode;
                });
              }}
            />
          </section>
          <button disabled={errMsg || loading} type="submit">
            Next
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={submit}>
          <input
            type="password"
            name="password"
            required={true}
            placeholder="Password"
            aria-autocomplete="list"
            autoComplete="new-password"
            onChange={(e) => {
              setErrMsg(null);
              setPass(e.target.value);
            }}
          />
          <section className="pass">
            <input
              type="password"
              name="confirm_password"
              id="confirm_password"
              required={true}
              placeholder="Confirm Password"
              aria-autocomplete="list"
              autoComplete="new-password"
              onChange={(e) => {
                setErrMsg(null);
                setConfirm_pass(e.target.value);
              }}
            />
          </section>
          <button disabled={errMsg || loading} type="submit">
            {step === 3 ? "Submit" : "Next"}
          </button>
        </form>
      )}
      {errMsg && <p className="errMsg">{errMsg}</p>}
    </div>
  );
};

function UserStart() {
  const { setUser, user } = useContext(SiteContext);
  const history = useHistory();
  useEffect(() => {
    fetch("/api/authUser")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          history.push(history.location.state?.from || "/account/home");
        }
      });
  }, []);
  return (
    <div className="generic">
      <Header />
      <div className="userStart">
        <div className="banner">
          <div className="header">
            <h3>Experience the best and secure Transactions</h3>
            <p>We ensure buyer and seller happiness</p>
          </div>
          <img
            className="illustration"
            src="/landingPage_illustration.png"
            alt="illustration"
          />
        </div>
        <div className="forms">
          <Switch>
            <Route path="/u/join">
              <RegisterForm />
            </Route>
            <Route path="/u/login">
              <LoginForm />
            </Route>
            <Route path="/u/resetPassword">
              <PasswordReset />
            </Route>
          </Switch>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserStart;
