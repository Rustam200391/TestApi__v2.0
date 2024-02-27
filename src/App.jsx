import "./App.css";
import { ProductsPage } from "./pages/ProductsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Blog } from "./pages/Blog";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <>
      <header>
        <Link to="/">Home</Link>
        <Link to="/product">ProductsPage</Link>
        <Link to="/posts">Blog</Link>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product" element={<ProductsPage />} />
        <Route path="/posts" element={<Blog />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
