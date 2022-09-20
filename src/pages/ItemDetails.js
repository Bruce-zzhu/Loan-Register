import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import '../styles/ItemPage.scss'
import { LoanForm, TextButton, Loading, Submitting, NoAccess } from '../components';
import { MdEdit } from 'react-icons/md';
import { fetchItem } from "../utils/itemHelpers";
import { createLoan, editLoan, fetchAllLoanees, fetchLoan, returnLoan } from "../utils/loanHelpers";
import { noAccessRedirect } from "../utils/helpers";
import noImg from "../images/noImage_300x375.png";
import dateFormat from 'dateformat';

const ItemDetails = (props) => {
  const redirect = useNavigate();
  const itemId = useParams().id;
  const [item, setItem] = useState({
    item_name: <Loading />, image_url: noImg,
    category: <Loading />, description: <Loading />,
    being_loaned: false, loan_id: null, loanee_name: <Loading />,
    loan_start_date: <Loading />, intended_return_date: <Loading />
  });
  const [lnFormOpen, setLnFormOpen] = useState(false);

  const [loaneeName, setLoaneeName] = useState("");
  const [allLoanees, setAllLoanees] = useState({"Test User 2": "62fd8a9df04410afbc6df31e"});
  const [suggestedLoanees, setSuggestedLoanees] = useState([]);

  const [loanDate, setLoanDate] = useState(dateFormat(new Date(), 'dd/mm/yyyy'));
  const [returnDate, setReturnDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  const location = useLocation()
  const dbData = location.state ? location.state.item : null;

  const toggle = () => {
    setLnFormOpen(!lnFormOpen);
    if (item.being_loaned) {
      setLoaneeName(item.loanee_name);
      setLoanDate(item.loan_start_date);
      setReturnDate(item.intended_return_date);
    } else {
      setLoaneeName("");
      setLoanDate(new Date().toLocaleDateString());
      setReturnDate("");
    }
  };

  const selectLoanee = (ln) => setLoaneeName(ln);
  const deleteLoanee = (ln) => setSuggestedLoanees((prev) => prev.filter((lns) => lns !== ln));
  const changeLoanee = (e) => setLoaneeName(e.target.value);

  const handleCrtLn = async (input) => {
    setSubmitting(true);
    await createLoan({
      ...input, item_id: itemId, loaner_id: props.uid
    }, () => {
      redirect(`/item-details/${itemId}`, {state: {item: {
        ...item, being_loaned: true, loan_id: null
      }}});
      window.location.reload();
    })
  };
  const handleEdtLn = async (input) => {
    setSubmitting(true);
    await editLoan({ _id: item.loan_id, ...input }, () => {
      redirect(`/item-details/${itemId}`, {state: {item: {
        ...item, being_loaned: true, loan_id: null
      }}});
      window.location.reload();
    })
  }
  const handleRtnLn = async () => {
    setSubmitting(true);
    await returnLoan(item, () => {
      redirect(`/item-details/${itemId}`, {state: {item: {
        ...item, being_loaned: false, loan_id: null
      }}});
      window.location.reload();
    })
  }

  useEffect(() => { setSubmitting(false); fetchAllLoanees(setAllLoanees); }, []);
  useEffect(() => setSuggestedLoanees(Object.keys(allLoanees)), [allLoanees]);

  // get and show item data
  useEffect(() => {
    if (dbData === null) fetchItem(itemId, setItem);
    else {
      setItem( {...dbData, loan_id: null, loanee_name: <Loading />,
        loan_start_date: <Loading />, intended_return_date: <Loading /> });
      redirect(`/item-details/${itemId}`, {state: null});
    }
  }, [itemId, dbData, redirect]);

  useEffect (() => {
    if (item.item_owner == null) return;
    if (props.uid == null || props.uid !== item.item_owner) {
      noAccessRedirect(props.uid == null ? "/login" : "/dashboard",
        redirect, setNoAccess);
      return;
    }

    if (item.being_loaned) {
      if (item.loan_id === undefined || item.loan_id == null) {
        fetchLoan(item.item_id, setItem);
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

  }, [item, props.uid, redirect])

  return (
    <>{noAccess ? <NoAccess /> :
      <div className={"item-page"}>

        <Link to={`/item-details/${itemId}/edit`} state={{item: item}}>
          <button className={"edit-item icon-blue"}><MdEdit size={40} /></button>
        </Link>
        
        <div className={"item-details"}>

          <div className={"item-image"} style={{
            backgroundImage: item.image_url !== undefined
              ? `url(${item.image_url})` : `url(${noImg})`
          }} />
          
          <p className={"item-status"}>Status: {item.being_loaned ? "On Loan" : "Available"}</p>
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
            <p>Description:<br />{ typeof(item.description) != "string"
              ? item.description
              : item.description.split("\n").map((line, i) => {
                return <span key={i}>{line}<br /></span>
              }) // react-string-replace didn't work :/
            }</p>
          </div>
        </div>

        <div className={"btn-list"}>
          <a href="/history"><TextButton>History</TextButton></a>
          {item.being_loaned ? <>
            <TextButton onClick={toggle}>Edit Loan</TextButton>
            <TextButton onClick={handleRtnLn}>{"Mark Return"}</TextButton>
          </> :
            <TextButton onClick={toggle}>Loan Item</TextButton>
          }
        </div>

        <LoanForm modal={lnFormOpen} toggle={toggle} item={item}
          newLoan={!item.being_loaned} loaneeValue={loaneeName}
          onSubmit={item.being_loaned ? handleEdtLn : handleCrtLn}
          allLoanees={allLoanees} suggestedLoanees={suggestedLoanees}
          changeLoanee={changeLoanee} selectLoanee={selectLoanee} deleteLoanee={deleteLoanee}
          lnDateValue={loanDate} rtnDateValue={returnDate}
          chgLnDate={(d) => setLoanDate(d)} chgRtnDate={(d) => setReturnDate(d)}
        />
        {submitting ? <Submitting /> : null}
      </div>
    }</>
  );
};

export default ItemDetails;
