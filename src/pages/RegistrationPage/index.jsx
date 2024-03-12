import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setToken, setUserInfo } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.token);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [teamID, setTeamID] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  const isButtonDisabled = () => {
    const isFirstNameEmpty = firstName === "";
    const isLastNameEmpty = lastName === "";
    const isEmailValid = email.includes("@");
    const isPassworValid = password.length > 7;
    const isPasswordIsConfirmed =
      password !== "" && password === confirmedPassword;
    const isButtonDisabled =
      !isEmailValid ||
      !isPassworValid ||
      !isPasswordIsConfirmed ||
      isFirstNameEmpty ||
      isLastNameEmpty;
    return isButtonDisabled;
  };

  const submitForm = async () => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredentials);

      const userUID = userCredentials.user.uid;

      await setDoc(doc(db, "users", userUID), {
        firstName,
        lastName,
        email,
        teamID,
        id: userUID,
      });

      const docRef = doc(db, "users", userUID);
      const docSnap = await getDoc(docRef);
      let registeredUser;
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        registeredUser = docSnap.data();
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
      const accessToken = userCredentials.user.accessToken;
      dispatch(setToken(accessToken));
      dispatch(setUserInfo(registeredUser));
    } catch (e) {
      switch (e.message) {
        case "auth/email-already-exists":
          setError("Email is already exists, please login!");
          return;
        case "auth/invalid-email":
        case "auth/wrong-password":
          setError("Email or password in wrong");
          return;
        default:
          setError("An error occurred!");
      }
    }
  };

  return (
    <div className="hero min-h-screen  bg-white">
      <div className="flex-col lg:flex-row-reverse">
        <div className="text-center">
          <h1 className="text-5xl  text-[#000000c5] font-sans">Register now!</h1>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-lg shadow-blue-700/50 bg-[#0a0a0ae3] border border-[#05050577]">
          <form className="card-body">
            <div className="form-control">
              <label className="label  text-white">
               First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">
              Email
              </label>
              <input
                type="email"
                placeholder="email"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">
              Password
              </label>
              <input
                type="password"
                placeholder="password"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">
              Repeat Password
              </label>
              <input
                type="password"
                placeholder="password"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                required
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label text-white">
              Team ID
              </label>
              <input
                type="text"
                placeholder="Team ID (optional)"
                className="input border-[#05050577] bg-white text-[#000000c5]"
                value={teamID}
                onChange={(e) => setTeamID(e.target.value)}
              />
            </div>
            {error && (
              <label className="text-red-500 text-center">{error}</label>
            )}
            <div className="form-control mt-6">
              <button
                disabled={isButtonDisabled()}
                onClick={submitForm}
                className="btn bg-neutral-800 border-blue-600 shadow-lg shadow-blue-600/50 hover:border-blue-600 hover:text-black hover:bg-white text-white"
                type="button"
              >
                Register
              </button>
            </div>
            <p className="mt-4  text-white">
              Already user?{" "}
              <Link className="text-blue-500" to="/login">
                Click here to login{" "}
              </Link>{" "}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
