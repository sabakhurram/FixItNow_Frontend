import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

import {
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle
} from "../../firebase/auth";

import "./SignUp.css";

const SignUp = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {

     await doCreateUserWithEmailAndPassword(
      name,
      email,
     password
     );

      alert("Account created successfully!");

      navigate("/dashboard");

    } catch (error) {

      alert(error.message);

    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {

    if (loading) return;

    setLoading(true);

    try {

      await doSignInWithGoogle();

      alert("Google Sign Up successful!");

      navigate("/dashboard");

    } catch (error) {

      alert(error.message);

    }

    setLoading(false);
  };

  return (
    <div className="signup" data-theme="light">

      <div className="signup-card">


        <h1>Create Account</h1>

        <p>
          Join FixItNow for smart solar solutions
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
           placeholder="Full Name"
            value={name}
           onChange={(e) =>
           setName(e.target.value)
           }
          required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">

            {loading
              ? "Creating Account..."
              : "Sign Up"}

          </button>

        </form>

        <div className="signin-divider">
          <span>OR</span>
        </div>

        <button
  className="google-btn"
  onClick={handleGoogleSignIn}
>
  <FcGoogle size={22} />
  Continue with Google
</button>

      </div>

      {/* Photo panel with a short message */}
      <aside className="signup-visual">
        <div className="signup-visual__content">
          <h2>
            Your solar journey <span>starts here.</span>
          </h2>
          <p>
            Create an account to book services, order products and follow every
            request in one place.
          </p>
          <ul className="signup-visual__stats">
            <li>
              <strong>Book</strong>
              <span>Solar services</span>
            </li>
            <li>
              <strong>Order</strong>
              <span>Quality products</span>
            </li>
            <li>
              <strong>Track</strong>
              <span>Every request</span>
            </li>
          </ul>
        </div>
      </aside>

    </div>
  );
};

export default SignUp;