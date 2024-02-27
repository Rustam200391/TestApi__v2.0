import React, { useState, useEffect } from "react";

export const ProductsPage = () => {
  // States for storing download information
  const [loading, setLoading] = useState(true); // Флаг загрузки
  const [error, setError] = useState(null); // Сообщение об ошибке
  const [products, setProducts] = useState([]); // Список товаров

  useEffect(() => {
    // Function for loading products
    const fetchProducts = async () => {
      try {
        // API request
        const response = await fetch(
          "http://api.valantis.store:41000/products"
        );
        // request success rate
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // useEffect is called only once

  // If the data is being loaded, we display a message about loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // If uploaded successfully, we display the list of products
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
