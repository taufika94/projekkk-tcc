import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TransactionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();

  const [form, setForm] = useState({
    type_transactions: '',
    amount: 0,
    information: '',
    status: 'pending',
    weaponId: ''
  });

  const [weapons, setWeapons] = useState([]);

  const fetchWeapons = async () => {
    try {
      const res = await api.get('/weapons');
      setWeapons(res.data);
    } catch (err) {
      console.error('Error fetching weapons:', err);
    }
  };

  const fetchTransaction = async () => {
    if (id) {
      try {
        const res = await api.get(`/transaction/${id}`);
        const trx = res.data;

        // Mengatur state form dengan data transaksi yang diambil
        setForm({
          type_transactions: trx.type_transactions || '',
          amount: trx.amount || 0,
          information: trx.information || '',
          status: trx.status || 'pending',
          weaponId: trx.weaponId ? trx.weaponId.toString() : '' // Pastikan weaponId diatur dengan benar
        });
      } catch (err) {
        console.error('Error fetching transaction:', err);
      }
    }
  };

  useEffect(() => {
    fetchWeapons();
    fetchTransaction();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      weaponId: parseInt(form.weaponId), // ensure it's a number
      userId: user.id
    };

    try {
      if (id) {
        await api.put(`/transaction/${id}`, payload);
      } else {
        await api.post('/add-transaction', payload);
      }
      navigate('/transactions');
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'Add'} Transaction</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Type</label>
          <select name="type_transactions" value={form.type_transactions} onChange={handleChange} className="w-full border px-2 py-1">
            <option value="">--Select--</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
        </div>

        <div className="mb-4">
          <label>Amount</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div className="mb-4">
          <label>Information</label>
          <input type="text" name="information" value={form.information} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>

        <div className="mb-4">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border px-2 py-1">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mb-4">
          <label>Weapon</label>
          <select name="weaponId" value={form.weaponId} onChange={handleChange} className="w-full border px-2 py-1">
            <option value="">--Select Weapon--</option>
            {weapons.map(w => (
              <option key={w.id} value={w.id.toString()}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? 'Update' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
