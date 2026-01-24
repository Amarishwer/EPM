export default function Admin() {
  const properties = [
    { name: 'Lakshmi nilayam G1', monthlyRent: 30600 },
    { name: 'Lakshmi nilayam G2', monthlyRent: 22990 },
    { name: 'Lakshmi nilayam G3&G4', monthlyRent: 40000 },
    { name: 'Lakshmi nilayam G5', monthlyRent: 9075 },
    { name: 'Lakshmi nilayam G6', monthlyRent: 5000 },
    { name: 'Lakshmi nilayam F1', monthlyRent: 17000 },
    { name: 'Lakshmi nilayam F2', monthlyRent: 17000 },
    { name: 'Lakshmi nilayam S1', monthlyRent: 16000 },
    { name: 'Lakshmi nilayam S2', monthlyRent: 16000 },
    { name: 'Lakshmi nilayam PH', monthlyRent: 6000 },
    { name: 'Lakshmi nilayam tower', monthlyRent: 19602 },
    { name: 'RBI colony plot 21', monthlyRent: 35000 },
    { name: 'RBI colony plot 20', monthlyRent: 40000 },
    { name: 'PVT shop 13', monthlyRent: 72000 },
    { name: 'PVT shop 325', monthlyRent: 15000 },
    { name: 'Main road plot A5', monthlyRent: 400000 },
    { name: 'Dilsukhnagar 17-33', monthlyRent: 32500 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      <h2 className="text-2xl font-semibold mb-4">Properties and Monthly Rent</h2>
      <ul className="space-y-4">
        {properties.map((property, index) => (
          <li key={index} className="bg-white p-4 rounded shadow">
            <strong>{property.name}</strong>: ${property.monthlyRent} per month
          </li>
        ))}
      </ul>
    </div>
  );
}
