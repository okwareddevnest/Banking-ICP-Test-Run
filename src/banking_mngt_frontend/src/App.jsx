import React, { useState } from 'react';
import { banking_mngt_backend } from 'declarations/banking_mngt_backend';
import { AuthClient } from '@dfinity/auth-client';

function App() {
  const [owner, setOwner] = useState('');
  const [accountId, setAccountId] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [transaction, setTransaction] = useState({ from: '', to: '', amount: '' });
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleCreateAccount = async () => {
    try {
      const id = await banking_mngt_backend.create_account(owner);
      setAccountId(id);
      setMessage(`Account created with ID: ${id}`);
    } catch (error) {
      setMessage(`Error creating account: ${error.message}`);
    }
  };

  const handleGetAccountDetails = async () => {
    try {
      const details = await banking_mngt_backend.get_account_with_history(accountId);
      setAccountDetails(details);
    } catch (error) {
      setMessage(`Error fetching account details: ${error.message}`);
    }
  };

  const handleProcessTransaction = async () => {
    try {
      const result = await banking_mngt_backend.process_transaction(
        parseInt(transaction.from),
        parseInt(transaction.to),
        parseFloat(transaction.amount)
      );
      if (result.Ok) {
        setMessage('Transaction successful');
      } else {
        setMessage(`Transaction failed: ${result.Err}`);
      }
    } catch (error) {
      setMessage(`Error processing transaction: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      onSuccess: () => {
        setIsAuthenticated(true);
        setMessage('Logged in successfully');
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Banking Management System</h1>
      {!isAuthenticated ? (
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        >
          Log in with Internet Identity
        </button>
      ) : (
        <>
          <section className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Create Account</h2>
            <input
              type="text"
              placeholder="Owner Name"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleCreateAccount}
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              Create Account
            </button>
          </section>

          <section className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Account Details</h2>
            <input
              type="number"
              placeholder="Account ID"
              value={accountId || ''}
              onChange={(e) => setAccountId(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleGetAccountDetails}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Get Account Details
            </button>
            {accountDetails && (
              <div className="mt-4">
                <p>Owner: {accountDetails[0].owner}</p>
                <p>Balance: {accountDetails[0].balance}</p>
                <h3 className="font-semibold mt-2">Transaction History</h3>
                <ul className="list-disc pl-5">
                  {accountDetails[1].map((tx, index) => (
                    <li key={index}>
                      From: {tx.from_account}, To: {tx.to_account}, Amount: {tx.amount}, Timestamp: {tx.timestamp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Process Transaction</h2>
            <input
              type="number"
              placeholder="From Account ID"
              value={transaction.from}
              onChange={(e) => setTransaction({ ...transaction, from: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              placeholder="To Account ID"
              value={transaction.to}
              onChange={(e) => setTransaction({ ...transaction, to: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleProcessTransaction}
              className="bg-red-500 text-white py-2 px-4 rounded"
            >
              Process Transaction
            </button>
          </section>

          {message && <p className="text-red-500 mt-4">{message}</p>}
        </>
      )}
    </div>
  );
}

export default App;
