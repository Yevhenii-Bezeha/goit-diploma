import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPieActiveQuery } from '../../redux/userFan';

const SuccessCheckoutPage = () => {
  const navigate = useNavigate();

  // Poll for pie creation after payment
  const pieQuery = useGetPieActiveQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });
  const { data: { data: pieData } = {}, isError } = pieQuery;

  useEffect(() => {
    // Start polling for pie creation immediately
    let pollCount = 0;
    const maxPolls = 5; // Stop polling after 5 attempts
    let pollTimer: NodeJS.Timeout | null = null;

    const pollWithBackoff = async () => {
      if (pollCount >= maxPolls) {
        // If we've reached max polls and still no pie, navigate anyway
        navigate('/pie?fetchMissingTracks=1');
        return;
      }

      pollCount++;
      try {
        await pieQuery.refetch();
      } catch (error) {
        console.warn('Failed to refetch pie data:', error);
      }

      // Exponential backoff: 5s, 8s, 12s, 18s, 25s
      const delay = 5000 + pollCount * 3000;
      pollTimer = setTimeout(pollWithBackoff, delay);
    };

    // Start polling after 3 seconds to allow initial query to complete
    const initialTimer = setTimeout(() => {
      pollWithBackoff();
    }, 3000);

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [pieQuery, navigate]);

  useEffect(() => {
    // If pie is found during polling or there's an error, navigate immediately
    if (pieData || isError) {
      navigate('/pie?fetchMissingTracks=1');
      return;
    }

    // Fallback timer - redirect after 25 seconds if polling doesn't work
    const fallbackTimer = setTimeout(() => {
      navigate('/pie?fetchMissingTracks=1');
    }, 25000);

    return () => clearTimeout(fallbackTimer);
  }, [navigate, pieData, isError]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgb(34, 26, 46) 0%, rgb(33, 22, 62) 100%)',
        color: 'white',
      }}
    >
      {/* Enhanced Success Content */}
      <div className="max-w-md mx-auto">
        {/* Success Icon */}
        <div className="mb-8">
          <div
            style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)',
            }}
          >
            ✓
          </div>
        </div>

        {/* Academic Title and Description */}
        <div className="mb-8">
          <h1
            style={{
              marginBottom: '16px',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Micro-Donation Created!
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              lineHeight: '1.6',
              color: '#A78BFA'
            }}
          >
            Your listener-driven micro-donation is being set up.
            <br />
            We're analyzing your listening patterns to distribute your support.
          </p>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(139, 92, 246, 0.2)',
              borderTop: '4px solid #8B5CF6',
              borderRadius: '50%',
              animation: 'spin 1.5s linear infinite',
              margin: '0 auto 16px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
            }}
          ></div>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, color: '#A78BFA' }}>
            Processing your payment and setting up distribution...
          </p>
        </div>

        {/* Academic Information Box */}
        <div
          style={{
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginTop: '24px'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: '#A78BFA' }}>
            How It Works
          </h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>
            <p style={{ marginBottom: '8px' }}>
              • We track your Spotify listening patterns
            </p>
            <p style={{ marginBottom: '8px' }}>
              • Your monthly budget is distributed to artists based on listening time
            </p>
            <p>
              • Artists receive payments directly to their accounts
            </p>
          </div>
        </div>

        {/* Enhanced CSS Animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SuccessCheckoutPage;
