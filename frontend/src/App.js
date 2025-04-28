import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UploadImage from './components/UploadImage';
import ImageGallery from './components/ImageGallery';
import Header from './components/Header';

function App() {
  return (
    <Router>
        <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/upload" element={<UploadImage />} />
        <Route path="/gallery" element={<ImageGallery />} />
      </Routes>
    </Router>
  );
}

export default App;