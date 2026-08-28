import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await API.get("/orders");
      setOrders(response.data.orders || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load merchant data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const recovered = orders.filter(
      (order) =>
        order.status === "PAID_AFTER_TIMEOUT" ||
        (order.status === "PAID" && order.recoveryExpiresAt)
    );

    return {
      revenue: recovered.reduce(
        (total, order) => total + Number(order.amount || 0),
        0
      ),
      recovered: recovered.length,
      active: orders.filter(
        (order) => order.status === "RECOVERY_ACTIVE"
      ).length,
      dormant: orders.filter(
        (order) => order.status === "DORMANT"
      ).length,
      paid: orders.filter(
        (order) =>
          order.status === "PAID" ||
          order.status === "PAID_AFTER_TIMEOUT"
      ).length,
    };
  }, [orders]);

  const statusName = (status) =>
    String(status || "PENDING")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const statusClass = (status) => {
    if (status === "PAID") return "dash-status paid";
    if (status === "PAID_AFTER_TIMEOUT") return "dash-status recovered";
    if (status === "RECOVERY_ACTIVE") return "dash-status active";
    if (status === "DORMANT") return "dash-status dormant";
    if (status === "EXPIRED") return "dash-status expired";
    return "dash-status pending";
  };

  const dateText = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading merchant activity...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <button
            className="dashboard-logo"
            onClick={() => navigate("/")}
          >
            ResQ
          </button>

          <span>Merchant Console</span>

          <nav>
            <button onClick={() => navigate("/")}>
              Demo Store
            </button>

            <button className="dash-nav-active">
              Merchant
            </button>
          </nav>
        </div>
      </header>

      <main className="dashboard-container">
        <div className="dashboard-title">
          <div>
            <span>MERCHANT OVERVIEW</span>
            <h1>Revenue recovery</h1>
            <p>
              Payment recovery activity verified through
              order state and Razorpay events.
            </p>
          </div>

          <button onClick={fetchOrders}>
            Refresh
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="metric-row">
          <div>
            <span>Verified recovered</span>
            <strong>
              ₹{metrics.revenue.toLocaleString("en-IN")}
            </strong>
            <small>
              {metrics.recovered} recovered orders
            </small>
          </div>

          <div>
            <span>Recovery active</span>
            <strong>{metrics.active}</strong>
            <small>Live recovery windows</small>
          </div>

          <div>
            <span>Dormant</span>
            <strong>{metrics.dormant}</strong>
            <small>Waiting for revival</small>
          </div>

          <div>
            <span>Paid</span>
            <strong>{metrics.paid}</strong>
            <small>Confirmed payments</small>
          </div>
        </section>

        <section className="orders-section">
          <div className="orders-heading">
            <div>
              <span>ORDER ACTIVITY</span>
              <h2>Recent orders</h2>
            </div>

            <p>{orders.length} total</p>
          </div>

          {orders.length === 0 ? (
            <div className="dashboard-empty">
              <h3>No orders yet</h3>
              <p>Run a test checkout from the demo store.</p>
              <button onClick={() => navigate("/")}>
                Open demo store
              </button>
            </div>
          ) : (
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="dashboard-order-id">
                        #{order._id?.slice(-7).toUpperCase()}
                      </td>

                      <td>
                        <strong>
                          {order.productName || "Unknown product"}
                        </strong>
                      </td>

                      <td>
                        ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span className={statusClass(order.status)}>
                          {statusName(order.status)}
                        </span>
                      </td>

                      <td className="dashboard-payment-id">
                        {order.paymentId
                          ? order.paymentId.slice(-10)
                          : "—"}
                      </td>

                      <td>
                        {dateText(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-note">
          <strong>Verified revenue only</strong>
          <p>
            ResQ does not count every successful purchase
            as recovered revenue. Revenue appears here only
            when a purchase entered the recovery journey
            and later completed successfully.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;