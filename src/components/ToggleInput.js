import React, { useState, useEffect } from "react";
import "../styles/ToggleInput.scss";

// field that switches between display mode and edit mode
const ToggleInput = (props) => {
  const [editMode, setEditMode] = useState(false);
  const [curVal, setCurVal] = useState();
  
  // initialise fields
  useEffect(() => {
    setCurVal(props.initVal);
  }, [props]);

  // upon save, update field & switch back to display mode
  const saveInput = async (event) => {
    event.preventDefault();

    console.log(curVal);
    // TODO axios patch request to server

    setEditMode(false);
  }

  return (
    <>
      {
        editMode ?
          <form className={"inline-form"} onSubmit={saveInput}>
            <input required type={props.type} className={"input-box"}
              value={curVal} onChange={event => setCurVal(event.target.value)}
              placeholder={`New ${props.field.replace("_", " ")}`}
            />
            <button className="toggle" type="submit">Save</button>
          </form>
        :
          <>
            <p>{curVal}</p>
            <button className="toggle" onClick={() => {setEditMode(true)}}>Change</button>
          </>
      }
    </>
  )
};

export default ToggleInput;
