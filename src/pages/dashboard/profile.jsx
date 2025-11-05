import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
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
  CalendarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";
import { useSelector } from 'react-redux';
import AdminImg from "../../../public/img/dummy-image.jpg"

export function Profile(){
  const { doctor } = useSelector((state) => state.doctor);
  
  return (
    <div className="relative mt-8 h-full w-full">
      {/* Background - Simplified to amber-100 */}
      <div className="absolute inset-0 bg-amber-100 h-80" />
      
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="relative -mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="col-span-1 shadow-xl border-2 border-amber-100">
            <CardHeader className="h-52 bg-amber-600 relative overflow-hidden">
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              <div className="flex flex-col items-center justify-center h-full relative z-10">
                <Avatar
                  size="xxl"
                  src={doctor?.adminImagelink?.url || AdminImg}
                  alt="profile-picture"
                  className="ring-4 ring-white h-32 w-32 shadow-2xl"
                />
              </div>
            </CardHeader>
            <CardBody className="text-center">
              <Typography variant="h4" className="mb-2 text-red-700 font-bold">
                {doctor?.adminName || "Admin Name"}
              </Typography>
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 rounded-full mb-4">
                <ShieldCheckIcon className="h-4 w-4 text-red-700" />
                <Typography className="text-sm font-semibold text-red-700">
                  Vivahanam Admin Portal
                </Typography>
              </div>
              
              <Typography className="text-sm text-red-700 mb-6">
                ! विवाहनम् !
              </Typography>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors">
                  <div className="p-2 bg-amber-200 rounded-full">
                    <EnvelopeIcon className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="text-left flex-1">
                    <Typography className="text-xs text-gray-600 font-semibold">Email</Typography>
                    <Typography className="text-sm text-red-700">{doctor?.adminEmailId}</Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors">
                  <div className="p-2 bg-amber-200 rounded-full">
                    <PhoneIcon className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="text-left flex-1">
                    <Typography className="text-xs text-gray-600 font-semibold">Phone</Typography>
                    <Typography className="text-sm text-red-700">{doctor?.adminMobileNo || "Not provided"}</Typography>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors">
                  <div className="p-2 bg-amber-200 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="text-left flex-1">
                    <Typography className="text-xs text-gray-600 font-semibold">Location</Typography>
                    <Typography className="text-sm text-red-700">{doctor?.adminLocation || "Location not set"}</Typography>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex justify-center gap-2 pt-2 border-t border-amber-100">
              <Button
                size="lg"
                className="flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
              >
                <PencilIcon className="h-4 w-4" /> Edit Profile
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
              <div className="grid gap-6">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserCircleIcon className="h-6 w-6 text-red-700" />
                    <Typography variant="h6" className="text-red-700 font-bold">
                      Personal Details
                    </Typography>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-5 bg-amber-100 rounded-xl shadow-sm border-l-4 border-amber-600 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <EnvelopeIcon className="h-5 w-5 text-red-700" />
                        <Typography variant="small" className="font-bold text-red-700">
                          Email Address
                        </Typography>
                      </div>
                      <Typography className="text-red-700 font-medium">{doctor?.adminEmailId}</Typography>
                    </div>
                    
                    <div className="p-5 bg-amber-100 rounded-xl shadow-sm border-l-4 border-amber-600 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneIcon className="h-5 w-5 text-red-700" />
                        <Typography variant="small" className="font-bold text-red-700">
                          Mobile Number
                        </Typography>
                      </div>
                      <Typography className="text-red-700 font-medium">{doctor?.adminMobileNo || "Not provided"}</Typography>
                    </div>
                    
                    <div className="p-5 bg-amber-100 rounded-xl shadow-sm border-l-4 border-amber-600 hover:shadow-md transition-shadow md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="h-5 w-5 text-red-700" />
                        <Typography variant="small" className="font-bold text-red-700">
                          Location
                        </Typography>
                      </div>
                      <Typography className="text-red-700 font-medium">{doctor?.adminLocation || "Not provided"}</Typography>
                    </div>
                  </div>
                </div>

               
                
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;