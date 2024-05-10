import React, { useState, useEffect } from 'react';
import {Link, Navigate, Outlet} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import axios from 'axios';
import '../styles.css';

export default function DefaultLayout() {
  const [order, setOrder] = useState([]);
  const {user, token, setUser, setToken, notification} = useStateContext();
  const [orderCreated, setOrderCreated] = useState(false); // новое состояние
  let admin_dash = user.role === 'admin' ? <Link to="/dashboard">Панель управления</Link> : ""
  let admin = user.role === 'admin' ? <Link to='/users'>Пользователи</Link> : ""
  let userLinkOrder = user.role === 'user' ? <Link to="/order">Заказы</Link> : ""
  useEffect(() => {
    if (token) {
      axiosClient.get('/user')
        .then(({data}) => {
           setUser(data)
        })
    }
  }, [token]) 

  if (!token) {
    return <Navigate to="/login"/>
  }

  const getOrder = () => {
    axios.get('http://127.0.0.1:8000/api/order')
      .then((response) => {
        const orders = response.data.data;
        const userOrder = orders.find(order => order.customer_id === user.id);
        setOrder(orders)
      })
      .catch(() => {
      })
  }

  const onLogout = ev => {
    ev.preventDefault()

    axiosClient.post('/logout')
      .then(() => {
        setUser({})
        setToken(null)
      })
  }

  const createOrder = () => {
    axiosClient.post('http://127.0.0.1:8000/api/order', {
        "customer_id": user.id,
        "status": "активный",
        "total": 0,
        "payment_type": "Не выбран"
    })
    .then((response_last) => {
      const orderId = response_last.data.data.id;
      axios.get('http://127.0.0.1:8000/api/order')
      .then((response) => {
          const orders = response.data.data;
          orders.forEach((order) => {
              if (order.status === 'активный' && order.id !== orderId) {
                  axios.put(`http://127.0.0.1:8000/api/order/${order.id}`, {
                      "status": "не активный"
                  })
                  .then((response) => {
                      console.log(`Статус заказа ${order.id} успешно изменен на "не активный"`);
                      getOrder();
                  })
                  .catch((error) => {
                      console.error('Произошла ошибка при изменении статуса заказа', error);
                  });
              }
          });
      })
      .catch((error) => {
          console.error('Произошла ошибка при получении заказов', error);
      });
        setOrderCreated(true); 
    })
    .catch((error) => {

    });
  }
  let userLinkCreateOrder = user.role === 'user' ? <Link to="/product" onClick={createOrder}>Создать новый заказ</Link> : ""
  return (
    <div id="defaultLayout">
      <nav><aside>
        {admin_dash}
        {admin}
        <Link to="/product">Продукты</Link>
        {userLinkOrder}
        {userLinkCreateOrder}
      </aside>
      </nav>
      <div className="content">
        <header>
          <div>
            {user.name} &nbsp; &nbsp;
            <a onClick={onLogout} className="btn-logout" href="#">Выйти</a>
          </div>
        </header>
        <main>
          <Outlet/>
        </main>
        {notification &&
          <div className="notification">
            {notification}
          </div>
        }
      </div>
    </div>
  )
}