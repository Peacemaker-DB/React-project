import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from 'react';
import axios from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import '../styles.css';
function ProductForm() {
    const navigate = useNavigate();
    let {id} = useParams();
    const [product, setProducts] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  })
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState(null)
    const [loading, setLoading] = useState(false)
    const {setNotification} = useStateContext()
    
        useEffect(() => {
            if (id) {
              setLoading(true)
              axios.get(`http://127.0.0.1:8000/api/products/${id}`)
                .then(({data}) => {
                  setLoading(false)
                  setProducts(data)
                })
                .catch(() => {
                  setLoading(false)
                })
            }
          }, [id])

          const onSubmit = ev => {
            ev.preventDefault()
            const formData = new FormData();
            formData.append('name', product.name);
            formData.append('description', product.description);
            formData.append('price', product.price);
            formData.append('stock', product.stock);
            if (image) {
              formData.append('image', image, image.name);
            }
          let object = {};
          formData.forEach(function(value, key){
            object[key] = value;
          });
          let json = JSON.stringify(object);
          console.log(json);
            if (product.id) {
              axios.put(`http://127.0.0.1:8000/api/products/${product.id}`, json, {
                headers: {
                    'Content-Type': 'application/json'
                }})
                .then(() => {
                  setNotification('Продукт был успешно обновлена')
                  navigate('/product')
                })
                .catch(err => {
                  const response = err.response;
                  if (response && response.status === 422) {
                    setErrors(response.data.errors)
                  }
                })
            } else {
              axios.post('http://127.0.0.1:8000/api/products', formData)
                .then(() => {
                  setNotification('Продукт был успешно создан')
                  navigate('/product')
                })
                .catch(err => {
                  const response = err.response;
                  if (response && response.status === 422) {
                    setErrors(response.data.errors)
                  }
                })
            }
          }

    return (
        <>
        {product.id && <h1>Update Product: {product.name}</h1>}
        {!product.id && <h1>New Product</h1>}
        <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit}>
            <input  type="text" value={product.name} onChange={ev => setProducts({...product, name: ev.target.value})} placeholder="Название"/>
            <input type="text" value={product.description} onChange={ev => setProducts({...product, description: ev.target.value})} placeholder="Описание"/>
            <input value={product.price} onChange={ev => setProducts({...product, price: ev.target.value})} placeholder="Цена"/>
            <input value={product.stock} onChange={ev => setProducts({...product, stock: ev.target.value})} placeholder="Склад"/>
            <input type="file" onChange={e => setImage(e.target.files[0])}/>
            <button className="btn">Сохранить</button>
          </form>
        )}
</div>
    </>
    )

}

export default ProductForm