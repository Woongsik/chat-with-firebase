import React, { useRef } from 'react';
import { IoIosChatboxes } from 'react-icons/io';
import Dropdown from 'react-bootstrap/Dropdown';
import Image from 'react-bootstrap/Image';
import { useSelector, useDispatch } from 'react-redux';

import { auth, storage, database } from '../../../firebase';
import { ref as refFromDatabase, update } from 'firebase/database';
import { signOut, updateProfile } from 'firebase/auth';
import { ref as refFromStorage, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import { setPhotoURL } from '../../../redux/actions/user_actions';

function UserPanel() {
  const user = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const inputOpenImageRef = useRef();
  
  const handelLogout = () => {
    signOut(auth).then(() => {
      console.log('Signout from firebase!');
    }).catch((e) => {
      console.log('Signout from firebase failed', e);
    });
  }

  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    console.log("file", file);
    const metadata = { contentType: file.type};

    // save file to storage

    try {
      const storageRef = refFromStorage(storage, `user_profile/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      console.log("storageRef", storageRef);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          console.log("== upload error", error);
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;

            // ...

            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        }, 
        async () => {
          console.log("Uploaded!", uploadTask.snapshot);

          // Upload completed successfully, now we can get the download URL
          let downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          console.log('download url', downloadURL);

          if (downloadURL) {
            // update profile 
            await updateProfile(user, {
              photoURL: downloadURL
            });

            
            console.log('user', user.uid);

            // database
           await update(refFromDatabase(database, `users/${user.uid}`), {
              image: downloadURL
            });
            
            // Update user in redux
            dispatch(setPhotoURL(downloadURL));
          }
        }
      )
    } catch (e) {
      console.log('Get file path failed', e);
    }

    console.log('file', file);
  };

  return (
    <div>
      <h3 style={{ color: 'white' }}>
        <IoIosChatboxes />{" "} Chat App
      </h3>

      <div style={{ 
        display: 'flex',
        marginBottom: '1rem'
      }}>

      <Image src={user && user.photoURL} 
             style={{ width: '30px', height: '30px', marginTop: '3px' }} 
             roundedCircle />

      <Dropdown>
        <Dropdown.Toggle
          style={{ background: 'transparent', border: '0px' }}
          id="dropdown-basic">
          {user && user.displayName}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleOpenImageRef}>
            Profile picture change
          </Dropdown.Item>
          <Dropdown.Item onClick={handelLogout}>
            Log out
            </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <input style={{ display: "none" }}
             ref={inputOpenImageRef}
             type="file"
             accept="image/jpeg, image/png"
             onChange={handleUploadImage} />

      </div>
    </div>
  )
}

export default UserPanel