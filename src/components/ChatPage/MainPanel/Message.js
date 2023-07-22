import React from 'react';
import { Image, Row, Col } from 'react-bootstrap';
import moment from 'moment';

function Message({message, user }) {
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();
  const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content');
  }
  const isMessageMine = (message, user) => {
    if (user) {
      return (message.user.id === user.uid ? 'flex-end' : 'flex-start');
    } 
  } 

  return (
    <div style={{ display: 'flex', justifyContent: isMessageMine(message, user) }}>
      <div style={{ padding: '5px 10px', border: '1px solid lightgray', borderRadius: '10px', width: '75%' }}
           className='mb-2'>
        <Row>
          <Col sm={1} style={{ minWidth: '65px' }}>
            <Image style={{ borderRadius: '10px'}}
                width={48}
                height={48}
                src={message.user.image}
                alt={message.user.image} />
          </Col>
          <Col sm={10}>
            <div>
              <h6>{message.user.name}
                <span style={{ fontSize: '10px', color: 'gray', marginLeft: '10px'}}>
                  {timeFromNow(message.timestamp)}
                </span>
              </h6>
              {isImage(message) ? 
                <img style={{ maxWidth: '300px' }} alt="imagePicture" src={message.image} /> : 
                <p style={{ margin: '0'}}>
                  {message.content}
                </p> 
              }
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Message