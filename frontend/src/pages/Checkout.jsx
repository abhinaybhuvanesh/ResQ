import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const product = location.state?.product || {
    name: "Whey Protein Isolate",
    price: 2500,
    oldPrice: 2999,
    image: "",
    description: "Premium fitness product",
  };

  const createdRef = useRef(false);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [paymentLink, setPaymentLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;

    const createOrder = async () => {
      try {
        setLoading(true);

        const orderResponse = await API.post("/orders/create", {
          amount: product.price,
          productName: product.name,
          merchantId: "merchant_123",
        });

        const newOrder = orderResponse.data.order;
        setOrder(newOrder);
        setStatus(newOrder.status);

        const paymentResponse = await API.post("/orders/create-payment-link", {
          orderId: newOrder._id,
          amount: product.price,
          productName: product.name,
        });

        setPaymentLink(paymentResponse.data.short_url);
      } catch (err) {
        console.error("Checkout error:", err);
        setError(
          err.response?.data?.message ||
            "We could not create your checkout. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, [product]);

  useEffect(() => {
    if (!order?._id) return;

    const fetchOrderStatus = async () => {
      try {
        const response = await API.get(`/orders/${order._id}`);
        const latestOrder = response.data;

        setOrder(latestOrder);
        setStatus(latestOrder.status);

        if (latestOrder.status === "RECOVERY_ACTIVE" && latestOrder.recoveryExpiresAt) {
          const diff = Math.floor(
            (new Date(latestOrder.recoveryExpiresAt).getTime() - Date.now()) / 1000
          );
          setTimeLeft(Math.max(diff, 0));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchOrderStatus();
    const pollingInterval = setInterval(fetchOrderStatus, 3000);
    return () => clearInterval(pollingInterval);
  }, [order?._id]);

  useEffect(() => {
    if (status !== "RECOVERY_ACTIVE") return;

    const timer = setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const openPayment = () => {
    if (!paymentLink) return;
    window.open(paymentLink, "_blank", "noopener,noreferrer");
  };

  const goBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <div className="loading-spinner" />
        <h2>Preparing checkout</h2>
        <p>Creating your secure payment session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error-page">
        <h2>Checkout unavailable</h2>
        <p>{error}</p>
        <button onClick={goBack}>Return to store</button>
      </div>
    );
  }

  const orderShortId = order?._id?.slice(-8).toUpperCase() || "--------";

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <button className="back-button" onClick={goBack}>
          ← Back to store
        </button>

        <div className="checkout-grid">
          <section className="checkout-main">
            <div className="checkout-heading">
              <p className="checkout-eyebrow">SECURE CHECKOUT</p>
              <h1>Complete your purchase</h1>
              <p>Review your order and continue to payment.</p>
            </div>

            <div className="product-summary">
              <div className="checkout-product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>R</span>
                )}
              </div>

              <div className="checkout-product-info">
                <span>ITEM</span>
                <h3>{product.name}</h3>
                <p>{product.description || "Secure purchase protected by ResQ."}</p>
              </div>

              <strong className="checkout-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </strong>
            </div>

            {status === "PENDING" && (
              <div className="payment-section">
                <div className="section-row">
                  <div>
                    <span className="section-number">1</span>
                    <strong>Payment</strong>
                  </div>
                  <span className="secure-label">Secure</span>
                </div>

                <p className="payment-description">
                  You will continue to Razorpay's secure test checkout to complete this payment.
                </p>

                <button
                  className="pay-button"
                  onClick={openPayment}
                  disabled={!paymentLink}
                >
                  Pay ₹{Number(product.price).toLocaleString("en-IN")}
                </button>

                <div className="test-payment-box">
                  <strong>Test mode</strong>
                  <span>
                    Use Razorpay test payment credentials during the demo. No real money is charged.
                  </span>
                </div>
              </div>
            )}

            {status === "RECOVERY_ACTIVE" && (
              <div className="recovery-panel">
                <div className="recovery-header">
                  <div>
                    <p className="recovery-label">RESQ RECOVERY ACTIVE</p>
                    <h2>Your purchase is still protected</h2>
                  </div>
                  <div className="countdown">{formatTime(timeLeft)}</div>
                </div>

                <p className="recovery-message">
                  The previous payment attempt was not completed. Your eligible stock and offer
                  are temporarily reserved while you try again.
                </p>

                <div className="recovery-details">
                  <div>
                    <span>Order</span>
                    <strong>Reserved</strong>
                  </div>

                  <div>
                    <span>Stock</span>
                    <strong>Temporarily held</strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>Needs action</strong>
                  </div>
                </div>

                <button className="retry-button" onClick={openPayment}>
                  Continue payment
                </button>

                <p className="recovery-footnote">
                  If the timer expires, reserved stock may be released automatically.
                </p>
              </div>
            )}

            {status === "PAID" && (
              <div className="success-panel">
                <div className="success-icon">✓</div>
                <h2>Payment confirmed</h2>
                <p>
                  Razorpay confirmed your payment and your order is ready for fulfilment.
                </p>
                <button onClick={() => navigate("/")}>Continue shopping</button>
              </div>
            )}

            {status === "PAID_AFTER_TIMEOUT" && (
              <div className="success-panel">
                <div className="success-icon">✓</div>
                <h2>Purchase recovered</h2>
                <p>
                  The payment was completed after the original recovery window and has been
                  safely reconciled.
                </p>
                <button onClick={() => navigate("/dashboard")}>View recovery</button>
              </div>
            )}

            {status === "DORMANT" && (
              <div className="dormant-panel">
                <p className="dormant-label">ORDER DORMANT</p>
                <h2>The live recovery window has ended</h2>
                <p>
                  Reserved stock has been released. The order can be revived later only after
                  availability is checked and you choose to continue.
                </p>
                <button onClick={goBack}>Return to store</button>
              </div>
            )}

            {status === "EXPIRED" && (
              <div className="expired-panel">
                <h2>Order expired</h2>
                <p>
                  This purchase can no longer be recovered. No payment has been taken.
                </p>
                <button onClick={goBack}>Shop again</button>
              </div>
            )}
          </section>

          <aside className="order-summary-card">
            <h3>Order summary</h3>

            <div className="summary-row">
              <span>Order</span>
              <strong>#{orderShortId}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span className="free-text">Free</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
            </div>

            <div className="resq-security">
              <div className="resq-mini-logo">R</div>
              <div>
                <strong>Protected by ResQ</strong>
                <p>Secure payment recovery with verified order state.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;