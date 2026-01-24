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
          <h2 className="text-2xl font-bold text-center">Get started</h2>
          <p className="text-lg text-gray-700 mb-6 text-center">Let's start with your address</p>
          <form className="space-y-4">
            <input
                type="text"
                placeholder="Postal Code"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Area Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Colony Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Building Name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="text"
                placeholder="Door Number"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <Link href="/register/yourinfo" className="w-full">
            <button
                type="submit"
                className="w-full bg-[#092136] text-white py-2 rounded hover:bg-[#0d2c4a] transition mt-2 font-bold border-2 border-[#092136] hover:border-[#0d2c4a] focus:outline-none focus:ring-2 focus:ring-[#092136]"
            >
            Continue
            </button>
            </Link>
          </form>
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center">
          <h3 className="text-xl font-bold mb-4 text-center">Already Registered</h3>
          <p className="text-gray-700 mb-6 text-center">Click here to login to your account</p>
          <Link href="/resident-login" className="w-full flex justify-center">
            <button className="bg-[#cd7f32] text-white px-8 py-2 rounded font-semibold shadow hover:bg-[#b87333] transition focus:outline-none focus:ring-2 focus:ring-[#cd7f32] w-full max-w-xs">
              Login
            </button>
          </Link>
          </div>
        </div>
      </div>
  )
}