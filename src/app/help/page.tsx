export default function Help() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg p-8 bg-white rounded shadow-md mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Help & Support</h2>
        <div className="mb-6 text-gray-700 text-lg">
          <p className="mb-2">Questions about your balance, payments, and navigating the website?</p>
          <p className="mb-4">Contact Edam Property Management for questions:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><span className="font-semibold">Phone:</span> <a href="tel:+919440348141" className="text-blue-600 hover:underline">+91 9440348141</a></li>
            <li><span className="font-semibold">Email:</span> <a href="mailto:info@edamproperty.com" className="text-blue-600 hover:underline">info@edamproperty.com</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
