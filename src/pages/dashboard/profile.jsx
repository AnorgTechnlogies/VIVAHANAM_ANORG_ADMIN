import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import AdminImg from "../../../public/img/dummy-image.jpg";

// Helper component to avoid repeating Typography + fallback logic
const InfoText = ({ children, fallback = "Not provided" }) => (
  <Typography className="text-red-700 font-medium">
    {children ?? fallback}
  </Typography>
);

const Label = ({ children }) => (
  <Typography variant="small" className="font-bold text-red-700">
    {children}
  </Typography>
);

export function Profile() {
  const { admin } = useSelector((state) => state.admin);

  // Fallback if admin is not loaded yet
  if (!admin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-amber-600"></div>
          <Typography className="mt-4 text-gray-600">Loading admin profile...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-8 h-full w-full">
      {/* Background */}
      <div className="absolute inset-0 bg-amber-100 h-80" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="relative -mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="col-span-1 shadow-xl border-2 border-amber-100">
            <CardHeader className="h-52 bg-amber-600 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="flex flex-col items-center justify-center h-full relative z-10">
                <Avatar
                  size="xxl"
                  src={admin?.adminImagelink?.url || AdminImg}
                  alt="Admin Profile"
                  className="ring-4 ring-white h-32 w-32 shadow-2xl border-4 border-white"
                />
              </div>
            </CardHeader>

            <CardBody className="text-center">
              <Typography variant="h4" className="mb-2 text-red-700 font-bold capitalize">
                {admin.adminName || "Admin Name"}
              </Typography>

              <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 rounded-full mb-4">
                <ShieldCheckIcon className="h-4 w-4 text-red-700" />
                <Typography className="text-sm font-semibold text-red-700">
                  Vivahanam Admin Portal
                </Typography>
              </div>

              <Typography className="text-sm text-red-700 mb-6 font-bold">
                ! विवाहनम् !
              </Typography>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors">
                  <div className="p-2 bg-amber-200 rounded-full">
                    <EnvelopeIcon className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="text-left flex-1">
                    <Typography className="text-xs text-gray-600 font-semibold">Email</Typography>
                    <InfoText>{admin.adminEmailId}</InfoText>
                  </div>
                </div>
              </div>
            </CardBody>

            <CardFooter className="flex justify-center gap-2 pt-2 border-t border-amber-100">
              <Button
                size="lg"
                className="flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white shadow-lg normal-case"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Main Content Area */}
          <Card className="col-span-2 shadow-xl border-2 border-amber-100">
            <CardHeader className="bg-amber-600 p-6 shadow-md">
              <Typography variant="h5" className="text-red-700 font-bold">
                Account Information
              </Typography>
              <Typography className="text-red-700 text-sm mt-1">
                Manage your profile and account details
              </Typography>
            </CardHeader>

            <CardBody className="p-6">
              <div className="grid gap-8">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCircleIcon className="h-6 w-6 text-red-700" />
                    <Typography variant="h6" className="text-red-700 font-bold">
                      Personal Details
                    </Typography>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-5 bg-amber-100 rounded-xl shadow-sm border-l-4 border-amber-600 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <EnvelopeIcon className="h-5 w-5 text-red-700" />
                        <Label>Email Address</Label>
                      </div>
                      <InfoText>{admin.adminEmailId}</InfoText>
                    </div>
                  </div>
                </div>

                {/* You can add more sections here later: Security, Activity, etc. */}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;