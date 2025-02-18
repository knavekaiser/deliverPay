import { useEffect, useState, useContext } from "react";
import { SiteContext } from "../../SiteContext";
import { updateProfileInfo } from "../Profile";
import { Modal } from "../Modal";
import { Link } from "react-router-dom";
import {
  Chev_down_svg,
  Checkbox,
  Combobox,
  Step_fill,
  Img,
  LS,
  Succ_svg,
  External_link_icon,
  Moment,
} from "../Elements";
require("../styles/fbMarketplace.scss");

export const Step = ({
  label,
  defaultStatus,
  children,
  disabled,
  className,
  data,
  step,
}) => {
  const [open, setOpen] = useState(data ? !data : null);
  useEffect(() => {
    setOpen(defaultStatus);
  }, [defaultStatus]);
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
  const [msg, setMsg] = useState(null);
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
    } else if (user.fbMarket?.instagramAccount === undefined) {
      setStep("instagramAccount");
    }
    // else if (!user.fbMarket?.dataSharing) {
    // setStep("dataSharing");
    // }
    else if (!user.fbMarket?.commerceAccount?.catalog?.id) {
      setStep("commerceAccount");
    } else if (!user.fbMarket?.userAgreement) {
      setStep("terms");
    }
  }, [user]);
  return (
    <div className={`fbMarket ${loading ? "loading" : ""}`}>
      <h1>Facebook marketplace</h1>
      <div className="setup">
        <Step
          data={user.fbMarket?.user?.id ? user.fbMarket.user : null}
          defaultStatus={step === "account"}
          step={step}
          label="Facebook Account"
        >
          <p className="note">
            Delivery Pay uses your personal Facebook account to access your
            business accounts.
          </p>
          {
            //   user.fbMarket?.user?.id && (
            //   <p>Now you can log into Delivery Pay using this account.</p>
            // )
          }
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
                  setLoading(true);
                  FB.logout((res) => {
                    console.log(res);
                  });
                  LS.remove("facebook_user_accessToken");
                  LS.remove("facebook_page_accessToken");
                  updateProfileInfo({
                    "fbMarket.user": {},
                    "fbMarket.businessManager": {},
                    "fbMarket.facebookPage": {},
                    "fbMarket.dataSharing": null,
                    "fbMarket.instagramAccount": {},
                    "fbMarket.commerceAccount": {},
                    "fbMarket.userAgreement": false,
                  }).then(({ user: newUser }) => {
                    if (newUser) {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    }
                  });
                  setLoading(false);
                }}
              >
                Disconnect
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  setLoading(true);
                  FB.login(
                    (res) => {
                      if (res.authResponse?.accessToken) {
                        const accessToken = res.authResponse.accessToken;
                        fetch("/api/addFbMarketUser", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ accessToken }),
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            setLoading(false);
                            if (data.code === "ok") {
                              setUser((prev) => ({
                                ...prev,
                                fbMarket: data.fbMarket,
                              }));
                            }
                          });
                      }
                    },
                    {
                      scope:
                        "business_management,catalog_management,pages_read_engagement,pages_manage_posts,pages_show_list,instagram_basic,instagram_content_publish,publish_to_groups",
                      return_scopes: true,
                    }
                  );
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
          <BusinessManager setLoading={setLoading} />
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
          <FbPage setLoading={setLoading} />
        </Step>
        <Step
          data={
            user.fbMarket?.instagramAccount?.id
              ? user.fbMarket.instagramAccount
              : null
          }
          disabled={!user.fbMarket?.facebookPage?.id}
          label="Instagram Account"
          defaultStatus={step === "instagramAccount"}
          className="instagramAccount"
        >
          <InstagramAccount setStep={setStep} setLoading={setLoading} />
        </Step>
        <Step
          data={
            user.fbMarket?.commerceAccount?.catalog?.id
              ? user.fbMarket.commerceAccount
              : null
          }
          disabled={!user.fbMarket?.facebookPage?.id}
          label="Facebook Commerce Account"
          defaultStatus={step === "commerceAccount"}
          className="commerceAccount"
        >
          <CommerceAccount setStep={setStep} setLoading={setLoading} />
        </Step>
        <Step
          disabled={!user.fbMarket?.commerceAccount?.catalog?.id}
          data={user.fbMarket?.userAgreement || null}
          defaultStatus={step === "terms"}
          label="Terms and Conditions"
        >
          <p>
            By proceeding, you accept{" "}
            <a
              target="_blank"
              href="https://www.facebook.com/legal/commerce_product_merchant_agreement"
            >
              Facebook Commerce Terms <External_link_icon />
            </a>
            .
          </p>
          {!user.fbMarket?.userAgreement && (
            <button
              className="btn"
              onClick={() => {
                updateProfileInfo({
                  "fbMarket.userAgreement": true,
                }).then(({ user: newUser }) => {
                  setUser((prev) => ({ ...prev, fbMarket: newUser.fbMarket }));
                  setStep("");
                  setMsg(
                    <>
                      <button onClick={() => setMsg(null)}>Okay</button>
                      <div>
                        <Succ_svg />
                        <h4>
                          Facebook marketplace has been setup successfully. Now
                          you can add products to facebook marketplace directly
                          from Delivery Pay.
                        </h4>
                        <Link to="/account/myShop/products">
                          Add your first product
                        </Link>
                      </div>
                    </>
                  );
                });
              }}
            >
              Finish setup
            </button>
          )}
        </Step>
      </div>
      <Modal open={msg} className="msg">
        {msg}
      </Modal>
    </div>
  );
};

const BusinessManager = ({ setLoading }) => {
  const { user, setUser } = useContext(SiteContext);
  const { FB } = window;
  const [businessManagers, setBusinessManagers] = useState([]);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!user.fbMarket?.business?.id) {
      FB.api(
        "/me",
        "GET",
        {
          fields: "businesses{picture{url},name,id,created_time}",
          access_token: user.fbMarket.user.access_token,
        },
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
                    {user.fbMarket.businessManager.name} <External_link_icon />
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
                  setLoading(true);
                  updateProfileInfo({
                    "fbMarket.businessManager": {},
                    "fbMarket.facebookPage": {},
                    "fbMarket.commerceAccount": {},
                    "fbMarket.userAgreement": false,
                  }).then(({ user: newUser }) => {
                    setLoading(false);
                    if (newUser) {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    }
                  });
                }}
                className="btn"
              >
                Disconnect
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
          {err && <div className="err">{err}</div>}
          <ul>
            {businessManagers.map((item, i) => (
              <li key={i}>
                <div className="profile">
                  <Img src={item.picture.data.url} />
                  <div className="detail">
                    <a
                      href={`https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=${item.business_id}&asset_id=${item.asset_id}`}
                    >
                      {item.name} <External_link_icon />
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
                    setLoading(true);
                    updateProfileInfo({
                      "fbMarket.businessManager.id": item.id,
                      "fbMarket.businessManager.name": item.name,
                      "fbMarket.businessManager.createdAt": item.created_time,
                      "fbMarket.businessManager.profileImg":
                        item.picture.data.url,
                    }).then(({ user: newUser }) => {
                      setLoading(false);
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
              <button
                className="btn"
                onClick={() => {
                  setLoading(true);
                  FB.api(
                    `/${user.fbMarket?.user?.id}/businesses`,
                    "POST",
                    {
                      name: "Delivery Pay Business Manager",
                      vertical: "ECOMMERCE",
                    },
                    function (res) {
                      setLoading(false);
                      console.log(res);
                      if (res.id) {
                        FB.api(
                          "/me",
                          "GET",
                          {
                            fields:
                              "businesses{picture{url},name,id,created_time}",
                          },
                          function (res) {
                            if (res.businesses) {
                              setBusinessManagers(res.businesses.data);
                            }
                          }
                        );
                      }
                      if (res.error) {
                        if (res.error.code === 1) {
                          setErr(
                            <>
                              You have reached maximum number of business
                              manager one user can have. Use one of existing
                              business manager instead of creating a new one.
                            </>
                          );
                        } else if (res.error.code === 3947) {
                          setErr(
                            <>
                              You already have a Business Manager with the same
                              name. Select "Delivery Pay Business Manager"
                              instead of creating a new one. or Choose another.
                            </>
                          );
                        } else {
                          setErr(
                            <>{res.error.error_user_msg || res.error.message}</>
                          );
                        }
                      }
                    }
                  );
                }}
              >
                Create new
              </button>
            </li>
          </ul>
        </>
      )}
    </>
  );
};
const FbPage = ({ setLoading }) => {
  const { FB } = window;
  const { user, setUser } = useContext(SiteContext);
  const [fbPages, setFbPages] = useState([]);
  const [createNew, setCreateNew] = useState(false);
  useEffect(() => {
    if (!user.fbMarket?.business?.id) {
      FB.api(
        "/me/accounts",
        "GET",
        {
          fields: "picture{url},access_token,name,category,business",
          access_token: user.fbMarket.user.access_token,
        },
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
                    {user.fbMarket.facebookPage.name} <External_link_icon />
                  </a>
                  <span>Category: {user.fbMarket.facebookPage.category}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setLoading(true);
                  updateProfileInfo({
                    fbMarket: {
                      user: user.fbMarket.user,
                      businessManager: user.fbMarket.businessManager,
                    },
                  }).then(({ user: newUser }) => {
                    setLoading(false);
                    if (newUser) {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    }
                  });
                }}
                className="btn"
              >
                Disconnect
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
                      {item.name} <External_link_icon />
                    </a>
                    <span>{item.category}</span>
                  </div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setLoading(true);
                    updateProfileInfo({
                      "fbMarket.facebookPage.id": item.id,
                      "fbMarket.facebookPage.name": item.name,
                      "fbMarket.facebookPage.access_token": item.access_token,
                      "fbMarket.facebookPage.profileImg": item.picture.data.url,
                      "fbMarket.facebookPage.category": item.category,
                    }).then(({ user: newUser }) => {
                      setLoading(false);
                      if (newUser) {
                        setUser((prev) => ({
                          ...prev,
                          fbMarket: newUser.fbMarket,
                        }));
                      }
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
              <button className="btn" onClick={() => setCreateNew(true)}>
                Create new
              </button>
            </li>
          </ul>
        </>
      )}
      <Modal
        head={true}
        label="Create a new Facebook business Page"
        open={createNew}
        setOpen={() => {
          setCreateNew(false);
          FB.api(
            "/me/accounts",
            "GET",
            {
              fields: "picture{url},access_token,name,category,business",
              access_token: user.fbMarket.user.access_token,
            },
            function (res) {
              console.log("facebook pages:", res);
              if (res.data) {
                setFbPages(res.data);
              }
            }
          );
        }}
        className="createNewPage"
      >
        <div className="content">
          <p>
            You'll be redirected to Facebook where you can create a new business
            Page. All you need for now are basic details such as:
          </p>
          <ul>
            <li>Business Page name</li>
            <li>Business Page category</li>
            <li>Profile Photo</li>
            <li>Cover photo</li>
            <li>Store description</li>
          </ul>
          <p>
            As soon as you add these details, return to Delivery Pay and finish
            setup. You can always update your Page later.
          </p>
          <a
            target="_blank"
            href="https://www.facebook.com/pages/create/?ref_type=hc"
          >
            <External_link_icon /> Go to Facebook
          </a>
        </div>
      </Modal>
    </>
  );
};
const InstagramAccount = ({ setStep, setLoading }) => {
  const { FB } = window;
  const { user, setUser } = useContext(SiteContext);
  const [insta, setInsta] = useState(null);
  useEffect(() => {
    if (!user.fbMarket?.instagramAccount) {
      FB.api(
        `/${user.fbMarket.facebookPage?.id}`,
        "GET",
        {
          fields: "instagram_business_account",
          access_token: user.fbMarket?.user.access_token,
        },
        (res) => {
          console.log("ig:", res.instagram_business_account);
          if (res.instagram_business_account) {
            FB.api(
              `/${res.instagram_business_account.id}`,
              "GET",
              {
                fields: "username,profile_picture_url",
                access_token: user.fbMarket?.user.access_token,
              },
              function (res) {
                if (res.id) {
                  setInsta(res);
                  updateProfileInfo({
                    "fbMarket.instagramAccount": insta,
                  }).then(({ user: newUser }) => {
                    setUser((prev) => ({
                      ...prev,
                      fbMarket: newUser.fbMarket,
                    }));
                  });
                }
              }
            );
          }
        }
      );
    } else if (
      user.fbMarket.instagramAccount &&
      !user.fbMarket.instagramAccount.id
    ) {
      updateProfileInfo({
        "fbMarket.instagramAccount": null,
      }).then(({ user: newUser }) =>
        setUser((prev) => ({ ...prev, fbMarket: newUser.fbMarket }))
      );
    }
  }, [user]);
  return (
    <>
      {user.fbMarket?.instagramAccount?.id ? (
        <>
          <p className="note">
            Post on Instagram directly from the product dashboard.
          </p>
          <ul>
            <li>
              <div className="profile">
                <Img
                  src={user.fbMarket.instagramAccount?.profile_picture_url}
                />
                <div className="detail">
                  {user.fbMarket.instagramAccount.username}
                </div>
              </div>
            </li>
          </ul>
        </>
      ) : (
        <>
          <p className="note">
            Connect Instagram account to post about your product directly from
            Delivery Pay product dashboard.
          </p>
          {insta && (
            <ul>
              <li>
                <div className="profile">
                  <Img src={insta.profile_picture_url} />
                  <div className="detail">{insta.username}</div>
                </div>
              </li>
            </ul>
          )}
          {!insta && (
            <>
              <div className="err">
                <p>
                  The connected Business Manager doesn’t own any Instagram
                  accounts connected to the Facebook Page. Add your Instagram
                  account to the connected Business Manager and Facebook Page or
                  learn more about{" "}
                  <a
                    href="https://help.instagram.com/502981923235522"
                    target="_blank"
                  >
                    how to create a new business account on Instagram
                  </a>{" "}
                  <External_link_icon />
                </p>
              </div>
              <p>
                If you can’t find an Instagram account, learn more about how to{" "}
                <a
                  href="https://help.instagram.com/502981923235522"
                  target="_blank"
                >
                  create a new account <External_link_icon />
                </a>{" "}
                or how to{" "}
                <a
                  href="https://www.facebook.com/business/help/1125825714110549?id=420299598837059"
                  target="_blank"
                >
                  add an account to your Business Manager <External_link_icon />
                </a>
                .
              </p>
            </>
          )}
          <div className="btns">
            <button
              className="btn_clear"
              onClick={() => {
                setStep("commerceAccount");
                updateProfileInfo({
                  "fbMarket.instagramAccount": null,
                }).then(({ user: newUser }) => {
                  setUser((prev) => ({
                    ...prev,
                    fbMarket: newUser.fbMarket,
                  }));
                });
              }}
            >
              Skip
            </button>
          </div>
        </>
      )}
    </>
  );
};
const CommerceAccount = ({ setStep, setLoading }) => {
  const { FB } = window;
  const { user, setUser } = useContext(SiteContext);
  const [commerceAccounts, setCommerceAccounts] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [catalog, setCatalog] = useState(
    user.fbMarket?.commerceAccount?.catalog
  );
  const [err, setErr] = useState(null);
  useEffect(() => {
    setCatalog(user.fbMarket?.commerceAccount?.catalog);
    if (!user.fbMarket?.commerceAccount?.catalog?.id) {
      FB.api(
        `/${user.fbMarket?.businessManager?.id}/owned_product_catalogs`,
        "GET",
        { fields: "name", access_token: user.fbMarket?.user?.access_token },
        function (res) {
          if (res.error) {
            console.log(res.error);
            setErr(res.error.message);
            return;
          }
          setCatalogs(res.data);
        }
      );
    }
  }, [user]);
  return (
    <>
      <p className="note">
        Create a Commerce account to start selling on Facebook, Instagram, or
        both. Once you have an account you’ll be able to customize your Shop and
        collections in the{" "}
        <a
          target="_blank"
          href="https://www.facebook.com/business/help/2371372636254534"
        >
          Facebook Commerce Manager <External_link_icon />
        </a>
        .
      </p>
      {err && <div className="err">{err}</div>}
      <ul>
        {!user.fbMarket?.commerceAccount?.catalog?.id &&
          catalogs.map((item, i) => (
            <li key={i}>
              <div className="profile">
                <div className="detail">
                  <p>{item.name}</p>
                  <span>ID: {item.id}</span>
                </div>
              </div>
              <button
                className="btn"
                onClick={() => {
                  setLoading(true);
                  updateProfileInfo({
                    "fbMarket.commerceAccount.catalog": item,
                  }).then(({ user: newUser }) => {
                    setLoading(false);
                    if (newUser) {
                      setUser((prev) => ({
                        ...prev,
                        fbMarket: newUser.fbMarket,
                      }));
                    }
                  });
                }}
              >
                Connect
              </button>
            </li>
          ))}
        {catalog && (
          <li className="catalog">
            <p>PRODUCTS WILL BE SYNCED TO THIS CATALOG</p>
            <p>{catalog.name}</p>
            <span>ID: {catalog.id}</span>
            <button
              className="btn"
              onClick={() => {
                setLoading(true);
                updateProfileInfo({
                  "fbMarket.commerceAccount.catalog": null,
                }).then(({ user: newUser }) => {
                  setLoading(false);
                  if (newUser) {
                    setUser((prev) => ({
                      ...prev,
                      fbMarket: newUser.fbMarket,
                    }));
                  }
                });
              }}
            >
              Disconnect
            </button>
          </li>
        )}
        {!catalog && (
          <li>
            <div className="profile">
              <Img src="/profile-user.jpg" />
              <p>Create a new Commerce Account</p>
            </div>
            <button
              className="btn"
              onClick={() => {
                setLoading(true);
                FB.api(
                  `/${user.fbMarket.businessManager.id}/owned_product_catalogs`,
                  "GET",
                  {
                    access_token: user.fbMarket.user.access_token,
                  },
                  async function ({ data, error }) {
                    console.log(data, error);
                    if (error) {
                      setLoading(false);
                      setErr(error.message);
                    }
                    const delCatalog =
                      data?.find(
                        (item) => item.name === "Delivery Pay Product Catalog"
                      ) ||
                      (await FB.api(
                        `/${user.fbMarket.businessManager.id}/owned_product_catalogs`,
                        "POST",
                        {
                          name: "Delivery Pay Product Catalog",
                          access_token: user.fbMarket.user.access_token,
                        },
                        function (res) {
                          setLoading(false);
                          console.log(res.id);
                          if (res.id) {
                            return {
                              ...res,
                              name: "Delivery Pay Product Catalog",
                            };
                          } else {
                            return null;
                          }
                          if (res.error) {
                            console.log(res.error);
                          }
                        }
                      ));
                    if (delCatalog) {
                      setCatalog(delCatalog);
                      setLoading(true);
                      updateProfileInfo({
                        "fbMarket.commerceAccount.catalog": delCatalog,
                      }).then(({ user: newUser }) => {
                        setLoading(false);
                        setUser((prev) => ({
                          ...prev,
                          fbMarket: newUser.fbMarket,
                        }));
                        setStep("terms");
                      });
                    }
                  }
                );
              }}
            >
              Create new
            </button>
          </li>
        )}
      </ul>
    </>
  );
};

export default Marketplace;
