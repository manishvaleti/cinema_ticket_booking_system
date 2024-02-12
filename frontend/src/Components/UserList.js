import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>Username:</strong> {user.username}<br />
            <strong>Email:</strong> {user.email}<br />
            <strong>Address:</strong> {user.address}<br />
            <strong>Phone Number:</strong> {user.phone_number}<br />
            <strong>Pic: </strong> <img height="50px" width= "50px" src={`http://127.0.0.1:8000${user.photo}`} alt="User's Profile Pic" /><br />
            <br />

            {/* Add other user fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
