import { useCart } from "../context/CartContext";

const BASE_URL = "http://127.0.0.1:8000";

function Cart() {
  const { cart, addToCart, removeFromCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Cart</h2>

      {cart.length > 0 && (
        <p>
          User: <b>{cart[0].username}</b>
        </p>
      )}

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            marginBottom: "15px",
            borderBottom: "1px solid #ddd",
            paddingBottom: "10px",
          }}
        >
          <img
            src={`${BASE_URL}${item.image}`}
            alt={item.name}
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />

          <div>
            <h4>{item.name}</h4>
            <p>₹{item.price}</p>

            <button onClick={() => removeFromCart(item.product_id)}>-</button>
            <span style={{ margin: "0 10px" }}>{item.quantity}</span>
            <button onClick={() => addToCart(item.product_id)}>+</button>
          </div>
        </div>
      ))}

      <h3>Total: ₹{total}</h3>
    </div>
  );
}

export default Cart;
