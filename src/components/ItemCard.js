import React from 'react';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap'

const ItemCard = (props) => {

  const {image, title, category, loanee, startDate, endDate, gridView} = props;

  return (
    <>
      {
        gridView ?
          <Card className='item-card'>
            <img alt="Sample" src={image} />
            <CardBody>
              <CardTitle tag="h3" style={{marginBottom: '0.5rem'}}>{title}</CardTitle>
              <div>
                <Row>
                  <Col>
                    <p className='card-subtitle'>Category: </p>
                  </Col>
                  <Col>
                    <p>{category}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='card-subtitle'>Current loanee: </p>
                  </Col>
                  <Col>
                    <p>{loanee}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='card-subtitle'>Start date: </p>
                  </Col>
                  <Col>
                    <p>{startDate}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <p className='card-subtitle'>End date: </p>
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
                <img src={image} height='100%' width='100%' />
              </div>
            </Col>
            <Col>
              <Row style={{alignItems: 'center', height: '100%'}}>
                <Col>
                  <h3>{title}</h3>
                  <p><span className='card-subtitle'>Category: </span>{category}</p>
                  <p><span className='card-subtitle'>Current loanee: </span>{loanee}</p>
                </Col>
                <Col>
                  <p><span className='card-subtitle'>Start date: </span>{startDate}</p>
                  <p><span className='card-subtitle'>End date: </span>{endDate}</p>
                </Col>
                <Col className='d-flex justify-content-end' style={{marginRight: '3rem'}}>
                  <h2>On Loan</h2>
                </Col>
              </Row>
            </Col>
          </Row>
      }
    </>
  );
};

export default ItemCard;
