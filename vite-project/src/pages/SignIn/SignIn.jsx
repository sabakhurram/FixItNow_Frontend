import { Link, useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { auth } from "../../firebase/firebase";

import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doPasswordReset
} from "../../firebase/auth";

import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserRole = async (user) => {
    const token = await user.getIdToken();

    const response = await fetch(
      "https://fixitnowbackend-production.up.railway.app/api/users/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to verify account role.");
    }

    const data = await response.json();

    return data.user?.role;
  };

  const redirectBasedOnRole = (role) => {
    if (role === "admin") {
      alert("Admin accounts must use the Admin Portal.");
      auth.signOut();
      return;
    }

    if (role === "technician") {
      alert("Technician accounts must use the Technician Portal.");
      auth.signOut();
      return;
    }

    if (role === "user") {
      alert("Login successful!");

    navigate("/dashboard", { replace: true });

      return;
    }

    auth.signOut();
    throw new Error("Invalid account role.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const userCredential =
        await doSignInWithEmailAndPassword(
          email,
          password
        );

      const user = userCredential.user;

      const role = await getUserRole(user);

      console.log("Login role:", role);

      redirectBasedOnRole(role);

    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await doSignInWithGoogle();

      const user = auth.currentUser;

      const role = await getUserRole(user);

      console.log("Google login role:", role);

      redirectBasedOnRole(role);

    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      await doPasswordReset(email);

      alert(
        "Password reset email sent!"
      );

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signin">

      <div className="signin-card">

        <h1>Welcome Back</h1>

        <p>
          Sign in to continue your solar journey
        </p>

        <form onSubmit={handleSubmit}>

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

          <p
            className="forgot-password"
            onClick={handlePasswordReset}
          >
            Forgot Password?
          </p>

          <button type="submit">
            {loading
              ? "Signing In..."
              : "Sign In"}
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

    </div>
  );
};

export default SignIn;