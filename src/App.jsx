import { Routes, Route } from 'react-router-dom';
import ProdutoPage from './pages/ProdutoPage';
import Home from './pages/home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:nome" element={<ProdutoPage />} />
    </Routes>
  );
}
