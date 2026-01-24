import Link from 'next/link';
import Image from "next/image";

function Header() {
  return (
    <header className="w-full bg-[#f7f7fa] py-0 mb-0 shadow fixed top-0 left-0 z-50">
      <Link href="/" className="w-full px-0 flex items-center" style={{ textDecoration: 'none' }}>
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
    </header>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-0">
      <Header />
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md mt-8" style={{ marginTop: 140 }}>
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
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
            className="w-full bg-[#cd7f32] text-white py-2 rounded hover:bg-[#b87333] transition font-bold border-2 border-[#cd7f32] hover:border-[#b87333] focus:outline-none focus:ring-2 focus:ring-[#cd7f32]"
          >
            <span className="text-white">Login</span>
          </button>
        </form>
      </div>
    </div>
  );
}
