import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5"; // Импортируем библиотеку для вычисления MD5

const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const timestamp = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, ""); // Генерация таймштампа
        const password = "Valantis"; //  пароль
        const authString = md5(`${password}_${timestamp}`); // Формирование строки авторизации

        const response = await axios.post(
          "http://api.valantis.store:40000/",
          {
            action: "get_ids",
            params: {
              offset: 0,
              limit: 10,
            },
          },
          {
            headers: {
              "X-Auth": authString, // Передача авторизационной строки в заголовке
            },
          }
        );

        if (!response.data.result) {
          throw new Error("Failed to fetch product IDs");
        }

        const productIds = response.data.result;

        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // выполняем запрос для получения подробной информации о товарах, используя productIds

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;
