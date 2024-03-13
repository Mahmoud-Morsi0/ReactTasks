import { Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUserInfo } from "../../store";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { useEffect } from "react";

const RootLayout = () => {
  const isAuthenticated = useSelector((state) => state.user.token);
  console.log({ isAuthenticated });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      //User
    } else {
      if (isAuthenticated) {
        dispatch(setToken(null));
        dispatch(setUserInfo(null));
        navigate("/login");
      }
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, []);
  return (
    <>
      {isAuthenticated && <Header />}
      <Outlet />
    </>
  );
};

export default RootLayout;
