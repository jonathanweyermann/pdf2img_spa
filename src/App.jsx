import { Route, Routes, useParams } from 'react-router';
import Nav from './components/Nav';
import Footer from './components/Footer';
import ScrollManager from './components/ScrollManager';
import Home from './pages/Home';
import Results from './pages/Results';
import About from './pages/About';
import NotFound from './pages/NotFound';
import { RecentUploadsProvider } from './state/RecentUploads';

// Remount results when switching between conversions so polling state resets.
function ResultsRoute() {
  const { index } = useParams();
  return <Results key={index} index={Number(index)} />;
}

export default function App({ validateHistory = true }) {
  return (
    <RecentUploadsProvider validate={validateHistory}>
      <ScrollManager />
      <div className="app">
        <Nav />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/uploaded/:index" element={<ResultsRoute />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </RecentUploadsProvider>
  );
}
