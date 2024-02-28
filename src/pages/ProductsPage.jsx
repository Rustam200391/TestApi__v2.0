import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5"; // Импортируем библиотеку для вычисления MD5

export const ProductsPage = () => {
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
        const password = "Valantis"; // пароль
        const authString = md5(`${password}_${timestamp}`); // Формирование строки авторизации

        // Первый запрос для получения списка идентификаторов товаров
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

        // Удаление повторяющихся productIds
        const productIds = [...new Set(response.data.result)];

        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Второй запрос для получения информации о товарах
        const secondResponse = await axios.post(
          "http://api.valantis.store:40000/",
          {
            action: "get_items",
            params: { ids: productIds },
          },
          {
            headers: {
              "X-Auth": authString,
            },
          }
        );

        if (!secondResponse.data.result) {
          throw new Error("Failed to fetch product details");
        }

        const detailedProducts = secondResponse.data.result;
        console.log(secondResponse.data.result);

        // Обновление products
        setProducts(detailedProducts);
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
        {products.map((product, index) => (
          <li key={`${product.id}_${index}`}>
            <h2>{product.product}</h2>
            {product?.brand && <p>Brand: {product.brand}</p>}
            <p>Price:{product.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
