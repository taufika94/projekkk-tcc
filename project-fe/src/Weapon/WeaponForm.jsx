import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const WeaponForm = () => {
  const { api } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [weapon, setWeapon] = useState({
    name: '',
    type: '',
    serialNum: '',
    condition: '',
    location: '',
    stok: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchWeapon = async () => {
        try {
          const response = await api.get(`/weapons/${id}`);
          setWeapon(response.data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchWeapon();
    }
  }, [id, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWeapon(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        if (id) {
            await api.put(`/update-weapons/${id}`, weapon);
        } else {
            await api.post('/add-weapons', weapon);
        }
        navigate('/weapons');
    } catch (err) {
        setError(err.response?.data?.message || err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Edit Weapon' : 'Add New Weapon'}
      </h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={weapon.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="type">
            Type
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={weapon.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="serialNum">
            Serial Number
          </label>
          <input
            type="text"
            id="serialNum"
            name="serialNum"
            value={weapon.serialNum}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="condition">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={weapon.condition}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="location">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={weapon.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="stok">
            Stock
          </label>
          <input
            type="number"
            id="stok"
            name="stok"
            value={weapon.stok}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
            min="0"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/weapons')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeaponForm;