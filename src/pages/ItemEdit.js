import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import '../styles/ItemPage.scss'
import { TextButton, InputDropdown, Submitting, Deletable, NoAccess } from '../components';
import { RiImageAddFill } from 'react-icons/ri'
import { fetchItem, fetchCategs, selectCategory, changeCategory, deleteCategory, changeImage, saveItem } from "../utils/itemHelpers";
import { noAccessRedirect } from "../utils/helpers";
import noImg from "../images/noImage_300x375.png";

const ItemEdit = (props) => {
  // page navigation
  const redirect = useNavigate();
  const [noAccess, setNoAccess] = useState(false);
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  
  // original item information
  const itemId = useParams().id;
  const dbData = location.state ? location.state.item : null;
  const [item, setItem] = useState({
    item_name: "Loading...",
    category: "Loading...",
    description: "Loading..."
  });
  const [displayImg, setDisplayImg] = useState(noImg);

  // new item image, name, category, description
  const [itemImg, setItemImg] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCateg, setNewCateg] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // user category list for modifying & selecting
  const [categOpen, setCategOpen] = useState(false);
  const [categList, setCategList] = useState([]);
  const [delableCg, setDelableCg] = useState([]);

  // item img changing
  const handleChgImg = (e) => {
    changeImage(e.target.files[0], setItemImg, displayImg, setDisplayImg);
  };

  // toggle category inputdropdown open/close
  const categShow = () => {
    if (delableCg.length !== 0) setCategOpen((prevState) => !prevState)
  };

  // typeable/selectable category changing via inputdropdown
  const handleSelCg = (categ) => selectCategory(categ, setNewCateg);
  const handleChgCg = (e) => changeCategory(e, setNewCateg);
  const handleDelCg = (categ) => {
    deleteCategory(categ, setCategList, props.uid);
  }

  // save item and post to server
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let imgString = "";

    // convert any new images into base64 string
    if (itemImg !== null) {
      imgString = await new Promise((resolve) => {
        let fileReader = new FileReader();
        fileReader.onload = () =>
          resolve(fileReader.result.replace('data:', '').replace(/^.+,/, ''));
        fileReader.readAsDataURL(itemImg);
      });
    }

    await saveItem(e, itemId, categList, setCategList, imgString, props.uid, false);
    redirect(`/item-details/${itemId}`, {state: {item: {
      ...item, image_url: displayImg,
      item_name: newName, category: newCateg, description: newDesc,
    }}});
  }

  // get list of potential categories for render & modification
  useEffect(() => {
    fetchCategs(props.uid, setCategList, setDelableCg);
  }, [props.uid]);
  
  // get and show item data
  useEffect(() => {
    if (dbData === null) fetchItem(itemId, setItem);
    else {
      setItem(dbData);
      redirect(`/item-details/${itemId}`, {state: null});
    }
  }, [itemId, dbData, redirect]);

  // if user is not item owner, redirect them away from page
  // else, loan original information to display on page
  useEffect(() => {
    if (item.item_owner == null) return;
    if (props.uid == null || props.uid !== item.item_owner) {
      noAccessRedirect(props.uid == null ? "/login" : "/dashboard",
        redirect, setNoAccess);
      return;
    }

    setDisplayImg(item.image_url !== undefined ? item.image_url : noImg)
    setNewName(item.item_name);
    setNewCateg(item.category);
    setNewDesc(item.description);
  }, [item, props.uid, redirect])

  return (
    <>{noAccess ? <NoAccess /> : 
      <div className={"item-page"}>
        <div className={"item-details"}>
          <div className={"item-image"} style={{backgroundImage: `url(${displayImg})`}}>
            <label className={"add-img"}>
              <RiImageAddFill size={40} />
              <input
                type="file" accept="image/*" 
                name="newImg" style={{display: "none"}}
                onChange={handleChgImg} 
              />
            </label>
          </div>
          
          <div className={"item-info"}>
            <form id="editItem" onSubmit={handleSaveItem}>
              <table><tbody>
                <tr>
                  <td>Name:</td>
                  <td>
                    <input name="newName" className={"input-box"} type="text"
                      value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder="Enter name..." required
                    />
                  </td>
                </tr>
                <tr>
                  <td>Category:</td>
                  <td>
                    <InputDropdown dropdownOpen={categOpen} toggle={categShow}
                      name="newCateg" placeholder="Enter category..."
                      value={newCateg} changeOption={handleChgCg} required
                    >
                      {categList.map((c) => {
                        return <Deletable askRm
                          field="category" key={`opt-${c}`}
                          selectOption={(e) => {categShow(); handleSelCg(e)}}
                          deleteOption={handleDelCg} canDel={delableCg.includes(c)}
                          hideOption={(categ) => setCategList(
                              (prev) => prev.filter((c) => c !== categ)
                            )} >
                          {c}
                        </Deletable>
                      })}
                    </InputDropdown>
                  </td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                </tr>
                </tbody></table>
              <p><span>Description:</span><br />
                <textarea name="newDesc" style={{width: "-webkit-fill-available"}}
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="(Optional) Enter description..." />
              </p>
            </form>
          </div>
        </div>

        <div className={"btn-list"}>
          <TextButton altStyle
            onClick={() => redirect(`/item-details/${itemId}`, {state: {item: item}})}
          >Cancel</TextButton>
          <TextButton form="editItem" type="submit">Save</TextButton>
        </div>
        
        {submitting ? <Submitting /> : null}
      </div>
    }</>
  );
};

export default ItemEdit;
