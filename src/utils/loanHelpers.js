import axios from "axios";

const fetchAllLoanees = async (setAllLoanees) => {
  let fetchedData = {};
  await axios.get(`https://server-monkeys-backend-test.herokuapp.com/testingUser?all=1`)
    .then((res) => res.data.forEach((l) => {fetchedData[l.display_name] = l._id}))
    .catch((err) => console.log(err));
  setAllLoanees(fetchedData);
}

const fetchLoan = async (itemId, setItem) => {
  let fetchedData = null;
  let loaneeName = "";

  await axios.get(`https://server-monkeys-backend-test.herokuapp.com/testingLoan?item_id=${itemId}&status=current`)
    .then((res) => fetchedData = res.data[0])
    .catch((err) => console.log(err));

  await axios.get(`https://server-monkeys-backend-test.herokuapp.com/testingUser?id=${fetchedData.loanee_id}`)
    .then((res) => loaneeName = res.data.display_name)
    .catch(err => console.log(err))

  setItem((initItem) => {return {
    ...initItem, loan_id: fetchedData._id, loanee: loaneeName,
    loan_start_date: new Date(Date.parse(fetchedData.loan_start_date)).toLocaleDateString(),
    intended_return_date: new Date(Date.parse(fetchedData.intended_return_date)).toLocaleDateString()
  }});
}

const createLoan = (input) => {
  let formData = { status: "Current", ...input };
  if (input.loan_start_date === null || input.loan_start_date === "")
    formData.loan_start_date = new Date();
  saveLoan(formData, true);
}

const editLoan = (formData) => saveLoan(formData, false);

const returnLoan = async (item) => {
  const actual_return_date = new Date();
  const dateDiff = actual_return_date - new Date(Date.parse(item.intended_return_date));

  let loanFormData = { _id: item.loan_id, actual_return_date: actual_return_date };
  if (dateDiff > 0) saveLoan({...loanFormData, status: "Late Return"});
  else if (dateDiff > -86400000) saveLoan({...loanFormData, status: "On Time Return"});
  else saveLoan({...loanFormData, status: "Early Return"}, false);
}

const saveLoan = async (formData, newItem) => {
  console.log("form saving")

  // clean form
  for (const prop in formData)
    if (formData[prop] === "" || formData[prop] === null) delete formData[prop];

  console.log(formData);
  await axios({
    method: newItem ? "post" : "put", data: formData,
    url: "https://server-monkeys-backend-test.herokuapp.com/testingLoan",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

export { fetchAllLoanees, fetchLoan, createLoan, editLoan, returnLoan };