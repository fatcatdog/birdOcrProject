import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../styles/ImageGallery.css';

function ImageGallery() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/image/gallery', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setImages(res.data);
      } catch (err) {
        alert(err.response.data.error);
        navigate("/");
      }
    };
    fetchImages();
  }, []);

  return (
     // Add a class to the outer container
     <div className="image-gallery-section">
     <h2>Your Bird Images</h2>
     {/* Add a class to the grid container */}
     <div className="image-grid">
       {/* Check if imageList is empty */}
       {images.length === 0 ? (
         <p>No images found.</p> // Display a message if no images
       ) : (
        images.map((img) => (
           <img
             key={img._id}
             // Add a class to the image element
             className="gallery-image"
             src={`http://localhost:5000${img.imageUrl}`} // Ensure your server/port is correct
             alt="Bird"
             // Removed inline styles - width/height will be handled by CSS
           />
         ))
       )}
     </div>
   </div>
  );
}

export default ImageGallery;