import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { setToken, setUserInfo } from "../../store";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const isAuthenticated = useSelector((state) => state.user.token);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  const isButtonDisabled = () => {
    const isEmailValid = email.includes("@");
    const isPassworValid = password.length > 7;
    const isButtonDisabled = !isEmailValid || !isPassworValid;
    return isButtonDisabled;
  };

  const submitForm = async () => {
    try {
      //Login
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      //User UID
      const userUID = userCredentials.user.uid;

      //Get User from collection
      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      let registeredUser;
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        registeredUser = docSnap.data();
      } else {
        console.log("No such document!");
      }
      const accessToken = userCredentials.user.accessToken;
      dispatch(setToken(accessToken));
      dispatch(setUserInfo(registeredUser));
    } catch (e) {
      switch (e.code) {
        case "auth/invalid-email":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Email or password in wrong");
          return;
        default:
          setError("An error occurred!");
      }
    }
  };

  return (
    <div className="hero min-h-screen bg-white">
      <div className="flex-col lg:flex-row-reverse">
        <div className="text-center">
          <h1 className="text-6xl  text-[#000000c5] font-sans py-10">
            Team Calender
          </h1>
          {/* <p className="text-black py-6">Welcome to our site, login here!</p> */}
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-lg shadow-blue-700/50 bg-[#0a0a0ae3] border border-[#05050577]">
          <form className="card-body">
            <div className="form-control">
              <label className="label text-white ">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">Password</label>
              <input
                type="password"
                placeholder="password"
                className="input  border-[#1b1b1b] bg-white text-black"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <label className="text-red-500 text-center">{error}</label>
            )}
            <div className="form-control mt-3">
              <button
                disabled={isButtonDisabled()}
                onClick={submitForm}
                className="btn bg-neutral-800 border-blue-600 shadow-lg shadow-blue-600/50 hover:border-blue-600 hover:text-black hover:bg-white text-white"
                type="button"
              >
                Login
              </button>
            </div>
            <p className="mt-4 text-white">
              Are you new user?{" "}
              <Link className="text-blue-600" to="/registration">
                Click here to register{" "}
              </Link>{" "}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
