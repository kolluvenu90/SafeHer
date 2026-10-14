
import { useState } from 'react';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  
const [showIncidents, setShowIncidents] = useState(false);

const loadIncidents = async () => {
  try {
    const response = await fetch(
      'http://localhost:8081/api/incidents'
    );

    if (!response.ok) {
      throw new Error('Could not load incident reports');
    }

    const data = await response.json();
    setIncidents(data);
    setShowIncidents(true);
  } catch (error) {
    alert(error.message || 'Could not load incident reports.');
  }
};

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDashboard, setShowDashboard] = useState(false);

  // Authentication form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Connect React to the Spring Boot backend
  
  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthMessage('');
    setAuthLoading(true);

    const endpoint =
      authMode === 'login'
        ? 'http://localhost:8081/api/auth/login'
        : 'http://localhost:8081/api/auth/register';

    const userData =
      authMode === 'login'
        ? {
            email: authEmail,
            password: authPassword,
          }
        : {
            name: fullName,
            phone: phone,
            email: authEmail,
            password: authPassword,
          };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setAuthMessage(data.message || 'Request successful!');

if (authMode === 'login') {
  setShowAuth(false);
  setShowDashboard(true);
  loadIncidents();
}
    } catch (error) {
      console.error('Authentication error:', error);

      setAuthMessage(
        error instanceof TypeError
          ? 'Cannot connect to the backend. Check that Spring Boot is running and CORS is configured.'
          : error.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthMessage('');
    setShowAuth(true);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">SafeHer</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <button
            className="dashboard-nav-btn"
            onClick={() => {
  loadIncidents();
  setShowDashboard(true);
}}
          >
            Dashboard
          </button>
        </div>

        <button
          className="login-btn"
          onClick={() => openAuth('login')}
        >
          Login
        </button>
      </nav>

      {/* Home */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">
            WOMEN'S SAFETY &amp; EMERGENCY SUPPORT
          </p>

          <h1>
            Your Safety.
            <br />
            <span>Our Priority.</span>
          </h1>

          <p className="description">
            A platform designed to help women report safety incidents,
            manage emergency contacts, and follow response progress.
          </p>

          <button
            className="report-btn"
            onClick={() => setShowForm(true)}
          >
            Report an Incident
          </button>

          <p className="notice">
            Educational prototype — not a monitored emergency service.
          </p>
        </div>

        <div className="hero-card">
          <div className="heart">♡</div>
          <h2>You are not alone.</h2>
          <p>Safety, support, and awareness in one place.</p>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <p className="tagline">OUR FEATURES</p>
        <h2>Safety support, in one place</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <span>✚</span>
            <h3>Incident Reporting</h3>
            <p>Report and document safety incidents.</p>
          </div>

          <div className="feature-card">
            <span>⌖</span>
            <h3>Location Support</h3>
            <p>Provide a location for authorized responders.</p>
          </div>

          <div className="feature-card">
            <span>♡</span>
            <h3>Emergency Contacts</h3>
            <p>Keep trusted contacts organized.</p>
          </div>

          <div className="feature-card">
            <span>◷</span>
            <h3>Incident Tracking</h3>
            <p>Follow the progress of a submitted report.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about" id="about">
        <h2>How it works</h2>
        <p>
          Report an incident → Authorized review → Response assignment
          → Status updates
        </p>
      </section>

      <footer>
        <p>SafeHer | Women &amp; Public Safety Platform</p>
        <p>Student project prototype</p>
      </footer>

      {/* Incident reporting form */}
      {showForm && (
        <div className="modal-backdrop">
          <form
            className="incident-form"
            onSubmit={async (event) => {
  event.preventDefault();

  try {
    const category = event.target.category.value;
    const description = event.target.description.value;

    const response = await fetch(
      'http://localhost:8081/api/incidents',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save report');
    }

    alert('Incident report saved successfully!');
    setDescription('');
    setShowForm(false);
  } catch (error) {
    alert(error.message || 'Could not save incident report.');
  }
}}
          >
            <button
              type="button"
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <h2>Report an Incident</h2>
            <p>Provide details about the incident.</p>

            <label htmlFor="category">Incident category</label>
            <select id="category" required defaultValue="">
              <option value="" disabled>
                Select a category
              </option>
              <option value="harassment">Harassment</option>
              <option value="stalking">Stalking</option>
              <option value="unsafe-location">Unsafe Location</option>
              <option value="other">Other</option>
            </select>

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the incident..."
              required
            />

            <button type="submit" className="report-btn">
              Submit Demo Report
            </button>
          </form>
        </div>
      )}

      {/* Login and registration */}
      {showAuth && (
        <div className="modal-backdrop">
          <form
            className="incident-form auth-form"
            onSubmit={handleAuth}
          >
            <button
              type="button"
              className="close-button"
              onClick={() => {
                setShowAuth(false);
                setAuthMessage('');
              }}
            >
              ✕
            </button>

            <h2>Welcome to SafeHer</h2>
            <p>Safety and support start here.</p>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('login');
                  setAuthMessage('');
                }}
              >
                Login
              </button>

              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('register');
                  setAuthMessage('');
                }}
              >
                Register
              </button>
            </div>

            {authMode === 'register' && (
              <>
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                />

                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  required
                />
              </>
            )}

            <label htmlFor="authEmail">Email address</label>
            <input
              id="authEmail"
              type="email"
              placeholder="Enter your email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="authPassword">Password</label>
            <input
              id="authPassword"
              type="password"
              placeholder="Enter your password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              autoComplete={
                authMode === 'login' ? 'current-password' : 'new-password'
              }
              minLength={8}
              required
            />

            <button
              type="submit"
              className="report-btn"
              disabled={authLoading}
            >
              {authLoading
                ? 'Please wait...'
                : authMode === 'login'
                  ? 'Login'
                  : 'Create Account'}
            </button>

            {authMessage && (
              <p className="auth-note" role="status" aria-live="polite">
                {authMessage}
              </p>
            )}

            <p className="auth-note">
              Prototype: real account authentication is not implemented yet.
            </p>
          </form>
        </div>
      )}

      {/* Dashboard */}
      {showDashboard && (
        <div className="modal-backdrop">
          <section className="dashboard-panel">
            <button
              type="button"
              className="close-button"
              onClick={() => setShowDashboard(false)}
            >
              ✕
            </button>

            <p className="tagline">YOUR SAFEHER DASHBOARD</p>
            <h2>Welcome to SafeHer</h2>
            <p>Manage your safety information in one place.</p>

            <div className="dashboard-stats">
              <article className="dashboard-card">
                <span>📋</span>
                <h3>My Incidents</h3>
                <p>{incidents.length} reports submitted</p>
              </article>

              <article className="dashboard-card">
                <span>♡</span>
                <h3>Emergency Contacts</h3>
                <p>No contacts added yet</p>
              </article>

              <article className="dashboard-card">
                <span>◷</span>
                <h3>Latest Status</h3>
                <p>No active incidents</p>
              </article>
            </div>

            
              
            
<div className="incident-list">
  <h3>Saved Incident Reports</h3>

  {incidents.length === 0 ? (
    <p>No incident reports found.</p>
  ) : (
    incidents.map((incident, index) => (
      <article className="dashboard-card" key={incident.id ?? index}>
        <h4>{incident.incident_type || incident.category || 'Incident'}</h4>
        <p>{incident.description || 'No description provided.'}</p>
      </article>
    ))
  )}
</div>


            <button
              className="report-btn"
              onClick={() => {
                setShowDashboard(false);
                setShowForm(true);
              }}
            >
              Report an Incident
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
