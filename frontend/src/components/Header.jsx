import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      api.get("/me")
        .then((res) => {
          setUser(res.data);
          fetchCart(); // ✅ reload cart on refresh
        })
        .catch(() => setUser(null));
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    fetchCart(); // clears cart
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#2874f0",
      color: "white",
    }}>
      <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        E-Commerce App
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/" style={{ color: "white" }}>Home</Link>
        <Link to="/products" style={{ color: "white" }}>Products</Link>
        <Link to="/cart" style={{ color: "white" }}>Cart</Link>

        {!user && (
          <>
            <Link to="/login" style={{ color: "white" }}>Login</Link>
            <Link to="/register" style={{ color: "white" }}>Register</Link>
          </>
        )}

        {user && (
          <>
            <span>Hi, <b>{user.username}</b></span>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
