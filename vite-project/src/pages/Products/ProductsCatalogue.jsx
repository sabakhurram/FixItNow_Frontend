import { useEffect, useMemo, useState } from "react";
import { Search, Sun } from "lucide-react";
import { fetchPublicProducts } from "../../api/productApi";
import { Link } from "react-router-dom";
import "./ProductsCatalogue.css";

/* Shows a neat placeholder when a product has no image or it fails to load */
function ProductImage({ src, alt }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="product-image-placeholder" aria-hidden="true">
                <Sun size={40} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="product-image"
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
        />
    );
}

function Products() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await fetchPublicProducts();

                setProducts(data);
            } catch (err) {
                console.error("Products page fetch error:", err);

                setError(
                    err.message || "Unable to load products."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                products
                    .map((product) => product.category)
                    .filter(Boolean)
            )
        ];

        return ["All", ...uniqueCategories];
    }, [products]);

    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !search ||
                product.name?.toLowerCase().includes(search) ||
                product.category?.toLowerCase().includes(search) ||
                product.description?.toLowerCase().includes(search);

            const matchesCategory =
                categoryFilter === "All" ||
                product.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    if (loading) {
        return (
            <main className="products-page" data-theme="light">
                <div className="products-catalog" aria-busy="true">
                    <p className="products-page-loading">
                        Loading products...
                    </p>

                    <div className="products-page-grid" aria-hidden="true">
                        {Array.from({ length: 8 }, (_, index) => (
                            <div
                                className="product-card product-card--skeleton"
                                key={index}
                            >
                                <div className="product-image-wrapper pskel" />
                                <div className="product-card-content">
                                    <span className="pskel pskel-line pskel-short" />
                                    <span className="pskel pskel-line pskel-title" />
                                    <span className="pskel pskel-line" />
                                    <span className="pskel pskel-line pskel-mid" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="products-page" data-theme="light">
                <div className="products-page-error">
                    {error}
                </div>
            </main>
        );
    }

    return (
        <main className="products-page" data-theme="light">

            <section className="products-page-hero">

                <div className="products-page-hero__text">

                    <p className="products-page-eyebrow">
                        OUR PRODUCTS
                    </p>

                    <h1>
                        Explore Our
                        <span> Solar Products</span>
                    </h1>

                    <p className="products-page-intro">
                        Discover reliable solar products designed to
                        deliver efficient and dependable energy solutions.
                    </p>

                    <div className="products-search">

                        <Search size={19} />

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                    </div>

                </div>

                <div
                    className="products-page-hero__visual"
                    aria-hidden="true"
                >
                    <div className="products-page-hero__chip">
                        <strong>{products.length}</strong>
                        <span>Products available</span>
                    </div>
                </div>

            </section>

            <section className="products-catalog">

                <div className="products-toolbar">

                    <div className="products-categories">

                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                className={
                                    categoryFilter === category
                                        ? "category-btn active"
                                        : "category-btn"
                                }
                                onClick={() =>
                                    setCategoryFilter(category)
                                }
                            >
                                {category}
                            </button>
                        ))}

                    </div>

                    <p className="products-count" aria-live="polite">
                        Showing <strong>{filteredProducts.length}</strong> of{" "}
                        {products.length} products
                    </p>

                </div>

                {filteredProducts.length === 0 ? (
                    <div className="products-empty">
                        <h3>No products found</h3>

                        <p>
                            Try changing your search or category filter.
                        </p>
                    </div>
                ) : (
                    <div className="products-page-grid">

                        {filteredProducts.map((product) => {
                            const inStock = Number(product.stock) > 0;

                            return (
                            <article
                                className="product-card"
                                key={product.id}
                            >

                                <div className="product-image-wrapper">

                                    <ProductImage
                                        src={product.image}
                                        alt={product.name}
                                    />

                                </div>

                                <div className="product-card-content">

                                    <p className="product-category">
                                        {product.category}
                                    </p>

                                    <h2>
                                        {product.name}
                                    </h2>

                                    {product.description && (
                                        <p className="product-description">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="product-card-bottom">

                                        <span className="product-price">
                                            Rs.{" "}
                                            {Number(
                                                product.price
                                            ).toLocaleString()}
                                        </span>

                                        <span
                                            className={`product-stock ${
                                                inStock ? "is-in" : "is-out"
                                            }`}
                                        >
                                            {inStock
                                                ? "Available"
                                                : "Out of Stock"}
                                        </span>

                                    </div>

                                   <Link
    to={`/products/${product.id}`}
    className="product-details-btn"
>
    View Details
</Link>

                                </div>

                            </article>
                            );
                        })}

                    </div>
                )}

            </section>

        </main>
    );
}

export default Products;