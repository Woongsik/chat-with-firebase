import React, { useState, useRef } from 'react';
import { FloatingLabel, Form, ProgressBar, Row, Col, Button } from 'react-bootstrap';
import { database, storage } from '../../../firebase';
import { ref, set, serverTimestamp, push, remove } from 'firebase/database';
import { ref as refFromStorage, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useSelector } from 'react-redux';

function MessageForm() {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const currentChatRoom = useSelector(state => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(state => state.chatRoom.isPrivateChatRoom);
  const currentUser = useSelector(state => state.user.currentUser);
  const inputOpenImageRef = useRef();

  const handleChange = (e) => {
    setContent(e.target.value);  
  }

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  }

  const getPath = () => {
    if (isPrivateChatRoom) {
      return `messages/private/${currentChatRoom.id}`;
    } 
    return  `messages/public/${currentChatRoom.id}`;
  }

  const handleUploadImage = async (e) => {
    const messagesRef = push(ref(database, `messages/${currentChatRoom.id}`));
    const file = e.target.files[0];
    console.log('file', file);
    setLoading(true);
    
    if (!file) return;

    /// YOu can put the timestamp to file name
    const filePath = `${getPath()}/${new Date().getUTCMilliseconds}_${file.name}`;
    const metadata = { contentType: file.type};

    try {
      const storageRef = refFromStorage(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on("state_changed", 
        (snapshot) => {
          // console.log("snapshot", snapshot);
          const percentage = Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setPercentage(percentage);
      }, 
      err => {
        console.log('error', err);
        setLoading(false);
      },
      async () => {
        console.log("Uploaded!", uploadTask.snapshot);

        // Upload completed successfully, now we can get the download URL
        let downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        console.log('download url', downloadURL);

        if (downloadURL) {
          await set(messagesRef, createMessage(downloadURL));
          setLoading(false);
        }      
      });  
    } catch(e) {
      console.log('file upload error', e);
    }
  }

  const createMessage = (fileUrl = null) => {
    const message = {
      timestamp: serverTimestamp(),
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        image: currentUser.photoURL
      }
    }

    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = content;
    }

    return message;
  }

  const handleSubmit = async () => {
    const messagesRef = push(ref(database, `messages/${currentChatRoom.id}`));
    
    if (!content) {
      setErrors(prev => prev.concat('Type contents first'));
      return;
    }

    setLoading(true);

    try {
      await set(messagesRef, createMessage());

      const typingRef = ref(database, `typing/${currentChatRoom.id}/${currentUser.uid}`);
      remove(typingRef);

      setLoading(false);
      setContent("");
      setErrors([]);
    } catch (e) {    
      console.log('Adding message to firebase error', e);      
      setErrors(prev => prev.concat(e.message));
      setLoading(false);
      setTimeout(()=> {
        setErrors([]);
      }, 5000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.keyCode === 13) {
      handleSubmit();
    }

    const typingRef = ref(database, `typing/${currentChatRoom.id}/${currentUser.uid}`);
    if (content) {
      set(typingRef, currentUser.displayName);
    } else {
      remove(typingRef);
    }
  }

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <FloatingLabel
          controlId="floatingTextarea"
          label="Messages"
          className="mb-3">
          <Form.Control as="textarea" 
                        placeholder="Enter a message"
                        value={content}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}/>
        </FloatingLabel>
      </Form>
      
      {
        (percentage !== 0 && percentage !== 100 && 
        <ProgressBar variant="warning" label={`${percentage} %`} now={percentage} />)
      }      

      <div>
        {errors.map(errorMsg => <p style={{ color: 'red'}} key={errorMsg}>{errorMsg}</p>)}
      </div>

      <Row className='mt-3'>
        <Col>
          <Button style={{ width: '100%', borderRadius: 0 }} variant="warning"
                  onClick={handleSubmit}>
            SEND
          </Button>
        </Col>

        <Col>
          <Button style={{ width: '100%', borderRadius: 0 }} variant="primary"
                  onClick={handleOpenImageRef}
                  >
            UPLOAD
          </Button>
        </Col>

        <input accept="image/jpg, image/jpeg, image/png"
               style={{ display: 'none' }}
               type='file'
               ref={inputOpenImageRef}
               onChange={handleUploadImage} />
      </Row>
    </div>
  )
}

export default MessageForm