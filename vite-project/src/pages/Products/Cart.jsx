
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingCart,
    Trash2,
    Minus,
    Plus
} from "lucide-react";

import { useCart } from "../../contexts/CartContext";
import "./Cart.css";

function Cart() {
    const {
        cartItems,
        loading,
        removeFromCart,
        updateQuantity
    } = useCart();

    const navigate = useNavigate();

    const handleContinueShopping = () => {
        navigate("/products");
    };

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    const shippingFee =
        subtotal === 0
            ? 0
            : subtotal > 15000
            ? 0
            : 250;

    const totalAmount = subtotal + shippingFee;

    const handleDecrease = (item) => {
        if (item.quantity > 1) {
            updateQuantity(item.id, item.quantity - 1);
        }
    };

    const handleIncrease = (item) => {
        if (item.quantity < Number(item.stock)) {
            updateQuantity(item.id, item.quantity + 1);
        }
    };

    const handleCheckout = () => {
        navigate("/checkout", {
            state: {
                items: cartItems
            }
        });
    };

    if (loading) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <ShoppingCart
                        size={48}
                        className="cart-empty-icon"
                    />
                    <h1>Loading Cart...</h1>
                    <p>Please wait while we load your cart.</p>
                </div>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="cart-page">
                <div className="cart-empty">
                    <ShoppingCart
                        size={48}
                        className="cart-empty-icon"
                    />

                    <h1>Your Cart is Empty</h1>

                    <p>
                        Looks like you haven't added
                        any products yet.
                    </p>

                    <button
                        type="button"
                        className="cart-shop-btn"
                        onClick={handleContinueShopping}
                    >
                        <ArrowLeft size={17} />
                        Browse Products
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="cart-container">

                {/* Continue shopping */}
                <button
                    type="button"
                    className="cart-back-link"
                    onClick={handleContinueShopping}
                >
                    <ArrowLeft size={17} />
                    <span>Continue Shopping</span>
                </button>

                <h1>Shopping Cart</h1>

                <div className="cart-layout">

                    {/* LEFT: ITEMS TABLE */}
                    <section className="cart-items-section">

                        {/* Table header */}
                        <div className="cart-table-header">
                            <span className="cart-header-product">
                                Product
                            </span>

                            <span className="cart-header-quantity">
                                Quantity
                            </span>

                            <span className="cart-header-total">
                                Total
                            </span>

                            <span className="cart-header-action">
                                Action
                            </span>
                        </div>

                        {/* Product rows */}
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <article
                                    className="cart-item"
                                    key={item.id}
                                >
                                    {/* Product */}
                                    <div className="cart-item-product">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="cart-item-image"
                                        />

                                        <div className="cart-item-info">
                                            <h2>{item.name}</h2>

                                            <span className="cart-item-category">
                                                {item.category}
                                            </span>

                                            <span className="cart-item-price">
                                                Rs.{" "}
                                                {Number(
                                                    item.price
                                                ).toLocaleString()}
                                                {" "}each
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="cart-quantity-controls">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDecrease(item)
                                            }
                                            disabled={item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={14} />
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleIncrease(item)
                                            }
                                            disabled={
                                                item.quantity >=
                                                Number(item.stock)
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Item total */}
                                    <div className="cart-item-total">
                                        Rs.{" "}
                                        {(
                                            Number(item.price) *
                                            item.quantity
                                        ).toLocaleString()}
                                    </div>

                                    {/* Remove */}
                                    <div className="cart-item-action">
                                        <button
                                            type="button"
                                            className="cart-remove-btn"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* RIGHT: ORDER SUMMARY */}
                    <aside className="cart-summary">

                        <h2>Order Summary</h2>

                        <div className="cart-summary-row">
                            <span>Subtotal</span>
                            <span>
                                Rs. {subtotal.toLocaleString()}
                            </span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Shipping Fee</span>
                            <span>
                                {shippingFee === 0
                                    ? "Free"
                                    : `Rs. ${shippingFee.toLocaleString()}`}
                            </span>
                        </div>

                        {subtotal > 0 && subtotal <= 15000 && (
                            <p className="cart-shipping-note">
                                Free shipping on orders above Rs. 15,000
                            </p>
                        )}

                        <div className="cart-summary-total">
                            <span>Total</span>
                            <strong>
                                Rs. {totalAmount.toLocaleString()}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="cart-checkout-btn"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>

                        <div className="cart-summary-footer">
                            <ShoppingCart size={15} />
                            <span>
                                Secure checkout · Your order is protected
                            </span>
                        </div>

                    </aside>
                </div>
            </div>
        </main>
    );
}

export default Cart;
