import {
  HomeIcon,
  UserCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserPlusIcon,
  BuildingOfficeIcon, 
  DocumentIcon,
  ChatBubbleLeftRightIcon,  // for Faq
  PencilSquareIcon,       // for Blog
  StarIcon, 
  EnvelopeIcon,  
} from "@heroicons/react/24/solid";
import { Home, Profile } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import AddPlan from "./pages/dashboard/AddPlan";
import TestimonialAdmin from "./pages/dashboard/TestimonialAdmin";
import Blog from "./pages/dashboard/Blog";
import FaqPage from "./pages/dashboard/FaqPage";
import ContactUs from "./pages/dashboard/ContactUs";


const icon = {
  className: "w-5 h-5 text-inherit",
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
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "Add Plan",
        path: "/addPlan",
        element: <AddPlan />,
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
        name: "Faq Page",
        path: "/faq",
        element: <FaqPage />,
      },
          {
        icon: <EnvelopeIcon {...icon} />,
        name: "Contact Us",
        path: "/contact",
        element: <ContactUs />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];


export default routes;
