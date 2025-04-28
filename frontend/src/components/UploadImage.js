import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Upload.css';

function UploadImage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/image/auth', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          console.log("our res " + res)

        } catch (err) {
          alert(err.response.data.error);
          navigate("/");
        }
      };
      checkAuth();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', file);
    try {
      await axios.post('http://localhost:5000/api/image/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Image uploaded!');
      navigate('/gallery');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <div className="upload-container">
    <h2>Upload Bird Image</h2>
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      <button type="submit">Upload</button>
    </form>
    <button className="view-gallery-btn" onClick={() => navigate('/gallery')}>
      View Gallery
    </button>
  </div>
  );
}

export default UploadImage;