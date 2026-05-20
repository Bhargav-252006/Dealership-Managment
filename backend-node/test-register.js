const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:8000/api/register/', {
      username: 'testuser123',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      phone: '9876543210',
      email: 'test@example.com',
      business_type: 'Grocery'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
testRegister();
