import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export function TopBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/exporter/orders?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold text-primary">Setu</span>
        <nav className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
          <NavLink
            to="/exporter/dashboard"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 font-medium ${isActive ? "bg-white text-primary shadow-sm" : "text-gray-600"}`
            }
          >
            Exporter
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 font-medium ${isActive ? "bg-white text-primary shadow-sm" : "text-gray-600"}`
            }
          >
            Admin
          </NavLink>
        </nav>
      </div>

      <form onSubmit={onSearchSubmit} className="hidden flex-1 max-w-sm sm:block">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, buyers, products…"
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
        />
      </form>

      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          R
        </span>
        <span className="hidden text-gray-700 sm:inline">Rajesh · Mehta Knitwear</span>
      </div>
    </header>
  );
}
