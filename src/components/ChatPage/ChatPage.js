import React, { useEffect } from 'react';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

import SidePanel from './SidePanel/SidePanel';
import MainPanel from './MainPanel/MainPanel';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { clearUser, setUser } from '../../redux/actions/user_actions'; 

function ChatPage() {
  const isLoading = useSelector(state => state.user.isLoading);
  const currentUser = useSelector(state => state.user.currentUser);
  const currentChatRoom = useSelector(state => state.chatRoom.currentChatRoom);

  let navigate = useNavigate();
  let dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("On auth changed:", user);
      if (!user) {
        console.log("No user");
        navigate("/login");
        dispatch(clearUser());
      } else {
        dispatch(setUser(user));
      }
    });
  });

  if (!isLoading && currentUser) {
    return (
      <div style={{ display: 'flex' }}>
      <div style={{ width: '300px' }}>
        <SidePanel key={currentUser && currentUser.uid} />
      </div>
      <div style={{ width: '100%'}}>
        <MainPanel key={currentChatRoom && currentChatRoom.id} />
      </div>
    </div>
    );
  } else 
    return (  
      <div>Loading...</div>
  );
}

export default ChatPage