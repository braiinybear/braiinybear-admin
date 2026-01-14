"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  userImg: string;
  courseName: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && users.length > 0 && (
        <table className="w-full bg-white border rounded-lg">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">User</th>
              <th className="p-4">Course</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 flex gap-3 items-center">
                  <img
                    src={user.userImg}
                    className="w-10 h-10 rounded-full"
                    alt=""
                  />
                  {user.name}
                </td>
                <td className="p-4 text-center">{user.courseName}</td>
                <td className="p-4 text-center">{user.paymentStatus}</td>
                <td className="p-4 text-center">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/user/${user.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
