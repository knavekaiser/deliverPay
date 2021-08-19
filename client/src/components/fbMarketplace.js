import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../SiteContext";
import { updateProfileInfo } from "./Profile";
import { Modal } from "./Modal";
import {
  Chev_down_svg,
  Checkbox,
  Combobox,
  Step_fill,
  Img,
  LS,
} from "./Elements";
import Moment from "react-moment";
require("./styles/fbMarketplace.scss");

const fb_user_ID = "299956335236790";
const fb_access_token =
  "EAAMfkavJ6uwBAK6lr0f85WL937EpFALZAzD4R5ZBC8DYF2ZCgfZBdWovUHBYc4Oyu9LBpDYlFqNi8IoP9sA3NZC7ZAPjBZCDuoyynZBkWysrfD8YLo4uKrcZAfn0sM4DDtD7N1w7V6H5QVGa7G1qSbdr3yzwVwRoCd14s6de69Uf1Pw6g8OiBpwdU6YNs6pY5G4dEMl2CWGHXZBV4S6MSFLv7M";

const Step = ({
  label,
  defaultStatus,
  children,
  disabled,
  className,
  data,
  step,
}) => {
  const [open, setOpen] = useState(data ? !data : null);
  return (
    <div
      className={`step ${open || defaultStatus ? "open" : ""} ${
        disabled ? "disabled" : ""
      } ${className || ""}`}
    >
      <div
        className="head"
        onClick={() => {
          if (!defaultStatus) {
            setOpen(!open);
          }
        }}
      >
        <Chev_down_svg className="chev" /> {label}
        <div className="status">{data && <Step_fill />}</div>
      </div>
      {(open || defaultStatus) && <div className="body">{children}</div>}
    </div>
  );
};

const Marketplace = () => {
  const { user, setUser } = useContext(SiteContext);
  const { FB } = window;
  const [step, setStep] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log(user.fbMarket);
    if (!user.fbMarket?.user?.id) {
      setStep("account");
    } else if (!user.fbMarket?.businessManager?.id) {
      setStep("businessManager");
    } else if (!user.fbMarket?.facebookPage?.id) {
      setStep("fbPage");
    }
    // else if (!user.fbMarket?.dataSharing) {
    // setStep("dataSharing");
    // }
    else if (!user.fbMarket?.commerceAccount?.id) {
      setStep("commerceAccount");
    } else if (!user.fbMarket?.userAggrement) {
      setStep("terms");
    }
  }, [user]);
  useEffect(() => {
    FB.getLoginStatus(function (response) {
      console.log(response);
      if (response.status === "connected") {
        var accessToken = response.authResponse.accessToken;
      }
    }, true);
  }, []);
  return (
    <div className="fbMarket">
      <h1>Facebook marketplace (Working progress)</h1>
      <div className="setup">
        <Step
          data={user.fbMarket?.user?.id ? user.fbMarket.user : null}
          defaultStatus={step === "account"}
          step={step}
          label="Facebook Account"
        >
          <p className="note">
            Shopify uses your personal Facebook account to access your business
            accounts.
          </p>
          <div className="profile">
            <div className="user">
              {user.fbMarket?.user?.id ? (
                <>
                  <Img
                    key="img"
                    src={user.fbMarket.user.profileImg || "/profile-user.jpg"}
                  />
                  <p>{user.fbMarket.user.name}</p>
                </>
              ) : (
                <>
                  <Img key="placeholder" src="/profile-user.jpg" />
                  <p>Connect your Facebook account to get started</p>
                </>
              )}
            </div>
            {user.fbMarket?.user?.id ? (
              <button
                className="btn"
                onClick={() => {
                  updateProfileInfo({
                    "fbMarket.user": {},
                    "fbMarket.businessManager": {},
                    "fbMarket.facebookPage": {},
                    "fbMarket.dataSharing": null,
                    "fbMarket.commerceAccount": {},
                  }).then(({ user: newUser }) => {
                    setUser((prev) => ({
                      ...prev,
                      fbMarket: newUser.fbMarket,
                    }));
                  });
                }}
              >
                Discounnect
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  FB.login((res) => {
                    console.log(res);
                    LS.set(
                      "facebook_user_accessToken",
                      res.authResponse?.accessToken
                    );
                    FB.api(
                      "/me",
                      "GET",
                      { fields: "name,picture.type(large){url}" },
                      (res) => {
                        console.log(res);
                        if (res.id) {
                          updateProfileInfo({
                            "fbMarket.user.name": res.name,
                            "fbMarket.user.id": res.id,
                            "fbMarket.user.profileImg": res.picture.data.url,
                          }).then(({ user: newUser }) => {
                            setUser((prev) => ({
                              ...prev,
                              fbMarket: newUser.fbMarket,
                            }));
                          });
                        }
                      }
                    );
                  });
                }}
              >
                Connect Account
              </button>
            )}
          </div>
        </Step>
        <Step
          disabled={!user.fbMarket?.user?.id}
          data={
            user.fbMarket?.businessManager?.id
              ? user.fbMarket.businessManager
              : null
          }
          defaultStatus={step === "businessManager"}
          label="Business Manager"
          className="businessManager"
        >
          <BusinessManager />
        </Step>
        <Step
          data={
            user.fbMarket?.facebookPage?.id ? user.fbMarket.facebookPage : null
          }
          defaultStatus={step === "fbPage"}
          label="Facebook Page"
          className="page"
          disabled={!user.fbMarket?.businessManager?.id}
        >
          <FbPage />
        </Step>
        {
          //   <Step
          //   data={user.fbMarket?.dataSharing}
          //   disabled={!user.fbMarket?.facebookPage?.id}
          //   label="Data Sharing"
          //   defaultStatus={step === "dataSharing"}
          //   className="dataSharing"
          // >
          //   <DataSharing setStep={setStep} />
          // </Step>
        }
        <Step
          data={
            user.fbMarket?.commerceAccount?.id
              ? user.fbMarket.commerceAccount
              : null
          }
          disabled={!user.fbMarket?.facebookPage?.id}
          label="Facebook Commerce Account"
          defaultStatus={step === "commerceAccount"}
          className="commerceAccount"
        >
          <CommerceAccount />
        </Step>
        <Step
          disabled={!user.fbMarket?.commerceAccount?.id}
          data={user.fbMarket?.userAggrement || null}
          defaultStatus={step === "terms"}
          label="Terms and Conditions"
        >
          <p>
            You need to accept Facebook Commerce Terms in order to sell your
            products on Facebook or Instagram.
          </p>
          <button className="btn">Accept terms</button>
        </Step>
      </div>
    </div>
  );
};

const BusinessManager = () => {
  const { user, setUser } = useContext(SiteContext);
  const { FB } = window;
  const [businessManagers, setBusinessManagers] = useState([]);
  useEffect(() => {
    if (!user.fbMarket?.business?.id) {
      FB.api(
        "/me",
        "GET",
        { fields: "businesses{picture{url},name,id,created_time}" },
        function (res) {
          if (res.businesses) {
            setBusinessManagers(res.businesses.data);
          }
        }
      );
    }
  }, [user]);
  return (
    <>
      {user.fbMarket?.businessManager?.id ? (
        <>
          <p className="note">
            The Business Manager that owns all your Facebook business accounts.
          </p>
          <ul>
            <li>
              <div className="profile">
                <Img src={user.fbMarket.businessManager.profileImg} />
                <div className="detail">
                  <a
                    href={`https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=${user.fbMarket.businessManager.id}`}
                  >
                    {user.fbMarket.businessManager.name}
                  </a>
                  <span>ID: {user.fbMarket.businessManager.id}</span>
                  <span>
                    Created at:{" "}
                    <Moment format="DD MMM YYYY, hh:mm a">
                      {user.fbMarket.businessManager.created_time}
                    </Moment>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  updateProfileInfo({
                    "fbMarket.businessManager": {},
                  }).then(({ user: newUser }) => {
                    setUser((prev) => ({
                      ...prev,
                      fbMarket: newUser.fbMarket,
                    }));
                  });
                }}
                className="btn"
              >
                Discounnect
              </button>
            </li>
          </ul>
        </>
      ) : (
        <>
          <p className="note">
            Connect the Business Manager you use to manage your business Page,
            accounts, and product catalog. You can only connect a Business
            Manager you have admin access to.
          </p>
          <p className="note">
            After you connect, you may receive a verification email from
            Facebook. If so, you’ll need to confirm your business email address
            before proceeding.
          </p>
          <ul>
            {businessManagers.map((item, i) => (
              <li key={i}>
                <div className="profile">
                  <Img src={item.picture.data.url} />
                  <div className="detail">
                    <a
                      href={`https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=${item.business_id}&asset_id=${item.asset_id}`}
                    >
                      {item.name}
                    </a>
                    <span>ID: {item.id}</span>
                    <span>
                      Created at:{" "}
                      <Moment format="DD MMM YYYY, hh:mm a">
                        {item.created_time}
                      </Moment>
                    </span>
                  </div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    updateProfileInfo({
                      "fbMarket.businessManager.id": item.id,
                      "fbMarket.businessManager.name": item.name,
                      "fbMarket.businessManager.createdAt": item.created_time,
                      "fbMarket.businessManager.profileImg":
                        item.picture.data.url,
                    }).then(({ user: newUser }) => {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    });
                  }}
                >
                  Connect
                </button>
              </li>
            ))}
            <li>
              <div className="profile">
                <Img src="/profile-user.jpg" />
                <p>Create Business Manager</p>
              </div>
              <button className="btn">Create new</button>
            </li>
          </ul>
        </>
      )}
    </>
  );
};
const FbPage = () => {
  const { FB } = window;
  const { user, setUser } = useContext(SiteContext);
  const [fbPages, setFbPages] = useState([]);
  useEffect(() => {
    if (!user.fbMarket?.business?.id) {
      FB.api(
        "/me/accounts",
        "GET",
        { fields: "picture{url},access_token,name,category" },
        function (res) {
          console.log("facebook pages:", res);
          if (res.data) {
            setFbPages(res.data);
          }
        }
      );
    }
  }, [user]);
  return (
    <>
      {user.fbMarket?.facebookPage?.id ? (
        <>
          <p className="note">
            The Facebook business Page that you use to sell your products or
            post ads.
          </p>
          <ul>
            <li>
              <div className="profile">
                <Img src={user.fbMarket.facebookPage.profileImg} />
                <div className="detail">
                  <a
                    href={`https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=${user.fbMarket.businessManager.id}`}
                  >
                    {user.fbMarket.facebookPage.name}
                  </a>
                  <span>ID: {user.fbMarket.facebookPage.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  updateProfileInfo({
                    "fbMarket.facebookPage": {},
                  }).then(({ user: newUser }) => {
                    setUser((prev) => ({
                      ...prev,
                      fbMarket: newUser.fbMarket,
                    }));
                  });
                }}
                className="btn"
              >
                Discounnect
              </button>
            </li>
          </ul>
        </>
      ) : (
        <>
          <p className="note">
            Connect the business Page you use to sell products or post ads. You
            can only connect a Page you have admin access to.
          </p>
          <ul>
            {fbPages.map((item, i) => (
              <li key={i}>
                <div className="profile">
                  <Img src={item.picture.data.url} />
                  <div className="detail">
                    <a
                      href={`https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=${item.business_id}&asset_id=${item.asset_id}`}
                    >
                      {item.name}
                    </a>
                    <span>ID: {item.id}</span>
                  </div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    updateProfileInfo({
                      "fbMarket.facebookPage.id": item.id,
                      "fbMarket.facebookPage.name": item.name,
                      "fbMarket.facebookPage.access_token": item.access_token,
                      "fbMarket.facebookPage.profileImg": item.picture.data.url,
                      "fbMarket.facebookPage.category": item.category,
                    }).then(({ user: newUser }) => {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    });
                  }}
                >
                  Connect
                </button>
              </li>
            ))}
            <li>
              <div className="profile">
                <Img src="/profile-user.jpg" />
                <p>Create Page</p>
              </div>
              <button className="btn">Create new</button>
            </li>
          </ul>
        </>
      )}
    </>
  );
};
const DataSharing = ({ setStep }) => {
  const { user, setUser } = useContext(SiteContext);
  const [msg, setMsg] = useState(null);
  const [shareData, setShareData] = useState(
    !!user.fbMarket?.dataSharing || false
  );
  const [dataSharingLavel, setDataSharingLavel] = useState(
    user.fbMarket?.dataSharing || ""
  );
  const [pixels, setPixels] = useState([]);
  return (
    <>
      <p className="note">
        Facebook uses your customer data to target products, page posts, and ads
        to your customers. To get started, first enable data sharing, and then
        choose your level.
      </p>
      <section className="checkWrapper">
        <Checkbox
          value={shareData}
          onChange={(e) => {
            setShareData(e);
          }}
        />
        <label>ENABLE CUSTOMER DATA SHARING</label>
      </section>
      {shareData && (
        <>
          <div className="dataSharingLavel">
            <p>Choose lavel</p>
            <Combobox
              defaultValue={dataSharingLavel}
              required={true}
              options={[
                { label: "Standard", value: "standard" },
                { label: "Enhanced", value: "enhanced" },
                { label: "Maximum", value: "maximum" },
              ]}
              onChange={(e) => setDataSharingLavel(e.value)}
            />
            {dataSharingLavel === "standard" && (
              <p>
                Standard uses <strong>Facebook Pixel</strong>, a third-party
                cookie that collects and shares customers’ browsing behavior on
                your online store. Browser-based ad blockers can prevent the
                pixel from collecting data.
              </p>
            )}
            {dataSharingLavel === "enhanced" && (
              <p>
                Enhanced uses <strong>Advanced Matching</strong>, which shares
                personal information about your customers, including name,
                location, and email. This pixel also shares customer browsing
                behavior on your online store. Browser-based ad blockers can
                prevent the pixel from collecting data.
              </p>
            )}
            {dataSharingLavel === "maximum" && (
              <p>
                Maximum combines all data-sharing options to reach the highest
                amount of customers. It uses <strong>Conversions API</strong>,
                which shares data directly from Shopify’s servers to Facebook.
                This means the data can’t be blocked by ad blockers.
              </p>
            )}
          </div>
          <div className="warning">
            <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zM9 6a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0V6zm1 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              ></path>
            </svg>
            <p className="dscr">
              This option shares <strong>personal customer details</strong>.
              Ensure your privacy policy reflects your data-sharing settings.
            </p>
          </div>
          {
            //   <div>
            //   <div className="head">
            //     <Chev_down_svg />
            //     <p>View Detail</p>
            //   </div>
            // </div>
          }
          <div className="pixel">
            <p>BEHAVIOUR WILL BE TRACKED WITH THIS PIXEL</p>
            <ul>
              {pixels.map((item, i) => (
                <li key={i}>
                  {i}
                  <div className="facebookPage">
                    <div className="thumb" />
                    <p>{item.name}</p>
                    <span>ID: {item.id}</span>
                    <span>Created at: {item.createdAt}</span>
                  </div>
                  <button>Connect</button>
                </li>
              ))}
              <li>
                <div className="profile">
                  <Img src="/profile-user.jpg" />
                  <p>
                    Create Facebook Pixel{" "}
                    <span>
                      By creating a pixel, you agree to{" "}
                      <a href="https://www.facebook.com/legal/technology_terms">
                        Facebook’s Business Tools Terms
                      </a>
                    </span>
                  </p>
                </div>
                <button className="btn">Create new</button>
              </li>
            </ul>
          </div>
        </>
      )}
      <div className="btns">
        <button
          className="btn_clear"
          onClick={() => {
            updateProfileInfo({
              "fbMarket.dataSharing": "none",
            });
          }}
        >
          Skip
        </button>
        <button
          className="btn"
          onClick={() => {
            if (shareData && !dataSharingLavel) {
              setMsg(
                <>
                  <button onClick={() => setMsg(null)}>Okay</button>
                  <div>
                    <h4>Select a data sharing level</h4>
                  </div>
                </>
              );
              return;
            }
            if (user.fbMarket?.dataSharing !== dataSharingLavel) {
              updateProfileInfo({
                "fbMarket.dataSharing": dataSharingLavel,
              }).then(({ user: newUser }) => {
                setUser((prev) => ({ ...prev, fbMarket: newUser.fbMarket }));
              });
            }
          }}
        >
          Confirm
        </button>
      </div>
      <Modal className="msg" open={msg}>
        {msg}
      </Modal>
    </>
  );
};
const CommerceAccount = () => {
  const [commerceAccounts, setCommerceAccounts] = useState([]);
  return (
    <>
      <p className="note">
        Create a Commerce account to start selling on Facebook, Instagram, or
        both. Once you have an account you’ll be able to customize your Shop and
        collections in the{" "}
        <a href="https://www.facebook.com/business/help/2371372636254534">
          Facebook Commerce Manager
        </a>
        .
      </p>
      <ul>
        {commerceAccounts.map((item, i) => (
          <li key={i}>
            {i}
            <div className="facebookPage">
              <div className="thumb" />
              <p>{item.name}</p>
              <span>ID: {item.id}</span>
              <span>Created at: {item.createdAt}</span>
            </div>
            <button>Connect</button>
          </li>
        ))}
        <li>
          <div className="profile">
            <Img src="/profile-user.jpg" />
            <p>Create a new Commerce Account</p>
          </div>
          <button className="btn">Create new</button>
        </li>
      </ul>
    </>
  );
};

export default Marketplace;
