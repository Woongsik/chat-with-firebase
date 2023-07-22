import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; 

import { setUser } from '../../redux/actions/user_actions';

import "./LoginPage.css";

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  let dispatch = useDispatch();

  //States
  const [errorFromSubmit, setErrorFromSubmit] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const signInResult = await signInWithEmailAndPassword(auth, data.email, data.password)
      console.log('Signin result', signInResult);

      if (signInResult) {
        navigate("/");
        dispatch(setUser(signInResult.user));
      }

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
      <h1 className='title'>Login</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email"
                        placeholder="Enter email"
                        {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
          {errors.email && <span className='error-text'>This email field is required</span>}
        </Form.Group>
  
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" 
                        placeholder="Password"
                        {...register("password", { required: true, minLength: 6 })} />
          {errors.password && errors.password.type === "required" && <span className='error-text'>This password field is required</span>}
          {errors.password && errors.password.type === "minLength" && <span className='error-text'>Password must have at least 6 characters</span>}          
        </Form.Group>

        {errorFromSubmit &&  <span className='error-text'>{ errorFromSubmit }</span>}
        
        <Button variant="primary" type="submit" className='submitButton mt-3 mb-3' disabled={loading}>
          Submit
        </Button>
      </Form>

      <div className='no-account-container'>
        <Link to="/register">If you don't have the account!</Link>
      </div>
    </Container>
  )
}

export default LoginPage