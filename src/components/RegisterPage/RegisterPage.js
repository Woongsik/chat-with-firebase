import React, { useRef, useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import md5 from 'md5';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from "firebase/database";
import { auth, database } from '../../firebase';
import "./RegisterPage.css";

function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [errorFromSubmit, setErrorFromSubmit] = useState('');
  const [loading, setLoading] = useState(false);

  const password = useRef();
  password.current = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let createdUser = await createUserWithEmailAndPassword(auth, data.email, data.password);
      console.log('Created user', createdUser);

      // update profile 
      await updateProfile(createdUser.user, {
        displayName: data.name,
        photoURL: `https://www.gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
      });
      
      // database
      await set(ref(database, `users/${createdUser.user.uid}`), {
        name: createdUser.user.displayName,
        image: createdUser.user.photoURL
      })
      
      setLoading(false);
    } catch(e) {
      console.log('Submit error', e);

      setLoading(false);
      setErrorFromSubmit(e.message);

      setTimeout(() => {
        setErrorFromSubmit('');
      }, 5000);
    }
    
  }

  return (
    <Container className='form-container'>
      <h1 className='title'>Register</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email"
                        placeholder="Enter email"
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
          {errors.email && <span className='error-text'>This email field is required</span>}
        </Form.Group>
        

        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" 
                        placeholder="Name"
                        {...register("name", { required: true, maxLength: 10 })} />
          {errors.name && errors.name.type === "required" && <span className='error-text'>This name field is required</span>}
          {errors.name && errors.name.type === "maxLength" && <span className='error-text'>Your input exceed maxium length 10</span>}
        
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" 
                        placeholder="Password"
                        {...register("password", { required: true, minLength: 6 })} />
          {errors.password && errors.password.type === "required" && <span className='error-text'>This password field is required</span>}
          {errors.password && errors.password.type === "minLength" && <span className='error-text'>Password must have at least 6 characters</span>}          
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password confirm</Form.Label>
          <Form.Control type="password"
                        placeholder="PasswordConfirm"
                        {...register("password_confirm", { required: true, validate: (value) => value === password.current })} />

          {errors.password_confirm && errors.password_confirm.type === "required" && <span className='error-text'>This password confirm field is required</span>}
          {errors.password_confirm && errors.password_confirm.type === "validate" && <span className='error-text'>This password do match</span>}
          
        </Form.Group>

        {errorFromSubmit &&  <span className='error-text'>{ errorFromSubmit }</span>}
        
        <Button variant="primary" type="submit" className='submitButton mt-3 mb-3' disabled={loading}>
          Submit
        </Button>
      </Form>

      <div className='already-have-account-container'> 
        <Link to="/login">If you have the account already...</Link>
      </div>
    </Container>
  )
}

export default RegisterPage