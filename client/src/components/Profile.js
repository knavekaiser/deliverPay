import { useState, useEffect, useContext, useRef } from "react";
import { SiteContext } from "../SiteContext";

async function updateProfileInfo(newData) {
  return fetch("/api/editUserProfile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(err);
      alert("Could not update profile info");
    });
}

const Profile = ({ history, match, location }) => {
  const { user, setUser } = useContext(SiteContext);
  const [mismatchPass, setMismatchPass] = useState(false);
  return (
    <div className="profileContainer">
      <div className="benner">
        <div className="profileImg">
          <img src={user.profileImg} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="91.832"
            height="25.468"
            viewBox="0 0 91.832 25.468"
          >
            <g
              id="Path_1937"
              data-name="Path 1937"
              transform="translate(15.429 -9.647)"
              fill="#fff"
            >
              <path
                d="M 29.79687690734863 34.6146240234375 C 22.21588897705078 34.6146240234375 13.43720626831055 32.0111198425293 5.0779709815979 27.28368377685547 C -2.8753981590271 22.78578186035156 -9.78753662109375 16.7585563659668 -14.48426628112793 10.24203777313232 C -13.95890235900879 10.24473857879639 -13.30369663238525 10.25548648834229 -12.80753517150879 10.26361274719238 C -12.44524097442627 10.26955413818359 -12.15906429290771 10.27424812316895 -12.02891159057617 10.27424812316895 C -11.93940830230713 10.27424812316895 -11.86373233795166 10.26253128051758 -11.79978466033936 10.24241733551025 C -11.48864650726318 10.21196746826172 -10.04010391235352 10.17821311950684 -5.149840831756592 10.17821311950684 C -1.226676225662231 10.17821311950684 4.093100070953369 10.19837760925293 9.725229263305664 10.21973037719727 C 16.20444107055664 10.24428367614746 23.54814720153809 10.27211856842041 29.79687690734863 10.27211856842041 C 31.89767646789551 10.27211856842041 43.68988800048828 10.22107124328613 56.17448806762695 10.16702461242676 L 59.24650192260742 10.15374183654785 C 60.32665252685547 10.14907169342041 61.61424255371094 10.14680099487305 63.18285369873047 10.14680099487305 C 64.99295043945313 10.14680099487305 66.92156219482422 10.14978885650635 68.78666687011719 10.15269470214844 C 70.55825042724609 10.1554479598999 72.23158264160156 10.15804767608643 73.72422027587891 10.15804767608643 C 74.4501953125 10.15804767608643 75.08247375488281 10.1574182510376 75.63590240478516 10.15613842010498 C 74.24596405029297 13.15391826629639 71.95748138427734 16.1362361907959 68.82386779785156 19.03109550476074 C 65.67525482177734 21.9398250579834 61.6738166809082 24.71903610229492 57.25215911865234 27.06828308105469 C 52.91740798950195 29.37135314941406 48.15610122680664 31.27616500854492 43.48295974731445 32.57678985595703 C 38.69290161132813 33.90995407104492 33.96032333374023 34.6146240234375 29.79687690734863 34.6146240234375 Z"
                stroke="none"
              />
              <path
                d="M 63.18235397338867 10.64679336547852 C 61.61428070068359 10.64679336547852 60.32755279541016 10.64906692504883 59.24865341186523 10.65373229980469 L 56.18099212646484 10.6670036315918 C 43.69374084472656 10.72105407714844 31.89901733398438 10.77211761474609 29.79687881469727 10.77211761474609 C 23.54719161987305 10.77211761474609 16.2029914855957 10.74428176879883 9.723331451416016 10.71971893310547 C 4.091693878173828 10.69837951660156 -1.227619171142578 10.67821884155273 -5.149848937988281 10.67821884155273 C -9.844169616699219 10.67821884155273 -11.33226013183594 10.70873641967773 -11.7083740234375 10.73677062988281 C -11.80277252197266 10.76053237915039 -11.90915679931641 10.77424240112305 -12.0289306640625 10.77424240112305 C -12.16323089599609 10.77424240112305 -12.45131683349609 10.7695198059082 -12.81605529785156 10.76354217529297 C -13.01943206787109 10.76021194458008 -13.24966430664063 10.75643920898438 -13.48653411865234 10.75296401977539 C -8.851593017578125 16.903076171875 -2.239547729492188 22.57095718383789 5.324104309082031 26.84845542907715 C 13.60947799682617 31.53411865234375 22.30074310302734 34.11461639404297 29.79687881469727 34.11461639404297 C 33.91565704345703 34.11461639404297 38.60186767578125 33.41628265380859 43.34890747070313 32.0950927734375 C 47.98773193359375 30.80401802062988 52.71426773071289 28.91309356689453 57.0175666809082 26.62672996520996 C 61.40182876586914 24.29735565185547 65.3670654296875 21.5438175201416 68.48458099365234 18.6638298034668 C 71.32099151611328 16.04351997375488 73.45128631591797 13.35661125183105 74.83492279052734 10.65748596191406 C 74.4908447265625 10.65786743164063 74.12125396728516 10.65805435180664 73.72370147705078 10.65805435180664 C 72.23068237304688 10.65805435180664 70.55716705322266 10.65545654296875 68.78539276123047 10.65269470214844 C 66.92047119140625 10.6497917175293 64.9920654296875 10.64679336547852 63.18235397338867 10.64679336547852 M 63.18235778808594 9.646797180175781 C 66.69034576416016 9.646797180175781 70.639892578125 9.658050537109375 73.72370910644531 9.658050537109375 C 74.72272491455078 9.658050537109375 75.63052368164063 9.656867980957031 76.4033203125 9.653743743896484 C 70.7041015625 23.3221435546875 47.19384002685547 35.11461639404297 29.79687881469727 35.11461639404297 C 13.80905532836914 35.11461639404297 -5.7138671875 23.84020614624023 -15.427734375 9.772117614746094 C -15.45098876953125 9.749141693115234 -15.14891815185547 9.741405487060547 -14.71451568603516 9.741401672363281 C -13.8193359375 9.741401672363281 -12.36181640625 9.774246215820313 -12.02893829345703 9.774246215820313 C -11.98212432861328 9.774246215820313 -11.95759582519531 9.773597717285156 -11.9599609375 9.772117614746094 C -12.07225799560547 9.701694488525391 -9.402595520019531 9.678211212158203 -5.14984130859375 9.678211212158203 C 3.356430053710938 9.678211212158203 18.19854354858398 9.772117614746094 29.79687881469727 9.772117614746094 C 32.07231903076172 9.772117614746094 46.01445388793945 9.710941314697266 59.24433135986328 9.653743743896484 C 60.42824935913086 9.648624420166016 61.76977157592773 9.646797180175781 63.18235778808594 9.646797180175781 Z"
                stroke="none"
                fill="#336cf9"
              />
            </g>
          </svg>
          <input
            type="file"
            accept=".jpg, .png, .jpeg"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const tempUrl = URL.createObjectURL(e.target.files[0]);
                setUser((prev) => ({ ...prev, profileImg: tempUrl }));
                // const imgLink = ""; upload image here
                // updateProfileInfo({ profileImg: imgLink }).then((img) => {
                //   if (user) {
                //     setUser(user);
                //   }
                // });
              }
            }}
          />
          <label>Edit</label>
        </div>
        <div>
          <p className="name">{user.firstName + " " + user.lastName}</p>
          <p className="id">Skropay ID: {user.userId || user._id}</p>
        </div>
      </div>
      <div className="settings">
        <div className="head">Account Settings</div>
        <ul>
          <DataEdit
            label="Name"
            fields={
              <>
                <section>
                  <input
                    placeholder="First name"
                    defaultValue={user.firstName}
                    name="firstName"
                    required={true}
                  />
                </section>
                <section>
                  <input
                    placeholder="last name"
                    defaultValue={user.lastName}
                    name="lastName"
                    required={true}
                  />
                </section>
              </>
            }
            value={user.firstName + " " + user.lastName}
          />
          <DataEdit
            label="Phone Number"
            fields={
              <>
                <section>
                  <input
                    placeholder="Phone Number"
                    defaultValue={user.phone}
                    name="phone"
                    required={true}
                  />
                </section>
              </>
            }
            value={user.phone}
          />
          <DataEdit
            label="Email"
            fields={
              <>
                <section>
                  <input
                    placeholder="Phone Number"
                    defaultValue={user.email}
                    name="email"
                    required={true}
                  />
                </section>
              </>
            }
            value={user.email}
          />
          <DataEdit
            label="Password"
            onError={() => setMismatchPass(true)}
            fields={
              <>
                <section>
                  <input
                    placeholder="Password"
                    name="password"
                    required={true}
                    type="password"
                    onChange={(e) => setMismatchPass(false)}
                  />
                </section>
                <section>
                  <input
                    placeholder="Confirm password"
                    name="confirm_password"
                    required={true}
                    type="password"
                    onChange={(e) => setMismatchPass(false)}
                  />
                </section>
                {mismatchPass && (
                  <p className="errMsg">Password did not match.</p>
                )}
              </>
            }
            value="••••••••••••"
          />
          <DataEdit
            label="Gender"
            fields={
              <>
                <section>
                  <input
                    placeholder="Gender"
                    defaultValue={user.gender}
                    name="gender"
                    required={true}
                  />
                </section>
              </>
            }
            value={user.gender}
          />
          <DataEdit
            label="Age"
            fields={
              <>
                <section>
                  <input
                    type="number"
                    placeholder="Age"
                    defaultValue={user.age}
                    name="age"
                    required={true}
                  />
                </section>
              </>
            }
            value={user.age}
          />
          <DataEdit
            label="Address"
            fields={
              <>
                <section>
                  <input
                    type="text"
                    placeholder="Address"
                    defaultValue={user.address.street}
                    name="address.street"
                    required={true}
                  />
                </section>
                <section>
                  <input
                    type="text"
                    placeholder="City"
                    defaultValue={user.address.city}
                    name="address.city"
                    required={true}
                  />
                </section>
                <section>
                  <input
                    type="text"
                    placeholder="State"
                    defaultValue={user.address.state}
                    name="address.state"
                    required={true}
                  />
                </section>
                <section>
                  <input
                    type="number"
                    placeholder="PIN Code"
                    defaultValue={user.address.zip}
                    name="address.zip"
                    required={true}
                  />
                </section>
              </>
            }
            value={`${user.address?.street || ""} ${user.address?.city || ""} ${
              user.address?.state || ""
            } ${user.address?.zip}`}
          />
        </ul>
      </div>
    </div>
  );
};

const DataEdit = ({ label, fields, value, onError }) => {
  const { setUser } = useContext(SiteContext);
  const [edit, setEdit] = useState(false);
  const form = useRef(null);
  const submit = (e) => {
    e.preventDefault();
    const allData = {};
    for (var [field, value] of new FormData(e.target).entries()) {
      allData[field] = value;
    }
    if (allData.password && allData.password !== allData.confirm_password) {
      onError?.();
      return;
    }
    if (allData["address.city"]) {
      navigator.geolocation.getCurrentPosition(function (position) {
        let lat = position.coords.latitude;
        let long = position.coords.longitude;
        allData["address.location"] = {
          type: "Point",
          coordinates: [long, lat],
        };
      });
    }
    fetch("/api/editUserProfile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allData),
    })
      .then((res) => res.json())
      .then(({ user }) => {
        if (user) {
          setUser(user);
          setEdit(false);
        } else {
          console.log(user);
          alert("someting went wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        alert("someting went wrong");
      });
  };
  return (
    <li>
      <p className="label">{label}</p>
      <form ref={form} onSubmit={submit}>
        {edit ? (
          <div className="inputs">{fields}</div>
        ) : (
          <p className="currentValue">{value}</p>
        )}
        <div className="btns">
          {edit ? (
            <>
              <button key="submit" type="submit">
                Save changes
              </button>
              <button key="cancel" type="button" onClick={() => setEdit(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button key="edit" type="button" onClick={() => setEdit(true)}>
              Edit
            </button>
          )}
        </div>
      </form>
    </li>
  );
};

export default Profile;
