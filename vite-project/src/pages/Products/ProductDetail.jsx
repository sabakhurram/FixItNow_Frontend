import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowUpRight,
    ShoppingCart,
    Zap,
    Package,
    Tag,
    CheckCircle2,
    Sun
} from "lucide-react";

import { fetchPublicProductById, fetchPublicProducts } from "../../api/productApi";
import { getProductReviews, submitReview } from "../../api/reviewApi";
import { useAuth } from "../../contexts/AuthContext";
import "./ProductDetail.css";
import { useCart } from "../../contexts/CartContext";
import Footer from "../../components/layout/Footer/Footer";
const MAX_RELATED = 4;

/* Shows a neat placeholder when a product has no image or it fails to load */
function SafeImage({ src, alt, iconSize = 56 }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="safe-image-placeholder" aria-hidden="true">
                <Sun size={iconSize} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
        />
    );
}

function ProductDetail() {
    const { currentUser, userLoggedIn } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const { productId } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        author_name: currentUser?.displayName || "",
        rating: 5,
        comment: ""
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Used for the "Similar Products" row
    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        if (currentUser?.displayName && !reviewForm.author_name) {
            setReviewForm(prev => ({ ...prev, author_name: currentUser.displayName }));
        }
    }, [currentUser]);

    // Opening another product (e.g. from Similar Products): start fresh at the top
    useEffect(() => {
        setQuantity(1);
        window.scrollTo({ top: 0 });
    }, [productId]);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const data = await getProductReviews(productId);
                setReviews(data);
            } catch (err) {
                console.error("Error loading product reviews:", err);
            }
        };
        if (productId) loadReviews();
    }, [productId]);

    useEffect(() => {
        const loadAllProducts = async () => {
            try {
                const data = await fetchPublicProducts();
                setAllProducts(data);
            } catch (err) {
                console.error("Error loading similar products:", err);
            }
        };
        loadAllProducts();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewForm.author_name || !reviewForm.comment) {
            alert("Please fill in your name and comment.");
            return;
        }
        setSubmittingReview(true);
        try {
            const newRev = await submitReview({
                ...reviewForm,
                product_id: productId,
                author_email: currentUser?.email || ""
            });
            setReviews([newRev, ...reviews]);
            setReviewForm({ author_name: currentUser?.displayName || "", rating: 5, comment: "" });
            alert("Thank you! Your review has been submitted.");
        } catch (err) {
            alert("Failed to submit review: " + err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrement = () => {
        if (product && quantity < Number(product.stock)) {
            setQuantity(quantity + 1);
        }
    };

    const handleBuyNow = () => {
        if (!userLoggedIn) {
            navigate("/signin", { state: { from: `/products/${productId}` } });
            return;
        }
        navigate("/checkout", { state: { product, quantity } });
    };
  const handleAddToCart = () => {
    if (!userLoggedIn) {
        navigate("/signin", {
            state: { from: `/products/${productId}` }
        });
        return;
    }

    addToCart(product, quantity);

    navigate("/cart");
};

    useEffect(() => {

        const loadProduct = async () => {

            try {

                setLoading(true);
                setError("");

                const data =
                    await fetchPublicProductById(productId);

                setProduct(data);

            } catch (err) {

                console.error(
                    "Product detail fetch error:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load product."
                );

            } finally {

                setLoading(false);

            }

        };

        loadProduct();

    }, [productId]);

    // Same category first, then other products to fill the row
    const related = useMemo(() => {
        if (!product) return { items: [], title: "Similar Products" };

        const others = allProducts.filter(
            (item) => String(item.id) !== String(productId)
        );
        const sameCategory = others.filter(
            (item) => product.category && item.category === product.category
        );
        const rest = others.filter((item) => !sameCategory.includes(item));

        return {
            items: [...sameCategory, ...rest].slice(0, MAX_RELATED),
            title: sameCategory.length > 0 ? "Similar Products" : "You May Also Like"
        };
    }, [allProducts, product, productId]);


    if (loading) {

        return (
            
            <main className="product-detail-page" data-theme="light">
                <div className="product-detail-status">
                    <div className="product-detail-spinner"></div>
                    <p>Loading product...</p>
                </div>
            </main>
        );

    }


    if (error || !product) {

        return (
            <main className="product-detail-page" data-theme="light">

                <div className="product-detail-status">

                    <h2>
                        {error || "Product not found."}
                    </h2>

                    <Link
                        to="/products"
                        className="back-products-btn"
                    >
                        <ArrowLeft size={17} />
                        Back to Products
                    </Link>

                </div>

            </main>
        );

    }


    const isAvailable = Number(product.stock) > 0;

    // Rating calculated from the product's reviews
    const reviewCount = reviews.length;
    const averageRating = reviewCount
        ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
        : 0;
    const ratingFill = `${(averageRating / 5) * 100}%`;
    const ratingLabel = reviewCount
        ? `Rated ${averageRating.toFixed(1)} out of 5`
        : "No ratings yet";


    return (
        <>
        <main className="product-detail-page" data-theme="light">

            <div className="product-detail-container">

                {/* Main Product Area (fits one screen on desktop) */}
                <section className="product-detail-main">

                    {/* =========================
                        LEFT — PRODUCT IMAGE
                    ========================== */}

                    <div className="product-detail-gallery">

                        <div className="product-detail-image">

                            <SafeImage
                                src={product.image}
                                alt={product.name}
                                iconSize={80}
                            />

                            {/* Breadcrumb / Back */}
                            <Link
                                to="/products"
                                className="product-detail-back"
                            >
                                <ArrowLeft size={17} />
                                Back to Products
                            </Link>

                        </div>

                    </div>


                    {/* =========================
                        RIGHT — PRODUCT INFO
                    ========================== */}

                    <div className="product-detail-info">

                        <div className="product-detail-info__body">

                            <span className="product-detail-category">
                                {product.category}
                            </span>


                            <h1>
                                {product.name}
                            </h1>


                            <div className="product-detail-rating">
                                <span
                                    className="rating-stars"
                                    style={{ "--fill": ratingFill }}
                                    role="img"
                                    aria-label={ratingLabel}
                                >
                                    ★★★★★
                                </span>

                                {reviewCount > 0 ? (
                                    <span>
                                        <strong>{averageRating.toFixed(1)}</strong>
                                        {" · "}
                                        {reviewCount}{" "}
                                        {reviewCount === 1 ? "review" : "reviews"}
                                    </span>
                                ) : (
                                    <span>No reviews yet</span>
                                )}
                            </div>


                            <div className="product-detail-price">
                                Rs. {Number(product.price).toLocaleString()}
                            </div>


                            {product.description && (
                                <p className="product-detail-description">
                                    {product.description}
                                </p>
                            )}


                            {/* Product Meta */}
                            <div className="product-detail-meta">

                                <div className="product-meta-item">

                                    <span className="meta-icon">
                                        <Tag size={16} />
                                    </span>

                                    <div>
                                        <span className="meta-label">
                                            Category
                                        </span>

                                        <strong>
                                            {product.category}
                                        </strong>
                                    </div>

                                </div>


                                <div className="product-meta-item">

                                    <span className="meta-icon">
                                        <Package size={16} />
                                    </span>

                                    <div>
                                        <span className="meta-label">
                                            Availability
                                        </span>

                                        <strong
                                            className={
                                                isAvailable
                                                    ? "available"
                                                    : "unavailable"
                                            }
                                        >
                                            {isAvailable
                                                ? "In Stock"
                                                : "Out of Stock"}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* Stock information */}
                            {isAvailable && (
                                <div className="product-stock-info">

                                    <CheckCircle2 size={17} />

                                    <span>
                                        {product.stock} units available
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* Always visible: quantity + actions */}
                        <div className="product-detail-info__footer">

                            {/* Quantity Selector */}
                            {isAvailable && (
                                <div className="product-quantity-selector">
                                    <span className="quantity-label">Quantity:</span>
                                    <div className="quantity-controls">
                                        <button
                                            type="button"
                                            onClick={handleDecrement}
                                            className="qty-btn"
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            -
                                        </button>
                                        <span className="qty-value">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={handleIncrement}
                                            className="qty-btn"
                                            disabled={quantity >= Number(product.stock)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}


                            {/* Actions */}
                            <div className="product-detail-actions">

                             <button
    type="button"
    className="product-cart-btn"
    disabled={!isAvailable}
    onClick={handleAddToCart}
>
    <ShoppingCart size={18} />
    Add to Cart
</button>


                                <button
                                    type="button"
                                    className="product-buy-btn"
                                    disabled={!isAvailable}
                                    onClick={handleBuyNow}
                                >
                                    <Zap size={18} />
                                    Buy Now
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =========================
                    CUSTOMER REVIEWS SECTION
                ========================== */}
                <section className="product-reviews-section" data-theme="light">

                    <div className="product-reviews-head">
                        <h2 className="product-reviews-title">Customer Reviews ({reviews.length})</h2>

                        {reviewCount > 0 && (
                            <div className="product-reviews-summary">
                                <strong>{averageRating.toFixed(1)}</strong>
                                <div>
                                    <span
                                        className="rating-stars"
                                        style={{ "--fill": ratingFill }}
                                        role="img"
                                        aria-label={ratingLabel}
                                    >
                                        ★★★★★
                                    </span>
                                    <span className="product-reviews-summary__count">
                                        Based on {reviewCount}{" "}
                                        {reviewCount === 1 ? "review" : "reviews"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="product-reviews-layout">

                        {/* Review Form */}
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <h3 className="review-form__title">Write a Review</h3>
                            <div className="review-form__row">
                                <div className="review-field">
                                    <label htmlFor="review-name">Your Name</label>
                                    <input
                                        id="review-name"
                                        type="text"
                                        value={reviewForm.author_name}
                                        onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                                        required
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="review-field">
                                    <label htmlFor="review-rating">Rating</label>
                                    <select
                                        id="review-rating"
                                        value={reviewForm.rating}
                                        onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                    >
                                        <option value={5}>5 Stars ★★★★★</option>
                                        <option value={4}>4 Stars ★★★★☆</option>
                                        <option value={3}>3 Stars ★★★☆☆</option>
                                        <option value={2}>2 Stars ★★☆☆☆</option>
                                        <option value={1}>1 Star ★☆☆☆☆</option>
                                    </select>
                                </div>
                            </div>
                            <div className="review-field">
                                <label htmlFor="review-comment">Your Review</label>
                                <textarea
                                    id="review-comment"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    required
                                    rows={4}
                                    placeholder="Write your thoughts about this product..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="review-submit"
                            >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>

                        {/* Review List */}
                        {reviews.length === 0 ? (
                            <p className="review-empty">No customer reviews yet. Be the first to review this product!</p>
                        ) : (
                            <div className="review-list">
                                {reviews.map((r) => (
                                    <div key={r.id} className="review-card">
                                        <div className="review-card__head">
                                            <span className="review-card__avatar" aria-hidden="true">
                                                {(r.author_name || "?").trim().charAt(0).toUpperCase()}
                                            </span>
                                            <strong className="review-card__name">{r.author_name}</strong>
                                            <span className="review-card__stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                        </div>
                                        <p className="review-card__text">{r.comment}</p>
                                        <small className="review-card__date">{new Date(r.created_at).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </section>

                {/* =========================
                    SIMILAR PRODUCTS
                ========================== */}
                {related.items.length > 0 && (
                    <section className="related-products" aria-labelledby="related-title">

                        <div className="related-products__head">
                            <h2 id="related-title">{related.title}</h2>
                            <Link to="/products" className="related-products__all">
                                View all
                            </Link>
                        </div>

                        <ul className="related-products__grid">
                            {related.items.map((item) => (
                                <li key={item.id}>
                                    <Link
                                        to={`/products/${item.id}`}
                                        className="related-card"
                                    >
                                        <div className="related-card__media">
                                            <SafeImage src={item.image} alt="" iconSize={40} />
                                        </div>

                                        <div className="related-card__body">
                                            {item.category && (
                                                <p className="related-card__category">
                                                    {item.category}
                                                </p>
                                            )}

                                            <h3>{item.name}</h3>

                                            <div className="related-card__bottom">
                                                <span className="related-card__price">
                                                    Rs. {Number(item.price).toLocaleString()}
                                                </span>

                                                <span className="related-card__arrow" aria-hidden="true">
                                                    <ArrowUpRight size={18} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                    </section>
                )}
            </div>
        </main>
        <Footer />
        </>
    );
}

export default ProductDetail;