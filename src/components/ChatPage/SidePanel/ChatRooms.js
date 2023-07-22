
import Button from 'react-bootstrap/Button';
import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { FaRegSmileWink } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';

import { connect } from 'react-redux';
import { database } from '../../../firebase';
import { ref as refFromDatabase, set, push, onChildAdded, off, onValue } from 'firebase/database';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';
import { Badge } from 'react-bootstrap';

export class ChatRooms extends Component {
  state = {
    show: false,
    name: '',
    description: '',
    chatRoomsRef: refFromDatabase(database, `chatRooms`),
    messagesRef: refFromDatabase(database, `messages`),
    chatRooms: [],
    firstLoad: true,
    activeChatRoomId: "",
    notifications: []
  }

  componentDidMount() {
    this.AddChatRoomsListeners();
  }

  componentWillUnmount() {
    off(this.state.chatRoomsRef);

    this.state.chatRooms.forEach(chatRoom => {
      const chatRoomRef = refFromDatabase(database, `chatRooms/${chatRoom.id}`)
      off(chatRoomRef);
    })
  }

  setFirstChatRoom = () => {
    const firstChatRoom = this.state.chatRooms[0];

    if (this.state.firstLoad && this.state.chatRooms.length > 0) {
      this.props.dispatch(setCurrentChatRoom(firstChatRoom));
      this.setState({ activeChatRoomId: firstChatRoom.id });
    }

    this.setState({
      firstLoad: false    
    });
  }

  AddChatRoomsListeners = () => {
    let chatRoomsArray = [];

    onChildAdded(this.state.chatRoomsRef, (data) => {
      if (data.val() && data.val().id) {
        chatRoomsArray.push(data.val());
        this.setState({
          chatRooms: chatRoomsArray
        }, () => this.setFirstChatRoom());
        
        this.addNotificationListener(data.key);
      }      
    });
  }

  addNotificationListener = (chatRoomId) => {
    const messagesChildRef = refFromDatabase(database, `messages/`+ chatRoomId);
    onValue(messagesChildRef, (data) => {
      
      if (this.props.chatRoom) {
        this.handleNotification(
          chatRoomId, 
          this.props.chatRoom.id, 
          this.state.notifications, 
          data);
      }
    });
  }

  handleNotification = (chatRoomId, currentChatRoomId, notifications, data) => {
    let index = notifications.findIndex(notification => notification.id === chatRoomId);
    const dataSize = data.size;
    //
    if (index === -1) {
      notifications.push({
        id: chatRoomId,
        total: dataSize,
        lastKnownTotal: dataSize,
        count: 0
      })
    } else {
      if (chatRoomId !== currentChatRoomId) {
        const lastKnownTotal = notifications[index].lastKnownTotal;

        if (dataSize - lastKnownTotal > 0) {
          notifications[index].count = dataSize - lastKnownTotal;
        }
      } 

      notifications[index].total = dataSize;
    }

    this.setState({ notifications });
  }

  handleClose = () => this.setState({ show: false });
  handleShow = () => this.setState({ show: true });
  handleSubmit = (e) => {
    e.preventDefault();
    const { name, description } = this.state;
    if (this.isFormValid(name, description)) {
      this.addChatRoom();
    }
  }

  addChatRoom = async () => {
    const pushRef = push(this.state.chatRoomsRef);
    const { name, description } = this.state;
    const { user } = this.props;
    const newChatRoom = {
      id: pushRef.key,
      name: name,
      description: description,
      createdBy: {
        name: user.displayName,
        image: user.photoURL
      }
    }

    try {
      await set(pushRef, newChatRoom);
      
      this.setState({
        name: "",
        description: "",
        show: false
      });

    } catch (error) {
      console.log("Add new chat room failed", error);
    }

  }
  
  isFormValid = (name, description) => {
    return name && description;
  }


  chageChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
    this.clearNotifications();
  }

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(notification => notification.id === this.props.chatRoom.id);
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].lastKnownTotal = this.state.notifications[index].total;
      updatedNotifications[index].count = 0;

      this.setState({ notifications: updatedNotifications });
    }
  }

  getNoficitaionCount = (room) => {
    let count = 0;
    this.state.notifications.forEach(notification => {
      if (notification.id === room.id) {
        count = notification.count;
      }
    });

    if (count > 0) {
      return count;
    }
  }

  renderChatRooms = (chatRooms) =>
    chatRooms.map(room => (
      <li key={room.id}
          onClick={() => this.chageChatRoom(room)}
          style={{
            backgroundColor: room.id === this.state.activeChatRoomId && "#ffffff45",
            cursor: 'pointer'
          }}>
        # {room.name}
        <Badge style={{ float: 'right', marginTop: '4px' }} variant="danger">
          {this.getNoficitaionCount(room)}
        </Badge>
      </li> 
    ));

  render() {
    return (
      <div>
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>

          <FaRegSmileWink style={{
            marginRight: 5
          }}/>

          CHAT ROOMS {" "} ({this.state.chatRooms.length})
          <FaPlus onClick={this.handleShow} 
            style={{
              position: 'absolute',
              right: 0,
              cursor: 'pointer'
            }}
          />
        </div>

        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {this.renderChatRooms(this.state.chatRooms)}
        </ul>

        {/* ADD CHAT ROOMS */}
        <>
          <Modal show={this.state.show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Create a chat room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Room name</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter a chat room name"
                    onChange={(e) => this.setState({ name: e.target.value })} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Room info</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter a chat room description"
                    onChange={(e) => this.setState({ description: e.target.value })} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={this.handleSubmit}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.currentUser,
    chatRoom: state.chatRoom.currentChatRoom
  }
}
export default connect(mapStateToProps)(ChatRooms);