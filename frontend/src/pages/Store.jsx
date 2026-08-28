import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Store.css";

const Store = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const products = [
    {
      id: 1,
      name: "Training Bag",
      category: "Accessories",
      price: 2499,
      oldPrice: 2999,
      rating: 4.7,
      description: "Water-resistant everyday training bag.",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 2,
      name: "Training Shoes",
      category: "Fitness",
      price: 3499,
      oldPrice: 4299,
      rating: 4.6,
      description: "Lightweight shoes for training and everyday wear.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 3,
      name: "Smart Watch",
      category: "Electronics",
      price: 4499,
      oldPrice: 5299,
      rating: 4.6,
      description: "Activity and workout tracking for everyday use.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 4,
      name: "Whey Protein",
      category: "Nutrition",
      price: 3199,
      oldPrice: 3699,
      rating: 4.8,
      description: "High-protein whey isolate for sports nutrition.",
      image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 5,
      name: "Wireless Headphones",
      category: "Electronics",
      price: 1999,
      oldPrice: 2499,
      rating: 4.5,
      description: "Wireless headphones with long battery life.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 6,
      name: "Steel Water Bottle",
      category: "Accessories",
      price: 999,
      oldPrice: 1299,
      rating: 4.5,
      description: "Insulated bottle for workouts and everyday travel.",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 7,
      name: "Yoga Mat",
      category: "Fitness",
      price: 1799,
      oldPrice: 2199,
      rating: 4.6,
      description: "Non-slip mat for yoga, mobility and stretching.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
    },
    {
      id: 8,
      name: "Adjustable Dumbbells",
      category: "Fitness",
      price: 4499,
      oldPrice: 5299,
      rating: 4.8,
      description: "Compact dumbbells for strength training.",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const categories = ["All", "Fitness", "Nutrition", "Electronics", "Accessories"];

  const filteredProducts = useMemo(() => {
    const text = search.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text);
      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <div className="store-page">
      <header className="main-header">
        <div className="header-content">
          <button className="logo" onClick={() => navigate("/")}>
            ResQ
          </button>

          <div className="search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
            />
            {search && <button onClick={() => setSearch("")}>×</button>}
          </div>

          <nav>
            <button className="selected">Store</button>
            <button onClick={() => navigate("/dashboard")}>Merchant</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="simple-intro">
          <div>
            <span>RESQ DEMO</span>
            <h1>Test a real payment recovery flow.</h1>
            <p>
              Choose a product and complete checkout. If the payment fails, ResQ
              steps in to keep the purchase alive.
            </p>
          </div>

          <div className="intro-status">
            <span className="status-dot" />
            <div>
              <strong>ResQ protection enabled</strong>
              <p>Razorpay Test Mode</p>
            </div>
          </div>
        </section>

        <section className="products" id="products">
          <div className="products-heading">
            <div>
              <span>DEMO PRODUCTS</span>
              <h2>Choose an item</h2>
            </div>
            <p>{filteredProducts.length} products</p>
          </div>

          <div className="categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const discount = Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100
              );

              return (
                <article className="product" key={product.id}>
                  <div className="image-wrap">
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="product-text">
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="rating">★ {product.rating}</div>

                    <div className="price">
                      <strong>
                        ₹{product.price.toLocaleString("en-IN")}
                      </strong>
                      <del>₹{product.oldPrice.toLocaleString("en-IN")}</del>
                      <span>{discount}% off</span>
                    </div>

                    <button
                      className="buy"
                      onClick={() =>
                        navigate("/checkout", { state: { product } })
                      }
                    >
                      Buy now
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer>
        <strong>ResQ</strong>
        <span>Payment recovery demo powered by Razorpay Test Mode</span>
      </footer>
    </div>
  );
};

export default Store;