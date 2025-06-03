import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const TransactionList = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transaction');
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transaction/${id}`);
        setTransactions(transactions.filter(trx => trx.id !== id));
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Failed to delete transaction.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const canModify = () => {
    return ['admin', 'petugas'].includes(user?.role);
  };

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-green-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-4 text-xl">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            <i className="fas fa-list-alt text-green-400 mr-4"></i>Transaction List
          </h1>
          {canModify() && (
            <Link
              to="/add-transaction"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              <i className="fas fa-plus mr-2"></i> Add Transaction
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center font-medium mb-6">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}

        {transactions.length === 0 && !loading && !error ? (
          <div className="text-center text-gray-500 text-xl py-10 border border-dashed border-gray-700 rounded-lg bg-gray-800">
            <i className="fas fa-info-circle text-4xl mb-4"></i>
            <p>No transactions found.</p>
            {canModify() && (
              <p className="mt-4">
                <Link to="/add-transaction" className="text-green-500 hover:underline">
                  Add a new transaction
                </Link> to get started!
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg border border-green-700/30">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Information
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Weapon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  {canModify() && (
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-700 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {trx.type_transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {trx.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {trx.information}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trx.status)} text-white`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {trx.weapon ? trx.weapon.name : 'N/A'} {/* Access weapon.name */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {trx.user ? trx.user.name : 'N/A'} {/* Access user.name */}
                    </td>
                    {canModify() && (
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <Link
                          to={`/transaction/${trx.id}`}
                          className="text-blue-500 hover:text-blue-400 mr-3 transition duration-150 ease-in-out"
                          title="Edit Transaction"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(trx.id)}
                          className="text-red-500 hover:text-red-400 transition duration-150 ease-in-out"
                          title="Delete Transaction"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;