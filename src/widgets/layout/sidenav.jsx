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
import { logout } from "../../store/slices/adminSlice";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();

  const sidenavTypes = {
    dark: "bg-white",
    white: "bg-white shadow-lg",
    transparent: "bg-white",
  };

  const handleLogout = async () => {
    try {
      await reduxDispatch(logout());
      navigate('/'); 
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
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-gray-200 flex flex-col`}
    >
      {/* Header Section - Fixed */}
      <div className="relative border-b border-gray-200 flex-shrink-0">
        <Link to="/" className="py-6 px-8 text-center block">
          <Typography
            variant="h6"
            className="font-bold text-gray-900"
          >
            {brandName}
          </Typography>
          <Typography
            variant="small"
            className="mt-1 text-gray-600"
          >
            ! विवाहनम् !
          </Typography>
        </Link>
        <IconButton
          variant="text"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-gray-700" />
        </IconButton>
      </div>

      {/* Scrollable Navigation Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 custom-scrollbar">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 10px;
            transition: background 0.2s ease;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(107, 114, 128, 0.7);
          }

          /* Firefox scrollbar */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
          }

          /* Nav item text truncate with ellipsis */
          .nav-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
          }

          /* Smooth scroll behavior */
          .custom-scrollbar {
            scroll-behavior: smooth;
          }
        `}</style>

        {dashboardRoutes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`} title={name}>
                  {({ isActive }) => (
                    <Button
                      variant="text"
                      className={`flex items-center gap-4 px-4 capitalize ${
                        isActive 
                          ? "bg-gray-100 text-gray-900 border-l-4 border-amber-500" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      fullWidth
                    >
                      <span className={`flex-shrink-0 ${isActive ? "text-amber-500" : "text-gray-500"}`}>
                        {icon}
                      </span>
                      <Typography
                        className={`font-medium capitalize nav-text ${
                          isActive ? "text-gray-900" : "text-gray-600"
                        }`}
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

      {/* Logout Button - Fixed at Bottom */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-200">
        <Button
          variant="filled"
          className="flex items-center gap-4 px-4 capitalize bg-gray-800 hover:bg-gray-900 text-white"
          fullWidth
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 flex-shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z"
              clipRule="evenodd"
            />
          </svg>
          <Typography className="font-medium capitalize">
            Logout
          </Typography>
        </Button>
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