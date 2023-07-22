import React, { Component } from 'react';
import { FaRegSmile } from 'react-icons/fa';
import { database } from '../../../firebase';
import { ref, onChildAdded } from 'firebase/database';
import { connect } from 'react-redux';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

export class DirectMessages extends Component {

  state = {
    usersRef: ref(database, "users"),
    users: [],
    activeChatRoom: ""
  }

  componentDidMount() {
    if (this.props.user) {
      this.addUsersListeners(this.props.user.uid);
    }
  }

  addUsersListeners = (currentUserId) => {
    const { usersRef } = this.state;
    let usersArray = [];
    onChildAdded(usersRef, (dataSnapshot) => {

      if (currentUserId !== dataSnapshot.key) {
        let user = dataSnapshot.val();
        user.uid = dataSnapshot.key;
        user.status = "offline";
        usersArray.push(user);
        this.setState({users: usersArray});
      }
    })
  }

  getChatRoomId = (userId) => {
    const currentUserId = this.props.user.uid;

    return userId > currentUserId ? `${userId}/${currentUserId}` : `${currentUserId}/${userId}`; 
  } 
  changeChatRoom = (user) => {
    const chatRoomId = this.getChatRoomId(user.uid);
    const chatRoomData = {
      id: chatRoomId,
      name: user.name
    }

    this.props.dispatch(setCurrentChatRoom(chatRoomData));
    this.props.dispatch(setPrivateChatRoom(true));
    this.setActiveChatRoom(user.uid);
  }

  setActiveChatRoom = (userId) => {
    this.setState({ activeChatRoom: userId })
  }

  renderDirectMessages = (users) =>
    users.length > 0 &&  
    users.map(user => (
      <li key={user.uid} 
          onClick={() => this.changeChatRoom(user)}
          style={{
            backgroundColor: user.uid === this.state.activeChatRoom && "#ffffff45",
            cursor: 'pointer'
          }}>
        # {user.name}
      </li>
    ))

  render() {
    console.log("users", this.state.users);
    const { users } = this.state;
    return (
      <div>
        <span style={{ display: 'flex', alignItems: 'center'}}>
          <FaRegSmile style={{ marginRight: 3}} />
          DIRECT MESSAGES(1)
        </span>
        <ul style={{ listStyleType: 'none', padding: 0}}>
          {this.renderDirectMessages(users)}
        </ul>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.currentUser
  }
}
export default connect(mapStateToProps)(DirectMessages);