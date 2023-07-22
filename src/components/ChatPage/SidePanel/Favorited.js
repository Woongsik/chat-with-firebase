import { onChildAdded, onChildRemoved, ref, off, get } from 'firebase/database';
import React, { Component } from 'react'
import { FaRegSmileBeam } from 'react-icons/fa';
import { database } from '../../../firebase';
import { connect } from 'react-redux';
import { setCurrentChatRoom, setPrivateChatRoom } from '../../../redux/actions/chatRoom_action';

export class Favorited extends Component {

  state = {
    favoritedChatRooms: [],
    activeChatRoomId: ''
  }

  componentDidMount(){
    if (this.props.user) {
      this.addListeners(this.props.user.uid);
      this.setFavoriteChatRooms(this.props.user.uid);
    }
  }

  componentWillUnmount() {
    if (this.props.user) {
      this.removeListeners(this.props.user.uid);
    }
  }

  setFavoriteChatRooms = (userId) => {
    const usersRef = ref(database, `users/${userId}/favorited`);
    get(usersRef)
      .then((dataSnapShot) => {
        if (dataSnapShot.val() != null) {
          const newRooms = Object.keys(dataSnapShot.val()).map((roomId) => {
            return {
              id: roomId,
              ...dataSnapShot.val()[roomId]
            }
          });
  
          this.setState({ favoritedChatRooms: newRooms });
        }
      }).catch((e) => {
        console.log("== error", e);
      });
  }

  removeListeners = (userId) => {
    const usersRef = ref(database, `users/${userId}/favorited`);
    off(usersRef);
  }

  addListeners = (userId) => {
    const usersRef = ref(database, `users/${userId}/favorited`);
    onChildAdded(usersRef, (dataSnapShot) => {
      const favoritedChatRoom = {
        id: dataSnapShot.key, 
        ...dataSnapShot.val()
      }
      this.setState({ 
        favoritedChatRooms: [...this.state.favoritedChatRooms, favoritedChatRoom]
      });
    });

    onChildRemoved(usersRef, (dataSnapShot) => {
      const chatRoomToRemove = {
        id: dataSnapShot.key, 
        ...dataSnapShot.val()
      }

      const filteredChatRooms = this.state.favoritedChatRooms.filter((chatRoom) => {
        return chatRoom.id !== chatRoomToRemove.id;
      });

      this.setState({
        favoritedChatRooms: filteredChatRooms
      })
    })
  }

  changeChatRoom = (room) => {
    this.props.dispatch(setCurrentChatRoom(room));
    this.props.dispatch(setPrivateChatRoom(false));
    this.setState({ activeChatRoomId: room.id });
  }

  renderFavoritedChatRooms = (favoriteChatRooms) => {
    return favoriteChatRooms.length > 0 &&
    favoriteChatRooms.map(chatRoom => (
      <li key={chatRoom.id}
          onClick={() => this.changeChatRoom(chatRoom)}
          style={{ backgroundColor: chatRoom.id === this.state.activeChatRoomId && '#ffffff45',
                   cursor: 'pointer' }}>
        # {chatRoom.name}
      </li>
    ));
  }

  render() {
    const {favoritedChatRooms} = this.state;
    return (
      <div>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <FaRegSmileBeam style={{ marginRight: '3px'}}/>
          FAVORITED (1)
        </span>

        <ul style={{ listStyleType: 'none', padding: '0' }}>
          {this.renderFavoritedChatRooms(favoritedChatRooms)}
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

export default connect(mapStateToProps)(Favorited);