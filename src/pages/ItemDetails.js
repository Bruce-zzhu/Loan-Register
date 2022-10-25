import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import '../styles/ItemPage.scss'
import { LoanForm, TextButton, Loading, Submitting, NoAccess, Header } from '../components';
import { MdEdit } from 'react-icons/md';
import { fetchItem, makeVisible } from "../utils/itemHelpers";
import { createLoan, editLoan, fetchAllUsernames, fetchCurLoan, returnLoan } from "../utils/loanHelpers";
import { noAccessRedirect, toDDMMYYYY, noCaseCmp } from "../utils/helpers";
import noImg from "../images/noImage_300x375.png";
import dateFormat from 'dateformat';
import ReactTooltip from "react-tooltip";
import API from "../utils/api";

const ItemDetails = (props) => {
  // page navigation
  const navigate = useNavigate();
  const [noAccess, setNoAccess] = useState(false);
  const [loaneeView, setLoaneeView] = useState(true);

  // eslint-disable-next-line
  const location = useLocation();
  
  // item information
  const itemId = useParams().id;
  const dbData = location.state ? location.state.item : null;

  const [item, setItem] = useState({
    item_name: <Loading />, image_url: "",
    category: <Loading />, description: <Loading />, loan_status: <Loading />,
    being_loaned: false, loan_id: null, loanee_name: <Loading />,
    loan_start_date: <Loading />, intended_return_date: <Loading />
  });
  const [ownName, setOwnName] = useState("");

  // loan form
  const [lnFormOpen, setLnFormOpen] = useState(false);
  const [loaneeName, setLoaneeName] = useState("");
  const [allLoanees, setAllLoanees] = useState({});
  const [suggestedLoanees, setSuggestedLoanees] = useState([]);
  const [loanDate, setLoanDate] = useState(dateFormat(new Date(), 'dd/mm/yyyy'));
  const [returnDate, setReturnDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // open/close loan form with optional existing loan data
  const toggle = () => {
    setLnFormOpen(!lnFormOpen);
    if (item.being_loaned) {
      setLoaneeName(item.loanee_name);
      setLoanDate(item.loan_start_date);
      setReturnDate(item.intended_return_date);
    } else {
      setLoaneeName("");
      setLoanDate(toDDMMYYYY(new Date().toString()));
      setReturnDate("");
    }
  };

  // typeable + selectable loanee entry via InputDropdown
  const selectLoanee = (ln) => setLoaneeName(ln);
  const deleteLoanee = (ln) => setSuggestedLoanees((prev) => prev.filter((lns) => lns !== ln));
  const changeLoanee = (e) => setLoaneeName(e.target.value.slice(0, 20));

  // creates loan
  const handleCrtLn = async (input) => {
    setSubmitting(true);
    createLoan(
      { ...input, item_id: itemId, loaner_id: props.uid, item_image: item.image_url },
      () => {
        if (!item.visible) makeVisible(itemId);
        window.location.reload()
      },
      () => {
        setSubmitting(false);
        alert("There was an error saving your loan. Please try again later.");
      }
    )
  };

  // edits existing loan
  const handleEdtLn = async (input) => {
    setSubmitting(true);
    await editLoan(
      { ...input, _id: item.loan_id, item_image: item.image_url },
      () => {
        if (!item.visible) makeVisible(itemId);
        window.location.reload()
      },
      () => {
        setSubmitting(false);
        alert("There was an error saving your loan. Please try again later.");
      }
    )
  }

  // returns existing loan
  const handleRtnLn = async () => {
    setSubmitting(true);
    await returnLoan(
      item,
      () => {
        if (!item.visible) makeVisible(itemId);
        window.location.reload()
      },
      () => {
        setSubmitting(false);
        alert("There was an error saving your loan. Please try again later.");
      }
    )
  }

  // get all loanees & set loanee suggest list for loan form
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
        display_name: ""
      }];
      setOwnName(fetchedData.display_name);
    };
    fetchUser();

    setSubmitting(false);
    fetchAllUsernames(setAllLoanees);
  }, [props]);

  useEffect(() => {
    if (ownName === "" || allLoanees === {}) return;

    var loanees = allLoanees;
    delete loanees[ownName];
    setSuggestedLoanees(Object.keys(loanees).sort(noCaseCmp));
  }, [ownName, allLoanees]);

  // get and show item data
  useEffect(() => {
    if (props.loggedIn !== true) return;
    console.log("dbData", dbData);
    if (dbData === null || dbData.item_name == null) fetchItem(itemId, setItem);
    else {
      console.log(dbData);
      setItem( {...dbData, loan_id: null, loan_status: <Loading />, loanee_name: <Loading />,
        loan_start_date: <Loading />, intended_return_date: <Loading /> });
    }
  }, [props.loggedIn, itemId, dbData]);

  // redirect user away from page if user is not logged in
  useEffect(() => {
    if (props.loggedIn === false) {
      noAccessRedirect("/login", navigate, setNoAccess);
    }
  }, [props.loggedIn, navigate])

  // if user does not own item, disable edits & history
  // else, fetch any loan data and pre-enter in loan form
  useEffect (() => {
    if (item.item_owner == null) return;
    if (props.uid === item.item_owner) {
      setLoaneeView(false);
    }

    if (item.being_loaned) {
      if (item.loan_id === undefined || item.loan_id == null) {
        fetchCurLoan(item.item_id, setItem);
      } else {
        setLoaneeName(item.loanee_name);
        setLoanDate(item.loan_start_date);
        setReturnDate(item.intended_return_date);
      }
    } else {
      setLoaneeName("");
      setLoanDate(new Date().toLocaleDateString());
      setReturnDate("");
    }
  }, [item, props.uid])

  return (
    <><Header loggedIn={props.loggedIn} onLogout={props.onLogout} />
      {noAccess ? <NoAccess /> :
        <div className={"item-page"}>

          {loaneeView ? <></> :
            <Link to={`/item-details/${itemId}/edit`} state={{item: item}}>
              <button id="edit-item" className={"edit-item icon-blue"} data-tip data-for="edit-item">
                <MdEdit size={40} />
              </button>
              <ReactTooltip id='edit-item'>Edit item</ReactTooltip>
            </Link>
          }
          <div className={"item-details"}>

            <div className={"item-image"} style={{
              backgroundImage: item.image_url !== "" && item.image_url != null
                ? `url(${item.image_url})` : `url(${noImg})`
            }} />
            
            <p className={"item-status"}>
              <span>Status:</span> { item.loan_status != null ? item.loan_status : <Loading /> }
            </p>
            <div className={"item-info"}>
              <table><tbody>
                <tr>
                  <td>Name:</td><td>{item.item_name}</td>
                </tr>
                <tr>
                  <td>Category:</td><td>{item.category}</td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                </tr>
                { item.being_loaned ? <>
                  <tr>
                    <td>Loanee:</td><td>{item.loanee_name}</td>
                  </tr>
                  <tr>
                    <td>Date loaned:</td><td>{item.loan_start_date}</td>
                  </tr>
                  <tr>
                    <td>Expected return:</td><td>{item.intended_return_date}</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                  </tr>
                </> : null}
                </tbody></table>
              <p>
                <span>Description:</span><br />
                { typeof(item.description) != "string"
                  ? item.description
                  : item.description === ""
                    ? "(No description.)"
                    : item.description.split("\n").map((line, i) => {
                      return <span className="item-desc" key={i}>{line}<br /></span>
                    }) // react-string-replace didn't work :/
                }
              </p>
            </div>
          </div>

          {loaneeView ? <></> :
            <div className={"btn-list"}>
              <Link to="history" state={{itemId: item.item_id, itemName: item.item_name}} ><TextButton>History</TextButton></Link>
              {item.being_loaned ? <>
                <TextButton onClick={toggle}>Edit Loan</TextButton>
                <TextButton onClick={handleRtnLn}>{"Mark Return"}</TextButton>
              </> :
                <TextButton onClick={toggle}>Loan Item</TextButton>
              }
            </div>
          }
          <LoanForm modal={lnFormOpen} toggle={toggle} item={item} ownName={ownName}
            newLoan={!item.being_loaned} loaneeValue={loaneeName}
            onSubmit={item.being_loaned ? handleEdtLn : handleCrtLn}
            allLoanees={allLoanees} suggestedLoanees={suggestedLoanees}
            changeLoanee={changeLoanee} selectLoanee={selectLoanee} deleteLoanee={deleteLoanee}
            lnDateValue={loanDate} rtnDateValue={returnDate}
            chgLnDate={(d) => setLoanDate(d)} chgRtnDate={(d) => setReturnDate(d)}
          />
          {submitting ? <Submitting /> : null}
        </div>
      }
    </>
  );
};

export default ItemDetails;