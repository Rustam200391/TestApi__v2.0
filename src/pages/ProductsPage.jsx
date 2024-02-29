import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5"; //

export const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem("currentPage")) || 1;
  });
  const [productsPerPage] = useState(50);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const timestamp = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const password = "Valantis"; // пароль
        const authString = md5(`${password}_${timestamp}`);

        // Первый запрос
        const response = await axios.post(
          "http://api.valantis.store:40000/",
          {
            action: "get_ids",
            params: {
              offset: (currentPage - 1) * productsPerPage,
              limit: productsPerPage,
            },
          },
          {
            headers: {
              "X-Auth": authString,
            },
          }
        );

        if (!response.data.result) {
          throw new Error("Failed to fetch product IDs");
        }

        const productIds = [...new Set(response.data.result)];

        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Второй запрос для получения
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

        // Обновление products
        setProducts(detailedProducts);
        setLoading(false);
      } catch (data) {
        console.error("API Error ID:", data.response?.data);
        setError(data.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Функция для перехода на предыдущую страницу
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Функция для перехода на следующую страницу
  const goToNextPage = () => {
    if (indexOfLastProduct < products.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    // Сохраняем currentPage в localStorage
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products:</h1>
      <ol>
        {currentProducts.map((product, index) => (
          <li key={`${product.id}_${index}`}>
            {/* отрисовываем с проверкой, если нуль то не выводим */}
            {product?.product && <h2>{product.product}</h2>}
            {product?.brand && <p>Brand: {product.brand}</p>}
            {product?.price && <p>Price: {product.price}</p>}
          </li>
        ))}
      </ol>
      {/* Кнопки для перехода между страницами */}
      <div>
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Предыдущая страница
        </button>
        <button
          onClick={goToNextPage}
          disabled={indexOfLastProduct >= products.length}
        >
          Следующая страница
        </button>
      </div>
    </div>
  );
};
