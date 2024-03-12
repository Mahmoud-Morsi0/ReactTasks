import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToken, setUserInfo } from "../store";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const LogoutHandler = () => {
    dispatch(setToken(null));
    dispatch(setUserInfo(null));
    navigate("/login");
  };

  const navigateToTeamsPage = () => {
    navigate("/teams");
  };

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Team Calendar</a>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li className="cursor-pointer" onClick={navigateToTeamsPage}>
              <a className="justify-between">
                Teams
                <span className="badge">New</span>
              </a>
            </li>
            <li className="cursor-pointer" onClick={LogoutHandler}>
              <a>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
