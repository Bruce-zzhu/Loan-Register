import React, { useEffect, useState } from "react";
import '../styles/Account.scss'
import { TextBkgBox, ToggleInput, TextButton, Loading, NoAccess } from '../components';
import API from '../utils/api';
import { useNavigate } from "react-router-dom";
import { noAccessRedirect } from "../utils/helpers";

const Account = (props) => {
  // page navigation
  const [noAccess, setNoAccess] = useState(false);
  const navigate = useNavigate();

  // form submission
  const [nameSub, setNameSub] = useState(false);
  const [emailSub, setEmailSub] = useState(false);
  const [warning, setWarning] = useState("");

  // form data
  const [userInfo, setUserInfo] = useState({});
  const [newName, setNewName] = useState(<Loading />);
  const [newEmail, setNewEmail] = useState(<Loading />);

  // if the entered display name is not unique, show warning
  // else, submit data to the server
  const saveName = async (name) => {
    let fetchedData = [];
    const failAlert = "There was an error saving your username. Please try again later.";
    const onFail = () => { setNewName(userInfo.display_name); alert(failAlert); }
    
    // disallow further edit until server GET & PUT requests have been completed
    setNameSub(true);
    setNewName(<Loading />);

    // disallow leading/trailing spaces
    if (/^\s/.test(name) || /\s$/.test(name)) {
      setWarning("No trailing or leading whitespaces allowed in username.");
      setNameSub(false);
      setNewName(userInfo.display_name);
      return;
    }
    
    await API.get(`/users?display_name=${name}`)
      .then((res) => {fetchedData = res.data})
      .catch((err) => { console.log(err); fetchedData = false; });

    if (fetchedData === false) onFail();
    else if (fetchedData.length === 0 || fetchedData[0]._id === props.uid) {
      let formData = { _id: props.uid, display_name: name};
      await API(`/users`, {
        method: "put", data: formData,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          console.log(res);
          setNewName(name);
          setUserInfo((info) => {return {...info, display_name: name}});
        })
        .catch((err) => { console.log(err); onFail(); });
    } else {
      setWarning(`The username ${name} is taken.`);
      setNewName(userInfo.display_name);
    }

    setNameSub(false);
  }

  // if the entered login email is not unique, show warning
  // else, submit data to the server
  const saveEmail = async (email) => {
    let fetchedData = [];
    const failAlert = "There was an error saving your login email. Please try again later.";
    const onFail = () => { setNewEmail(userInfo.login_email); alert(failAlert); }

    // disallow further edit until server GET & PUT requests have been completed
    setEmailSub(true);
    setNewEmail(<Loading />);

    await API.get(`/users?email=${email}`)
      .then((res) => {fetchedData = res.data})
      .catch((err) => { console.log(err); fetchedData = false; });

    if (fetchedData === false) onFail();
    else if (fetchedData.length === 0 || fetchedData[0]._id === props.uid) {
      let formData = { _id: props.uid, login_email: email};
      await API(`/users`, {
        method: "put", data: formData,
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          console.log(res);
          setNewEmail(email);
          setUserInfo((info) => {return {...info, login_email: email}});
        })
        .catch((err) => { console.log(err); onFail() });
    } else {
      setWarning(`The login email ${email} is taken.`);
      setNewEmail(userInfo.login_email);
    }
    setEmailSub(false);
  }

  // redirect user away from page if user is not logged in
  useEffect(() => {
    if (props.loggedIn === false) {
      noAccessRedirect("/login", navigate, setNoAccess);
    }
  }, [props.loggedIn, navigate])

  // get user data from server, querying using userId recorded in the app's session
  useEffect(() => {
    if (props.loggedIn !== true) return;
    const fetchUser = async () => {
      let fetchedData = null;
      if (props.uid == null) return;

      await API.get(`/users?id=${props.uid}`)
      .then((res) => fetchedData = res.data)
      .catch((err) => console.log(err));

      if (fetchedData == null) fetchedData = [{
        _id: props.uid,
        display_name: "Retrieval Failed"
      }];
      
      setUserInfo(fetchedData);
      setNewName(fetchedData.display_name);
      setNewEmail(fetchedData.login_email);
    };
    fetchUser();
  }, [props.loggedIn, props.uid, navigate]);

  return (
    <>{noAccess ? <NoAccess /> :
      <div className={"account-page"}>
        <TextBkgBox>
          <h1>Account</h1>
          <div className={"inline-flex"}>
            <h3>Username:</h3>
            <ToggleInput disabled={nameSub} saveInput={saveName} type="text"
              onToggle={() => setWarning("")} maxLength={20}
              field="display_name" value={newName} setVal={setNewName}
            />
          </div>
          <div className={"inline-flex"}>
            <h3>Email:</h3>
            <ToggleInput disabled={emailSub} saveInput={saveEmail} setVal={setNewEmail}
              field="login_email" value={newEmail} type="email" onToggle={() => setWarning("")}
            />
          </div>
          <h4 className="warning">{warning}</h4>
          <a href="/change-password">
            <TextButton disabled={ nameSub || emailSub }>Change password</TextButton>
          </a>
        </TextBkgBox>
      </div>
    }</>
  );
};

export default Account;
