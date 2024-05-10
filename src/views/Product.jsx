import React, { useState, useEffect } from 'react';
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider";
import axios from 'axios';
import '../styles.css';
function ProductTable() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const {user} = useStateContext();
    const [currentOrder, setCurrentOrder] = useState([]);
    const [currentOrderItem, setCurrentOrderItem] = useState([]);
    const [message, setMessage] = useState(null)
    const {setNotification} = useStateContext()
    let isAdmin = user.role === 'admin' ? true : false;
    let admin_pr_add = user.role === 'admin' ? <Link className="btn-add" to="/product/new">Добавить новый продукт</Link> : ""
    useEffect(() => {
        getProduct();
      }, [])

      const getCurrentOrder = () => {
        axios.get('http://127.0.0.1:8000/api/order')
        .then((response) => {
            const orders = response.data.data;
            const userOrder = orders.find(order => order.customer_id === user.id && order.status === "активный");
            setCurrentOrder(userOrder);
        })
        .catch((error) => {
          
        });
    }

    useEffect(() => {
        getCurrentOrderItem(); 
    }, []);

    const getCurrentOrderItem = (productId) => {
        axios.get('http://127.0.0.1:8000/api/orderitems')
        .then((response) => {
            const ordersitems = response.data.data;
            const userOrder = ordersitems.find(ordersitem => ordersitem.order_id === currentOrder.id && ordersitem.product_id === productId);
            setCurrentOrderItem(userOrder); 
        })
        .catch((error) => {

        });
    }
    
    useEffect(() => {
        getCurrentOrder();
    }, []);

      const getProduct = () => {
        axios.get('http://127.0.0.1:8000/api/products')
          .then(({ data }) => {
            setLoading(false)
            setProducts(data.data)
          })
          .catch(() => {
          })
      }

      const handleAdd = (productId) => {
        const quantity = prompt("Введите количество добавляемого товара:");
        getCurrentOrder(); 
        if(currentOrder){
        const orderId = currentOrder.id;
        axios.post('http://127.0.0.1:8000/api/orderitems/', {
            "order_id": orderId,
            "product_id": productId,
            "item_quantity": quantity
        })
        .then((response) => {
            alert(response.data);
        })
        .catch((error) => {
            
        });} else {
            alert("У вас нет активного заказа");
        }
      }


      const handleRemove = (productId) => {
    const quantity = prompt("Введите количество убираемого товара:");
    getCurrentOrderItem(productId); 
    const orderId = currentOrderItem.id; 
    const quantity_new = currentOrderItem.item_quantity - quantity
    axios.put(`http://127.0.0.1:8000/api/orderitems/${orderId}`, {
        "item_quantity": quantity_new
    })
    .then((response) => {
       
    })
    .catch((error) => {
    });
}

const onDeleteClick = product => {
    if (!window.confirm("Вы уверены, что хотите удалить этот продукт?")) {
      return
    }
    console.log(product);
    axios.delete(`http://127.0.0.1:8000/api/products/${product.id}`)
      .then(() => {
        setNotification('Продукт был успешно удален')
        getProduct()
      })
  }
    return (
        <table>
            <thead>
              {admin_pr_add}
                <tr>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Цена</th>
                    <th></th>
                    <th>Действия</th>
                    
                </tr>
            </thead>
            <tbody>
                
    {products.map((item) => (
        <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>{item.price}</td>
            <td>
            <img src={`http://127.0.0.1:8000/${item.image}`} style={{width: "100px", height:"100px"}} alt="Img" />
            </td>
            <td>
            {isAdmin ? (
                <>
                    <Link className="btn-edit" to={'/product/' + item.id}>Изменить</Link>
                    &nbsp;
                    <button className="btn-delete" onClick={ev => onDeleteClick(item)}>Удалить</button>
                </>
            ) : (
                <>
                    <button onClick={() => handleAdd(item.id)}>Добавить</button>
                    <button onClick={() => handleRemove(item.id)}>Убрать</button>
                </>
            )}
        </td>
        </tr>
        
    ))}
    
</tbody>
        </table>
        
    );
}

export default ProductTable;