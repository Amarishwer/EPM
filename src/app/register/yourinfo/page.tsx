import Link from 'next/link';
import Image from "next/image";

function Header() {
  return (
    <header className="w-full bg-[#f7f7fa] py-0 mb-0 shadow flex items-center justify-between px-4">
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
      <Link href="/resident-login">
        <button className="bg-[#cd7f32] text-white px-5 py-2 rounded font-semibold shadow hover:bg-[#b87333] transition focus:outline-none focus:ring-2 focus:ring-[#cd7f32] ml-4">
          Login
        </button>
      </Link>
    </header>
  );
}
export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-0">
      <Header />
      <div className="flex flex-1 w-full items-center justify-center px-2 md:px-0">
        <div className="w-full max-w-md p-8 bg-white rounded shadow-md mt-4">
          <h2 className="text-2xl text-center">Your information</h2>
          <form className="space-y-4 mt-4">
            <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Phone Number"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <button
                type="submit"
                className="w-full bg-[#092136] text-white py-2 rounded hover:bg-[#0d2c4a] transition mt-2 font-bold border-2 border-[#092136] hover:border-[#0d2c4a] focus:outline-none focus:ring-2 focus:ring-[#092136]"
            >
            Continue
            </button>
          </form>
        </div>
        <div className="w-full md:w-1/2 bg-[#f7f7fa] p-8 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-gray-200">
        <h3 className="text-xl font-bold mb-4 text-center">Your Address</h3>
        </div>
      </div>
    </div>
  )
}