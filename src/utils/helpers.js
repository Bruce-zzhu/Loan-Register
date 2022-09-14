export const LOANER = 'loaner';
export const LOANEE = 'loanee';

export const userViewSwitch = (current) => {
  if (current === LOANER) return LOANEE;
  else return LOANER;
}

export const noAccessRedirect = (page, redirect, setPopupOpen) => {
  setPopupOpen(true);
  setTimeout(() => redirect(page), 3000);
}