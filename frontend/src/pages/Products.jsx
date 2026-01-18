import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const BASE_URL = "http://127.0.0.1:8000"; // Backend URL

function Products() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id);
      alert("Added to cart");
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px" }}>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            width: "220px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            textAlign: "center",
          }}
        >
          <img
            src={`${BASE_URL}${p.image}`} // ✅ Fixed image URL
            alt={p.name}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
          />
          <h4>{p.name}</h4>
          <p>₹{p.price}</p>
          <button
            onClick={() => handleAddToCart(p.id)}
            style={{
              backgroundColor: "#2874f0",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}

export default Products;
