import React from "react";
import { auth, provider } from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Login({ setIsAuth }) {
  let navigate = useNavigate();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).then((result) => {
      localStorage.setItem("isAuth", true);
      setIsAuth(true);
      navigate("/");
    });
  };

  return (
    <div className="loginPage">
      <p>Войтиде в аккаунт гугл что бы продолжить</p>
      <button className="login-with-google-btn" onClick={signInWithGoogle}>
        Войти через гугл
      </button>
    </div>
  );
}

export default Login;
