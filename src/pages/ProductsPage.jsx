import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5";
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
              "X-Auth": authString, // Строка в заголовке
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

        // Второй запрос о товарах
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
      } catch (error) {
        // При ошибки в ответе API
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          console.error("API Error:", error.response.data.error);
          // Повторяем запрос
          fetchProducts();
        } else {
          setError(error.message);
          setLoading(false);
        }
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

  //пагинция
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // пагинция
  const goToNextPage = () => {
    if (indexOfLastProduct < products.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    //  localStorage
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
      {/* пагинация */}
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
