import "./App.css";
import { ProductsPage } from "./pages/ProductsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <>
      <header>
        <Link to="/">Home</Link>
        <Link to="/product">ProductsPage</Link>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
