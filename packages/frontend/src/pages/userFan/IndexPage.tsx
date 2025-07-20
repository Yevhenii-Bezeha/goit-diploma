import { Button } from '../../components/shared';
import { trackButtonClick, ButtonClickEvents } from '../../utils/analytics';

const IndexPage = () => {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-end space-x-4">
        <Button
          onClick={() => {
            trackButtonClick(ButtonClickEvents.OPEN_MOBILE_MENU, 'index_page');
            handleNavigation('/for-artists');
          }}
          title="I am an artist"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        />
        <Button
          onClick={() => {
            trackButtonClick(ButtonClickEvents.OPEN_MOBILE_MENU, 'index_page');
            handleNavigation('/login');
          }}
          title="Login"
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-lg"
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Listener-Driven
            <br />
            <span className="text-purple-400">Micro-Donations</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-3xl mx-auto">
            A Research Prototype for Fair Artist Compensation in Music Streaming
          </p>

          {/* Concept Explanation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Research Concept</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white text-center md:text-left">Connect Spotify</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  Fans connect their Spotify account to automatically track listening patterns and support their favorite artists.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white text-center md:text-left">Set Monthly Budget</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  Fans allocate a monthly "pie" budget that gets distributed to artists based on actual listening time.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white text-center md:text-left">Fair Distribution</h3>
                <p className="text-purple-200 text-sm leading-relaxed">
                  Artists receive direct payments proportional to their share of fan listening time, bypassing traditional streaming models.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <p className="text-purple-200 text-lg">
              Experience the future of artist compensation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  trackButtonClick(ButtonClickEvents.OPEN_MOBILE_MENU, 'index_page');
                  handleNavigation('/login');
                }}
                title="Start Listening & Supporting"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-purple-300 text-sm">
          © {new Date().getFullYear()} University Research Project - Listener-Driven Micro-Donations
        </p>
        <p className="text-purple-400 text-xs mt-2">
          Academic Prototype for System Design and Evaluation
        </p>
      </footer>
    </div>
  );
};

export default IndexPage;
