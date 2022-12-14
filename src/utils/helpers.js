import dateFormat from 'dateformat';
import { LOANER, LOANEE } from './constants';


/* helper functions */

export const userViewSwitch = (current) => {
  if (current === LOANER) return LOANEE;
  else return LOANER;
}

// compare two arrays
export const compArr = (arr1, arr2) => {
  return arr1.toString() === arr2.toString()
}

export const noAccessRedirect = (page, navigate, setNoAccess, logout = null) => {
  setNoAccess([true, logout != null]);
  setTimeout(() => { if (logout != null) logout(); navigate(page); }, 3000);
}

// assume locale DD/MM/YYYY format
export const toISO = (dateString) => {
  if (dateString.includes("-")) return dateString;
  else if (dateString.includes("/")) {
    let ds = dateString.split("/");
    return `${ds[2]}-${ds[1]}-${ds[0]}`;
  }
  else return "";
}

export const toDDMMYYYY = (dateString) => {
  if (!dateString.includes("-")) return "";
  return dateFormat(Date.parse(dateString), 'dd/mm/yyyy');
}

export const noCaseCmp = (a, b) => {
  if (typeof(a) !== 'string' || typeof(b) !== 'string') return 0;
  return a.toLowerCase().localeCompare(b.toLowerCase());
}