import React, { useState, useEffect } from "react";
import axios from "axios";
import md5 from "md5";

export const ProductsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const timestamp = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, ""); // таймштамп
        const password = "Valantis"; // пароль
        const authString = md5(`${password}_${timestamp}`); // инициируем строку авторизации

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
              "X-Auth": authString, // передача строки в заголовке
            },
          }
        );

        if (!response.data.result) {
          throw new Error("Failed to fetch product IDs");
        }

        // Удаление повторяющихся productIds как в тз
        const productIds = [...new Set(response.data.result)];

        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Второй запрос для получения информации
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
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  // Расчет индексов
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const goToPrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(products.length / productsPerPage))
    );
  };

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
   
      <div>
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Предыдущая страница
        </button>
        <button
          onClick={goToNextPage}
          disabled={
            currentPage === Math.ceil(products.length / productsPerPage)
          }
        >
          Следующая страница
        </button>
      </div>
    </div>
  );
};
