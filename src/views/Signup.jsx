import {Link} from "react-router-dom";
import {createRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import '../styles.css';
export default function Signup() {
  const nameRef = createRef()
  const addressRef = createRef()
  const emailRef = createRef()
  const passwordRef = createRef()
  const passwordConfirmationRef = createRef()
  const {setUser, setToken} = useStateContext()
  const [errors, setErrors] = useState(null)

  const onSubmit = ev => {
    ev.preventDefault()

    const payload = {
      name: nameRef.current.value,
      address: addressRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
    }
    axiosClient.post('/signup', payload)
      .then(({data}) => {
        console.log(data);
        console.log(data.user);
        console.log(data.access_token);
        setUser(data.user)
        setToken(data.access_token);
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors)
        }
      })
  }

  return (
    <div className="login-signup-form animated fadeInDown">
      <div className="form">
        <form onSubmit={onSubmit}>
          <h1 className="title">Зарегистрируйтесь</h1>
          {errors &&
            <div className="alert">
              {Object.keys(errors).map(key => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          }
          <input ref={nameRef} type="text" placeholder="Имя"/>
          <input ref={addressRef} type="text" placeholder="Адрес"/>
          <input ref={emailRef} type="email" placeholder="Email"/>
          <input ref={passwordRef} type="password" placeholder="Пароль"/>
          <input ref={passwordConfirmationRef} type="password" placeholder="Потверждение пароля"/>
          <button className="btn btn-block">Регистрация</button>
          <p className="message">Вы уже зарегистрированы? <Link to="/login">Войти</Link></p>
        </form>
      </div>
    </div>
  )
}