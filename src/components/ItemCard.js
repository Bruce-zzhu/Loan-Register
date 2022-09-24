import React from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap'
import { LOANER } from '../utils/helpers';
import Highlighter from "react-highlight-words";

const ItemCard = (props) => {

  const {image, title, category, user, startDate, endDate, loanStatus, gridView, searchText} = props;

  const userView = window.location.pathname.slice(-6);

  const renderText = (text) => {
    return <Highlighter
              highlightStyle={{
                backgroundColor: 'var(--orange-color)',
                padding: 0,
              }}
              searchWords={[searchText]}
              autoEscape={true}
              textToHighlight={text}
            />
  }
  
  return (
    <>
      {
        gridView ?
          <Card className='item-card'>
            <div style={{height: '13rem'}}>
              {
                image && <img alt="item-img" src={image} width='100%' height='100%' />
              }
            </div>
            <CardBody>
              <CardTitle tag="h3" style={{marginBottom: '0.5rem', width:'100%'}}>{renderText(title)}</CardTitle>
              <div>
                <Row>
                  <Col>
                    <p className='attribute'>Category: </p>
                  </Col>
                  <Col xs='6' sm='6'>
                    <p>{renderText(category)}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='attribute'>Loan Status: </p>
                  </Col>
                  <Col xs='6' sm='6'>
                    <p>{loanStatus ? loanStatus : "Available"}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='attribute'>Current {userView === LOANER ? 'loanee' : 'loaner'}: </p>
                  </Col>
                  <Col xs='6' sm='6'>
                    <p>{user}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='attribute'>Start date: </p>
                  </Col>
                  <Col>
                    <p>{startDate}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='attribute'>End date: </p>
                  </Col>
                  <Col>
                    <p>{endDate}</p>
                  </Col>
                </Row>
                
              </div>
            </CardBody>
          </Card>
        :
          <Row className='item-card-long'>
            <Col md='4' style={{paddingLeft: '0', height: '100%'}}>
              <div style={{height: '100%'}}>
                <img alt="item-img" src={image} height='100%' width='100%' />
              </div>
            </Col>
            <Col md='8' style={{paddingTop: '1.5rem', paddingBottom: '1rem'}}>
              <Row>
                <h3>{renderText(title)}</h3>
              </Row>
              <Row style={{alignItems: 'center'}}>
                <Col>
                  <Row>
                    <Col md='5'>
                      <p className='attribute'>Category: </p>
                    </Col>
                    <Col>
                      <p>{renderText(category)}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md='5'>
                      <p className='attribute'>Current {userView === LOANER ? 'loanee' : 'loaner'}: </p>
                    </Col>
                    <Col>
                      <p>{user}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md='5'>
                      <p className='attribute'>Start date: </p>
                    </Col>
                    <Col>
                      <p>{startDate}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md='5'>
                      <p className='attribute'>End date: </p>
                    </Col>
                    <Col>
                      <p>{endDate}</p>
                    </Col>
                  </Row>
                </Col>
                <Col md='4' className='d-flex justify-content-end' style={{marginRight: '3rem', marginTop: '-1.5rem'}}>
                  <h3>{loanStatus ? "On loan" : "Not loaned"}</h3>
                </Col>
              </Row>
            </Col>
          </Row>
      }
    </>
  );
};

export default ItemCard;
