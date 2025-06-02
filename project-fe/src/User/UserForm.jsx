import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserForm = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'petugas',
  });

  const fetchUser = async () => {
    const res = await api.get(`/users/${id}`);
    setForm({ ...res.data, password: '' }); // jgn tampilkan password
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await api.put(`/update-user/${id}`, form);
    } else {
      await api.post('/users/add', form);
    }
    navigate('/users');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? 'Edit' : 'Add'} User</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label>Password {id ? '(Kosongkan jika tidak diubah)' : ''}</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border px-2 py-1" />
        </div>
        <div className="mb-4">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full border px-2 py-1">
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
            <option value="pengawas">Pengawas</option>
          </select>
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          {id ? 'Update' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
