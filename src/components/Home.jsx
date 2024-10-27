import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [friends, setFriends] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post('http://localhost:7000/api/user/v1/get-users-info', {}, {
            headers: {
              'Authorization': token
            }
          });
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        setError('Authentication failed. Please log in.');
        console.error('Authentication failed:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      const fetchFriends = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:7000/api/user/v1/get-users', {
            headers: {
              'Authorization': token
            }
          });
          setFriends(response.data.data);
        } catch (error) {
          console.error('Error fetching friends:', error);
        }
      };

      fetchFriends();
    }
  }, [authenticated]);

  const handleFriendClick = async (username) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch('http://localhost:7000/api/user/v1/claim-points', { username }, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 400) {
        console.log('User is not registered yet');
      } else {
        const updatedUser = response.data.data;
        setFriends(prevFriends => prevFriends.map(friend =>
          friend.username === username ? { ...friend, Points: updatedUser.Points } : friend
        ));
      }
    } catch (error) {
      console.error('Error claiming points:', error);
    }
  };

  if (!authenticated) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Friends List</h1>
    <ul className="space-y-4">
      {friends.map((friend, index) => (
        <li key={index} className="bg-white p-4 rounded shadow-md cursor-pointer flex justify-between" onClick={() => handleFriendClick(friend.username)}>
          <div className="w-1/3 text-lg font-semibold">{friend.username}</div>
          <div className="w-1/3 text-gray-600 text-center">Rank: {index + 1}</div>
          <div className="w-1/3 text-orange-500 text-right">Points: {friend.Points}</div>
        </li>
      ))}
    </ul>
  </div>
  );
};

export default Home;