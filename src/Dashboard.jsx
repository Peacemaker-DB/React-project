import React, { useState, useEffect } from 'react';
import { useStateContext } from "./context/ContextProvider";
import axios from 'axios';
import Modal from 'react-modal';
import axiosClient from "./axios-client.js";
import './styles.css';

Modal.setAppElement('#root')

function Dashboard() {
    const [order, setOrder] = useState([]);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const { user } = useStateContext();

    useEffect(() => {
        getOrder();
        getUsers();
    }, [])

    const getOrder = () => {
        axios.get('http://127.0.0.1:8000/api/order')
            .then((response) => {
                const orders = response.data.data;
                const userOrder = orders.find(order => order.customer_id === user.id);
                setOrder(orders)
            })
            .catch(() => { })
    }

    const getUsers = () => {
        setLoading(true)
        axiosClient.get('/users')
            .then(({ data }) => {
                setLoading(false)
                setUsers(data.data)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleDelete = (orderId) => {
        axios.delete(`http://127.0.0.1:8000/api/order/${orderId}`)
            .then((response) => {
                getOrder();
            })
            .catch(() => { })
    }

    const handleDeliver = (orderId) => {
        axios.get(`http://127.0.0.1:8000/api/order/${orderId}`)
            .then((response) => {
                const order = response.data;
                if (order.status === 'подтвержденный') {
                    axios.put(`http://127.0.0.1:8000/api/order/${orderId}`, {
                        "status": "доставляется"
                    })
                        .then((response) => {
                            console.log('Статус заказа успешно изменен на "активный"');
                            getOrder();
                        })
                        .catch((error) => {
                            console.error('Произошла ошибка при изменении статуса заказа', error);
                        });
                }
            })
            .catch((error) => {
                console.error('Произошла ошибка при получении заказа', error);
            });
    }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Имя пользователя</th>
                        <th>Адрес</th>
                        <th>Email</th>
                        <th>Стоимость заказа</th>
                        <th>Статус заказа</th>
                        <th>Способ оплаты</th>
                        <th>Дата создания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => {
                        const userOrders = order.filter(o => o.customer_id === u.id);
                        return userOrders.map(userOrder => (
                            <tr key={userOrder.id}>
                                <td>{u.name}</td>
                                <td>{u.address}</td>
                                <td>{u.email}</td>
                                <td>{userOrder.total}</td>
                                <td>{userOrder.status}</td>
                                <td>{userOrder.payment_type}</td>
                                <td>{userOrder.created_at}</td>
                                <td>
                                    <button onClick={() => handleDelete(userOrder.id)}>Удалить</button>
                                    <button onClick={() => handleDeliver(userOrder.id)}>Одобрить</button>
                                </td>
                            </tr>
                        ));
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Dashboard