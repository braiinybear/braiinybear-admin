"use client";

import { useEffect, useMemo, useState } from "react";
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

  // Filters
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Pagination
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  /* =======================
     FETCH USERS
  ======================== */
  const fetchUsers = async (
    page = pagination.page,
    limit = pagination.limit
  ) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setUsers(data.data);
      setPagination(data.pagination);
      setSelectedUsers([]);
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pagination.limit);
  }, []);

  /* =======================
     CLIENT SIDE FILTERING
  ======================== */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        search === "" ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.courseName.toLowerCase().includes(search.toLowerCase()) ||
        user.paymentStatus.toLowerCase().includes(search.toLowerCase());

      const matchesPayment =
        paymentFilter === "" || user.paymentStatus === paymentFilter;

      const userDate = new Date(user.createdAt).setHours(0, 0, 0, 0);

      const matchesStartDate =
        !startDate ||
        userDate >= new Date(startDate).setHours(0, 0, 0, 0);

      const matchesEndDate =
        !endDate ||
        userDate <= new Date(endDate).setHours(23, 59, 59, 999);

      return (
        matchesSearch &&
        matchesPayment &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [users, search, paymentFilter, startDate, endDate]);

  /* =======================
     SELECTION LOGIC
  ======================== */
  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((uid) => uid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  /* =======================
     BULK DELETE
  ======================== */
  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedUsers.length} user(s)?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedUsers }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // Refresh list
      fetchUsers(pagination.page, pagination.limit);
    } catch {
      alert("Failed to delete users");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          type="text"
          placeholder="Search name / course / status"
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={pagination.limit}
          onChange={(e) => fetchUsers(1, Number(e.target.value))}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedUsers.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {selectedUsers.length} user(s) selected
          </p>
          <Button variant="destructive" onClick={handleDeleteUsers}>
            Delete Selected
          </Button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No users found</p>
      )}

      {!loading && filteredUsers.length > 0 && (
        <>
          <table className="w-full bg-white border rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4 text-left">User</th>
                <th className="p-4">Course</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                    />
                  </td>
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

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages} • Total{" "}
              {pagination.total} users
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!pagination.hasPrevPage}
                onClick={() =>
                  fetchUsers(pagination.page - 1, pagination.limit)
                }
              >
                Prev
              </Button>

              <Button
                variant="outline"
                disabled={!pagination.hasNextPage}
                onClick={() =>
                  fetchUsers(pagination.page + 1, pagination.limit)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

