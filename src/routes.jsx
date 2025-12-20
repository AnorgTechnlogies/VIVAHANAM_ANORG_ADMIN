import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  BuildingOfficeIcon, 
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  StarIcon, 
  EnvelopeIcon,  
} from "@heroicons/react/24/solid";
import Home from "@/pages/dashboard/Home";
import Profile from "@/pages/dashboard/Profile";
import { SignIn, SignUp } from "@/pages/auth";
// import AddPlan from "./pages/dashboard/AddPlan";
import TestimonialAdmin from "./pages/dashboard/TestimonialAdmin";
import Blog from "./pages/dashboard/Blog";
import FaqPage from "./pages/dashboard/FaqPage";
import ContactUs from "./pages/dashboard/ContactUs";
import AdminUsersDashboard from "./pages/dashboard/UserInfo";
import AdminDynamicFormManager from "./pages/dashboard/AdminDynamicFormManager";
import MatchmakingPlans from "./pages/dashboard/MatchmakingPlans";
import ContactInfoManagement from "./pages/dashboard/ContactInfoManagement";
import WeddingServiceForm from "./pages/dashboard/WeddingServiceForm";
import MatchmakingPayuser from "./pages/dashboard/MatchmakingPayuser";
const icon = {
  className: "w-5 h-5 text-inherit flex-shrink-0",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "HOME",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "User Information",
        path: "/userinfo",
        element: <AdminUsersDashboard />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: " Wedding Service User",
        path: "/WeddingServiceForm",
        element: <WeddingServiceForm />,
      },
      {
        icon: <StarIcon {...icon} />,
        name: "Testimonials",
        path: "/testimonials",
        element: <TestimonialAdmin />,
      },
      {
        icon: <PencilSquareIcon {...icon} />,
        name: "Blog Page",
        path: "/blog",
        element: <Blog />,
      },
      {
        icon: <ChatBubbleLeftRightIcon {...icon} />,
        name: "FAQ Page",
        path: "/faq",
        element: <FaqPage />,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Contact Us",
        path: "/contact",
        element: <ContactUs />,
      },
      {
        icon: <DocumentIcon {...icon} />,
        name: "Dynamic Form Manager",
        path: "/dynamic-form-manager",
        element: <AdminDynamicFormManager />,
      },
       {
        icon: <EnvelopeIcon {...icon} />,
        name: "MatchMaking Pay User",
        path: "/Matchnaking-pay-user",
        element: <MatchmakingPayuser />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Matchmaking Plans",
        path: "/matchmaking-plans",
        element: <MatchmakingPlans />,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "Contact Info",
        path: "/contact-info",
        element: <ContactInfoManagement />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign In",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Sign Up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;