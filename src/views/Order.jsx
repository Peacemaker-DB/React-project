import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider";
import axios from 'axios';
import Modal from 'react-modal';
import '../styles.css';
Modal.setAppElement('#root')

function OrderTable() {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const {user} = useStateContext();
  const [modalIsOpen, setModalIsOpen] = useState(false); 
  const [selectedOrderId, setSelectedOrderId] = useState(null); 
  const [selectedPay, setSelectedPay] = useState(null); 
    
    useEffect(() => {
        getOrder();
      }, [])

      const getOrder = () => {
        axios.get('http://127.0.0.1:8000/api/order')
          .then((response) => {
            const orders = response.data.data;
            const userOrder = orders.filter(order => order.customer_id === user.id);
            console.log(userOrder)
            setOrder(userOrder)
          })
          .catch(() => {
          })
      }

      const handleDelete= (orderId) => {
        axios.delete(`http://127.0.0.1:8000/api/order/${orderId}`)
          .then((response) => {
            getOrder();
          })
          .catch(() => {

          })
      }
      
      const handleModalClose = () => {
        
        console.log(selectedPay);
        axios.put(`http://127.0.0.1:8000/api/order/${selectedOrderId}`, {
            "payment_type": selectedPay
        })
        .then((response) => {
          getOrder();
        })
        .catch((error) => {
        });
    }
    const handleChangePayment = (orderId) => {
      setSelectedOrderId(orderId);
      setModalIsOpen(true);
  }
  const handleConfirm = (orderId) => {
    axios.get(`http://127.0.0.1:8000/api/order/${orderId}`)
    .then((response) => {
        const order = response.data;
        if (order.total > 0 && order.status !== 'доставляется') {
            axios.put(`http://127.0.0.1:8000/api/order/${orderId}`, {
                "status": "подтвержденный"
            })
            .then((response) => {
               // console.log('Статус заказа успешно изменен на "подтвержденный"');
                getOrder();
            })
            .catch((error) => {
               // console.error('Произошла ошибка при изменении статуса заказа', error);
            });
        } else {
          if(order.total === 0){
          alert('Заказ не может быть подтвержден, так как у него нет стоимости');}
        }
    })
    .catch((error) => {
      //  console.error('Произошла ошибка при получении заказа', error);
    });
}

      const handleActivate = (orderId) => {
        axios.get(`http://127.0.0.1:8000/api/order/${orderId}`)
        .then((response) => {
            const order = response.data;
            if (order.status !== 'подтвержденный' && order.status !== 'доставляется') {
                axios.put(`http://127.0.0.1:8000/api/order/${orderId}`, {
                    "status": "активный"
                })
                .then((response) => {
                  //  console.log('Статус заказа успешно изменен на "активный"');
                    axios.get('http://127.0.0.1:8000/api/order')
                    .then((response) => {
                        const orders = response.data.data;
                        orders.forEach((order) => {
                            if (order.status === 'активный' && order.id !== orderId) {
                                axios.put(`http://127.0.0.1:8000/api/order/${order.id}`, {
                                    "status": "не активный"
                                })
                                .then((response) => {
                                  //  console.log(`Статус заказа ${order.id} успешно изменен на "не активный"`);
                                    getOrder();
                                })
                                .catch((error) => {
                                  //  console.error('Произошла ошибка при изменении статуса заказа', error);
                                });
                            }
                        });
                    })
                    .catch((error) => {
               //         console.error('Произошла ошибка при получении заказов', error);
                    });
                })
                .catch((error) => {
       //             console.error('Произошла ошибка при изменении статуса заказа', error);
                });
            }
        })
        .catch((error) => {
  //          console.error('Произошла ошибка при получении заказа', error);
        });
    }
      return (
        <div>
        <table>
            <thead>
                <tr>
                    <th>Стоимость</th>
                    <th>Статус</th>
                    <th>Способ оплаты</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                {order.map((item) => (
                <tr key={item.id}>
            <td>{item.total}</td>
            <td>{item.status}</td>
            <td>{item.payment_type}</td>
            <td>
                <button onClick={() => handleChangePayment(item.id)}>Изменить оплату</button>
                <button onClick={() => handleConfirm(item.id)}>Подтвердить</button>
                <button onClick={() => handleActivate(item.id)}>Активировать</button>
                <button onClick={() => handleDelete(item.id)}>Удалить</button>
            </td>
        </tr>
    ))}
</tbody>
        </table>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleModalClose}
        contentLabel="Выбор способа оплаты">
        <h2>Выберите способ оплаты</h2>
        <button onClick={() => setSelectedPay('Картой')}>Оплата КАРТОЙ при доставки</button>
        <button onClick={() => setSelectedPay('Наличными')}>Оплата НАЛИЧНЫМИ при доставки</button>
        <button onClick={() =>  handleModalClose}>Подтвердить</button>
        <button onClick={() =>  setModalIsOpen(false)}>Закрыть</button>
    </Modal> 
    </div>
    );
}
export default OrderTable;
