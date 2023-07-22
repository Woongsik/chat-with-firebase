import React, {useState, useEffect } from 'react'
import { Container, Row, Col, InputGroup, Form, Image, Accordion } from 'react-bootstrap';
import { FaLock, FaLockOpen, FaSearch } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { database } from '../../../firebase';
import { ref, remove, update, get } from 'firebase/database';

import './MessageHeader.css';

function MessageHeader({handleSearchChange}) {
  const currentChatRoom = useSelector(state => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(state => state.chatRoom.isPrivateChatRoom);
  const user = useSelector(state => state.user.currentUser);

  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (currentChatRoom && user) {
      addFavoriteListener(currentChatRoom.id, user.uid)
    }
  }, []);

  const addFavoriteListener = (currentChatRoomId, userId) => {
    get(getUsersRef(`users/${userId}/favorited`))
    .then((dataSnapShot) => {
      if (dataSnapShot.val() !== null) {
        const chatRoomIds = Object.keys(dataSnapShot.val());
        const isAlreadyFavorite = chatRoomIds.includes(currentChatRoomId);
        setIsFavorited(isAlreadyFavorite);
      }
    }).catch((e) => {
      console.log("== addFavoriteListener error", e);
    });
  }

  const getUsersRef = (childPath) => {
    return ref(database, childPath);
  }
  const handleFavorite = () => {
    if (isFavorited) {
      remove(getUsersRef(`users/${user.uid}/favorited/${currentChatRoom.id}`))
        .then((result) => {
          console.log("Removed favorite", result);
        }).catch((e) => {
          console.log("Removed favorite error", e);
        });
    } else {
      update(getUsersRef(`users/${user.uid}/favorited`), {
        [currentChatRoom.id]: {
          name: currentChatRoom.name,
          description: currentChatRoom.description,
          createdBy: {
            name: currentChatRoom.createdBy.name,
            image: currentChatRoom.createdBy.image
          }
        }
      }).then((result) => {
        console.log("Update favorite", result);
      }).catch((e) => {
        console.log("Update favorite e", e);
      });
    }

    setIsFavorited(prev => !prev)
  }

  return (
    <div style={{
      width: '100%',
      height: '185px',
      border: '.2rem solid #ececec',
      borderRadius: '4px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <Container>
        <Row>
          <Col>
            <h3>
              {isPrivateChatRoom ? <FaLock style={{ marginBottom: '10px' }} /> : <FaLockOpen style={{ marginBottom: '10px' }}/>}
            
              {currentChatRoom && currentChatRoom.name} 

              {!isPrivateChatRoom && 
                <span style={{ cursor: 'pointer' }}
                      onClick={handleFavorite}>
                        {isFavorited ? 
                          <MdFavorite style={{ marginBottom: '10px'}}/> : 
                          <MdFavoriteBorder style={{ marginBottom: '10px'}}/> }
                </span>
              }
              
             </h3>
          </Col>
          <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              onChange={handleSearchChange}
              placeholder="Search messages"
              aria-label="Search"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          </Col>          
        </Row>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <p>
            <Image src="" /> {" "}User name
          </p>          
        </div>
        <Row>
          <Col>
            <Accordion style={{
              padding: '0'              
            }}>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Accordion Item #0</Accordion.Header>
                <Accordion.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do                  
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          
          <Col>
          <Accordion style={{
              padding: '0'              
            }}>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Accordion Item #1</Accordion.Header>
                <Accordion.Body>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do                  
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
        <Row>
          <Col></Col>
          <Col></Col>
        </Row>
      </Container>
    </div>
  )
}


export default MessageHeader;

