
import Link from 'next/link';

import Image from "next/image";
function Header() {
  return (
    <header className="w-full bg-[#f7f7fa] py-0 mb-0 shadow fixed top-0 left-0 z-50 flex items-center justify-between px-4">
      <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }}>
        <Image
          src="/logo.png"
          alt="EPM Logo"
          width={110}
          height={110}
          className="object-cover scale-100 mix-blend-multiply my-0 ml-0 group-hover:opacity-80 transition"
        />
        <span className="ml-4 flex flex-col leading-tight">
          <span className="text-xl font-bold text-[#092136] tracking-wide whitespace-nowrap">EDAM</span>
          <span className="text-sm font-semibold text-[#092136] tracking-wide whitespace-nowrap">PROPERTY MANAGEMENT</span>
        </span>
      </Link>
      <Link href="/help">
        <button className="bg-[#cd7f32] text-white px-5 py-2 rounded font-semibold shadow hover:bg-[#b87333] transition focus:outline-none focus:ring-2 focus:ring-[#cd7f32] ml-4">
          Help
        </button>
      </Link>
    </header>
  );
}

export default function ResidentLogin() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-0">
      <Header />
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md" style={{ marginTop: 140 }}>
        <h2 className="text-2xl font-bold mb-6 text-center">Resident Login</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#cd7f32] text-white px-4 py-2 rounded hover:bg-[#b87333] transition font-bold border-2 border-[#cd7f32] hover:border-[#b87333] focus:outline-none focus:ring-2 focus:ring-[#cd7f32]"
          >
            Login
          </button>
        </form>
        <div className="flex flex-col items-center mt-6 space-y-2">
          <Link href="#" className="text-blue-600 hover:underline">Forgot password?</Link>
          <Link href="/register" className="w-full bg-[#092136] !text-white px-4 py-2 rounded hover:bg-[#0d2c4a] transition font-bold border-2 border-[#092136] hover:border-[#0d2c4a] focus:outline-none focus:ring-2 focus:ring-[#092136] text-center block">
            New Resident
          </Link>
        </div>
        <div className="mt-8 text-center">
          <Link href="/admin-login" className="text-[#cd7f32] hover:underline font-bold text-lg">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
