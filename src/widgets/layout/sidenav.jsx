import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/doctorSlice";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-amber-900 via-amber-800 to-red-900",
    white: "bg-gradient-to-br from-pink-50 to-amber-50 shadow-lg",
    transparent: "bg-transparent",
  };

  const handleLogout = async () => {
    try {
      await reduxDispatch(logout());
      // navigate('/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Filter routes to only show dashboard routes
  const dashboardRoutes = routes.filter(route => route.layout === "dashboard");

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border-2 border-amber-200`}
    >
      <div className="relative border-b border-amber-200/50">
        <Link to="/" className="py-6 px-8 text-center block">
          <Typography
            variant="h6"
            className={`font-bold ${
              sidenavType === "dark" ? "text-white" : "text-amber-900"
            }`}
          >
            {brandName}
          </Typography>
          <Typography
            variant="small"
            className={`mt-1 ${
              sidenavType === "dark" ? "text-amber-200" : "text-amber-700"
            }`}
          >
            ! विवाहनम् !
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-amber-900" />
        </IconButton>
      </div>
      <div className="m-4 flex flex-col h-[calc(100%-6rem)] justify-between">
        <div>
          {dashboardRoutes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {pages.map(({ icon, name, path }) => (
                <li key={name}>
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? "amber"
                            : sidenavType === "dark"
                            ? "white"
                            : "brown"
                        }
                        className={`flex items-center gap-4 px-4 capitalize ${
                          isActive 
                            ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md" 
                            : sidenavType === "dark"
                            ? "text-amber-100 hover:bg-amber-800/30"
                            : "text-amber-900 hover:bg-amber-100"
                        }`}
                        fullWidth
                      >
                        <span className={isActive ? "text-white" : ""}>
                          {icon}
                        </span>
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-auto mb-4">
          <Button
            variant="gradient"
            className="flex items-center gap-4 px-4 capitalize bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-lg"
            fullWidth
            onClick={handleLogout}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
            <Typography
              color="inherit"
              className="font-medium capitalize"
            >
              Logout
            </Typography>
          </Button>
        </div>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Vivahanam Admin Portal",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;