import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const WeaponList = () => {
  const { api, logout, user } = useAuth(); // Ambil user
  const navigate = useNavigate();
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await api.get('/weapons');
        setWeapons(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);

        if (err.response?.status === 403) {
          try {
            const refreshResponse = await api.get('/token');
            const newToken = refreshResponse.data.accessToken;
            localStorage.setItem('token', newToken);

            const retryResponse = await api.get('/weapons');
            setWeapons(retryResponse.data);
          } catch (refreshError) {
            logout();
            navigate('/login');
          }
        }
      }
    };

    fetchWeapons();
  }, [api, logout, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this weapon?')) {
      try {
        await api.delete(`/delete-weapons/${id}`);
        setWeapons(weapons.filter(weapon => weapon.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weapon Management</h1>
        {/* Tampilkan tombol hanya untuk admin & petugas */}
        {user && (user.role === 'admin' || user.role === 'petugas') && (
          <Link 
            to="/add-weapons" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Weapon
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Type</th>
              <th className="py-2 px-4 border">Serial Number</th>
              <th className="py-2 px-4 border">Condition</th>
              <th className="py-2 px-4 border">Location</th>
              <th className="py-2 px-4 border">Stock</th>
              {/* Kolom actions hanya ditampilkan untuk admin & petugas */}
              {user && user.role !== 'pengawas' && <th className="py-2 px-4 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {weapons.map((weapon) => (
              <tr key={weapon.id}>
                <td className="py-2 px-4 border">{weapon.name}</td>
                <td className="py-2 px-4 border">{weapon.type}</td>
                <td className="py-2 px-4 border">{weapon.serialNum}</td>
                <td className="py-2 px-4 border">{weapon.condition}</td>
                <td className="py-2 px-4 border">{weapon.location}</td>
                <td className="py-2 px-4 border">{weapon.stok}</td>
                
                {/* Action buttons ditampilkan berdasarkan role */}
                {user && user.role !== 'pengawas' && (
                  <td className="py-2 px-4 border">
                    <Link 
                      to={`/update-weapons/${weapon.id}`}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(weapon.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeaponList;
