
import { useState } from "react";
import { doSignInWithEmailAndPassword } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import "./TechnicianLogin.css";

const TechnicianLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
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

      console.log("Technician login role:", role);

      if (role === "technician") {
        console.log("Technician verified");

        navigate("/technician/dashboard", {
          replace: true,
        });

        return;
      }

      if (role === "user") {
        alert(
          "Customer accounts must use the Customer Portal."
        );
      } else if (role === "admin") {
        alert(
          "Admin accounts must use the Admin Portal."
        );
      } else {
        alert("Access denied.");
      }

      await auth.signOut();

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technician-login-page">

      <div className="technician-login-card">

        <div className="technician-logo">
          <h1>FixItNow</h1>
          <p>Technician Portal</p>
        </div>

        <form
          className="technician-login-form"
          onSubmit={handleLogin}
        >

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default TechnicianLogin;

