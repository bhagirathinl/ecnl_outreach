import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">ECNL Outreach</h1>
              </div>
              <div className="flex space-x-4 items-center">
                <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                  Home
                </Link>
                <Link to="/profile" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                  Profile
                </Link>
                <Link to="/colleges" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                  Colleges
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/colleges" element={<CollegesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Home Page
function HomePage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to ECNL Outreach Platform
      </h2>
      <p className="text-gray-600 mb-6">
        Connect with college scouts and manage your recruitment journey for ECNL Phoenix 2025.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
          <p className="text-gray-600">
            Build your player profile with stats, videos, and academic info.
          </p>
        </div>
        <div className="border rounded-lg p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Browse Colleges</h3>
          <p className="text-gray-600">
            Explore 76 colleges attending ECNL Phoenix event.
          </p>
        </div>
        <div className="border rounded-lg p-6 hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">AI Outreach</h3>
          <p className="text-gray-600">
            Generate personalized emails with AI assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Page
function ProfilePage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Profile</h2>
      <p className="text-gray-600">
        Create and manage your player profile here. (Coming soon)
      </p>
    </div>
  );
}

// Colleges Page
function CollegesPage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Colleges</h2>
      <p className="text-gray-600">
        Explore colleges attending ECNL Phoenix 2025. (Coming soon)
      </p>
    </div>
  );
}

export default App;
