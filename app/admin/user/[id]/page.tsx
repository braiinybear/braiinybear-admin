"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  phoneNo: string;
  userImg: string;
  fatherName: string;
  motherName: string;
  courseName: string;
  aadharCardNo: string;
  aadharBack: string;
  aadharFront: string;
  marksheets: string[];
  address: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${id}`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message);
        setUser(data.user);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Loading user details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">User not found</p>
      </div>
    );

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getPaymentColor(
              user.paymentStatus
            )}`}
          >
            {user.paymentStatus}
          </span>
        </div>

        {/* Top Card */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-6">
          <img
            src={user.userImg || "https://via.placeholder.com/150"}
            alt={user.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.courseName}</p>
            <p className="text-gray-600">{user.email || "No Email Provided"}</p>
            <p className="text-gray-600">{user.phoneNo}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Personal Info</h3>
            <p>
              <strong>Father Name:</strong> {user.fatherName}
            </p>
            <p>
              <strong>Mother Name:</strong> {user.motherName}
            </p>
            <p>
              <strong>Address:</strong> {user.address}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Documents</h3>
            <div className="flex flex-col gap-4">
              <div>
                <strong>Aadhar Front:</strong>
                <img
                  src={user.aadharFront}
                  alt="Aadhar Front"
                  className="w-full max-w-xs h-32 object-cover mt-2 rounded-md border"
                />
              </div>
              <div>
                <strong>Aadhar Back:</strong>
                <img
                  src={user.aadharBack}
                  alt="Aadhar Back"
                  className="w-full max-w-xs h-32 object-cover mt-2 rounded-md border"
                />
              </div>
              <div>
                <strong>Marksheets:</strong>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  {user.marksheets.map((sheet, index) => (
                    <li key={index}>
                      <a
                        href={sheet}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        View Sheet {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <p>
                <strong>Aadhar Number:</strong> {user.aadharCardNo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
