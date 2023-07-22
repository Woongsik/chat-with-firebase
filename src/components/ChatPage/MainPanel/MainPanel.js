import React, { Component } from 'react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Skelecton from '../../../commons/componenents/Skelecton';

import { connect } from 'react-redux';
import { database } from '../../../firebase';
import { ref, onChildAdded, onChildRemoved, off } from 'firebase/database';

export class MainPanel extends Component {
  messageEndRef = React.createRef();

  state = {
    messages: [],
    messagesRef: '',
    messagesLoading: true,
    searchTerm: "",
    searchResults: [],
    searchLoading: false,
    typingUsers: []
  }

  componentDidMount() {
    /* TODO when render the component, the props.chatRoom is null */
    /* How to watch & render when there is a chatRoom */
    setTimeout(() => {
      const { chatRoom, user } = this.props;
      if (chatRoom && chatRoom.id) {
        this.setState({
          messagesRef: ref(database, `messages/${chatRoom.id}`)
        });
  
        this.addMessageListeners(chatRoom);
        this.addTypingListeners(chatRoom, user);
      }
    }, 1000);
  }

  componentDidUpdate() {
    if (this.messageEndRef) {
      this.messageEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  }

  componentWillUnmount() {
    const { chatRoom } = this.props;
    if (chatRoom) {
      // this.removeMessageListeners(chatRoom);
      off(ref(database, `messages/${chatRoom.id}`));

      // this.removeTypingListeners(chatRoom, user);
      off(ref(database, `typing/${chatRoom.id}`), "child_added");
      off(ref(database, `typing/${chatRoom.id}`), "child_removed");
    }
    
  }

  addTypingListeners = (chatRoom, user) => {
    const typingRef = ref(database, `typing/${chatRoom.id}`);
    let typingUsers = [];

    onChildAdded(typingRef, (dataSnapshot) => {
      if (dataSnapshot.key !== user.uid) {
        typingUsers = typingUsers.concat({
          id: dataSnapshot.key,
          name: dataSnapshot.val()
        });

        this.setState({typingUsers});
      }
    });

    onChildRemoved(typingRef, (dataSnapshot) => {
      let index = typingUsers.findIndex(user => user.id === dataSnapshot.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter((user) => user.id !== dataSnapshot.key);
        this.setState({ typingUsers});
      }
    })
  }

  handleSearchMessages = () => {
    const chatRoomMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = chatRoomMessages.reduce((acc, message) => {
      if ((message.content && message.content.match(regex)) ||
          message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);

    this.setState({ searchResults });
  }

  handleSearchChange = event => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    },
      () => this.handleSearchMessages()
    )
  }

  addMessageListeners = (chatRoom) => {
    let messagesArray = [];
    onChildAdded(ref(database, `messages/${chatRoom.id}`), (data) => {
      console.log('new messages', data);
      messagesArray.push(data.val());
      this.setState({
        messages: messagesArray,
        messagesLoading: false
      });
    })
  }

  renderMessages = (messages) => {
    console.log("Render messages", messages);
    
    return messages.length > 0 && 
    messages.map((message) => (
     <Message key={message.timestamp}
               message={message}
               user={this.props.user} />
    ));
  }

  renderTypingUsers = (typingUsers) => {
    return typingUsers.length > 0 && 
            typingUsers.map((user) => (
              <span key={user.id}>{user.name} is typing...</span>
            ))
  }

  renderMessageSkelecton = (messagesLoading) => {
    return ( messagesLoading && 
      <>
      {[...new Array(10)].map((v, i) => (
        <Skelecton key={i} />
      ))}
      </>
    )
  }

  render() {
    const { messages, searchTerm, searchResults, typingUsers, messagesLoading } = this.state;
    return (
      <div style={{ padding: '1rem 1rem 0 1rem'}}>
        <MessageHeader handleSearchChange={this.handleSearchChange} />
        <div style={{
          width: '100%',
          height: '450px',
          border: '.2rem solid #ececec',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1rem',
          overflowY: 'auto'
        }}>
          
          {this.renderMessageSkelecton(messagesLoading)}

          {searchTerm ? this.renderMessages(searchResults) : this.renderMessages(messages)}

          {this.renderTypingUsers(typingUsers)}

          <div ref={node => (this.messageEndRef = node)}/> 
        </div>

        <MessageForm />
      
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

export default connect(mapStateToProps)(MainPanel);