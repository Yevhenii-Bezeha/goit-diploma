import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '../assets/icons/logo.svg?url';

const ArtistTermsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'agreement', title: 'Research Project Agreement' },
    { id: 'services', title: '1. Research System for Artists' },
    { id: 'verification', title: '2. Artist Verification (Research)' },
    { id: 'payments', title: '3. Simulated Payments & Distributions' },
    { id: 'legal-tax', title: '4. Research Context & Legal Status' },
    { id: 'fees', title: '5. Research Fees & Simulated Transactions' },
    { id: 'refunds', title: '6. Research Prototype Limitations' },
    { id: 'unclaimed', title: '7. Research Data & Unclaimed Simulations' },
    { id: 'misc', title: '8. Academic Research Terms' },
    { id: 'contact', title: 'Research Team Contact' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={logoSvg}
              alt="Listener-Driven Micro-Donations"
              className="h-8 w-auto"
              style={{ filter: 'brightness(0) saturate(100%)' }}
            />
            <span className="text-xl font-semibold text-gray-900">Artist Research Terms</span>
          </div>
          <div className="text-sm text-gray-600">
            Academic Research Project
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col w-80 max-w-xs bg-white h-full shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Table of Contents</h3>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20 h-screen overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                <nav>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                        >
                          {section.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                  <p><strong>Research Project:</strong></p>
                  <p>Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation</p>
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={() => scrollToSection('agreement')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ↑ Back to top
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="prose prose-lg max-w-none">
            <div id="agreement">
              <h1 className="text-4xl font-bold text-gray-900 mb-8">Listener-Driven Micro-Donations: Artist Terms of Service</h1>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Academic Research Notice:</strong> This is an academic research prototype for "Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation"
                  presented as part of a university diploma project. This system is designed for research and demonstration purposes only.
                  No actual financial transactions occur in this research prototype.
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">RESEARCH PROJECT AGREEMENT</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research project investigates listener-driven micro-donations in music streaming through a prototype system.
                By participating in this research as an artist, you acknowledge that this is an academic study and agree to
                participate in accordance with these research terms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research prototype is designed to simulate how artists could receive direct financial support from fans
                based on listening data. However, this is for research purposes only and does not involve actual financial transactions.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                These terms constitute a research participation agreement between you and the university research team.
                By using this research prototype, you consent to participate in this academic study investigating
                listener-driven micro-donation systems.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">Research Definitions:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>"Pie" refers to the simulated monthly budget or contribution set by a research participant to support artists.</li>
                <li>"Virtual Wallet" means a simulated digital balance used to demonstrate fund distribution.</li>
                <li>"Claimed Artist" means an artist or entity that has completed the research verification process.</li>
              </ul>
            </div>

            <div id="services">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">1. RESEARCH SYSTEM FOR ARTISTS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research prototype enables artists to participate in a simulated system where they could receive fan support
                based on streaming engagement metrics. This is for research evaluation purposes only.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">Research features:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>
                  Verification & Eligibility: Artist ownership verification via simplified research methods;
                  confirmation of participation in the research study.
                </li>
                <li>
                  Analytics & Reporting: Simulated fan support analytics for research analysis and detailed
                  distribution reports for research evaluation.
                </li>
                <li>
                  Simulated Payments & Management: Demonstration of payment processing concepts (no actual payments);
                  simulated team funds management for research purposes.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                For research purposes, the system demonstrates how labels could receive aggregated payouts with detailed
                transaction reports, grouping individual fan contributions by artist for research analysis.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Fan Customization & Exclusions: Research participants may apply filters to their simulated Pie allocations.
                You acknowledge that this research prototype applies these filters for demonstration purposes;
                the research team is not liable for any simulated artist exclusions or reduced payouts resulting from
                research participant-selected filters.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Research Limitations: This is a prototype system with limitations typical of research software.
                Features may be modified or discontinued as the research project evolves.
              </p>
            </div>

            <div id="verification">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">2. ARTIST VERIFICATION (RESEARCH)</h2>

              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2.1 Research Artist Verification Process</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                To participate in this research study, artists and their authorized representatives must complete a simplified
                verification process designed for research purposes. This process is designed to confirm association with a
                Spotify artist profile for research analysis, but it does not constitute a legal or biometric identity check.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">The research verification relies on simplified methods:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>
                  <strong>Basic Verification:</strong> Simple verification process for research participation purposes.
                </li>
                <li>
                  <strong>Metadata Matching:</strong> Uses publicly available metadata from services such as
                  MusicBrainz and Spotify to associate streaming activity with artist entities for research analysis.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">By participating in the research, you represent and warrant the following:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>
                  You are either the artist, a member of the artist's team, or a legally authorized representative.
                </li>
                <li>
                  You consent to participate in this academic research study investigating listener-driven micro-donations.
                </li>
                <li>
                  You understand this is a research prototype and no actual financial transactions will occur.
                </li>
                <li>
                  You agree to provide accurate information for research purposes.
                </li>
                <li>
                  You agree not to use the research system for any fraudulent or unauthorized purposes.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                <strong>Research Disclaimer:</strong> This research prototype does not independently verify your legal identity
                or contractual rights beyond the research methods listed above. The research team is not liable for research
                participation issues except in cases of gross negligence.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2.2 Research Participation Rights</h3>
              <p className="text-gray-700 leading-relaxed mb-4">As a research participant:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>
                  Your participation is voluntary and you may withdraw at any time.
                </li>
                <li>
                  You have the right to access your research data and request deletion.
                </li>
                <li>
                  You may contact the research team with any questions about your participation.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2.3 Research Data Collection</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                For research purposes, we collect and analyze your interaction with the prototype system to evaluate
                the effectiveness of listener-driven micro-donation concepts. All data is anonymized for research analysis.
              </p>
            </div>

            <div id="payments">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">3. SIMULATED PAYMENTS & DISTRIBUTIONS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research prototype simulates how funds could be distributed to artists based on fan listening data.
                No actual financial transactions occur in this research study.
              </p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>
                  <strong>Simulated Distribution:</strong> The system demonstrates how verified artists could receive
                  simulated funds based on research participant listening data.
                </li>
                <li>
                  <strong>Virtual Wallet Simulation:</strong> Simulated allocations are held in a virtual wallet
                  for research demonstration purposes.
                </li>
                <li>
                  <strong>Research Analysis:</strong> Distribution patterns are analyzed for research evaluation
                  and academic publication.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-6">
                The research team is not liable for any simulated value fluctuations or virtual balances during the research period.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4"><strong>Research Data Analysis:</strong></p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>Research data may be analyzed for academic purposes.</li>
                <li>You may be asked to provide feedback on the research system.</li>
                <li>Research findings may be published in academic format.</li>
              </ul>
            </div>

            <div id="legal-tax">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">4. RESEARCH CONTEXT & LEGAL STATUS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research prototype is designed for academic study and does not involve actual financial transactions.
                No tax implications arise from participation in this research study.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                You acknowledge that this is a research prototype and that the research team acts only as facilitators
                of the research study. No commercial relationship is established through participation in this research.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research is conducted in accordance with university research ethics guidelines and applicable
                data protection laws.
              </p>
            </div>

            <div id="fees">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">5. RESEARCH FEES & SIMULATED TRANSACTIONS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                This research prototype simulates a 5% service fee concept for demonstration purposes. No actual fees
                are charged or collected in this research study.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                All simulated transactions are for research analysis only and do not represent actual financial exchanges.
              </p>
            </div>

            <div id="refunds">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">6. RESEARCH PROTOTYPE LIMITATIONS</h2>
              <p className="text-gray-700 leading-relaxed mb-4">This research prototype has the following limitations:</p>
              <ul className="list-disc pl-8 mb-6 text-gray-700">
                <li>No actual financial transactions occur.</li>
                <li>System availability is not guaranteed and may be modified during research.</li>
                <li>Features may be limited or changed as the research project evolves.</li>
                <li>This is demonstration software and may contain bugs or errors typical of research prototypes.</li>
              </ul>
            </div>

            <div id="unclaimed">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">7. RESEARCH DATA & UNCLAIMED SIMULATIONS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Simulated funds held in virtual wallets for research purposes may be reset or modified as the research
                project progresses. Research data will be retained in accordance with university research policies.
              </p>
            </div>

            <div id="misc">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">8. ACADEMIC RESEARCH TERMS</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                These research terms are governed by university research ethics guidelines and applicable data protection laws.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The research team is not liable for research participation issues due to force majeure events.
                No provision here creates a commercial partnership, joint venture, or employment relationship.
                Force majeure events include, but are not limited to, natural disasters, acts of war or terrorism,
                government regulation, internet or telecommunications failures, and third-party service interruptions.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The research team can modify research procedures, verification methods, and prototype features at any time
                to comply with research ethics guidelines or academic requirements.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Research findings and aggregated, anonymized data may be published in academic journals, presentations,
                and thesis documentation.
              </p>
            </div>

            <div id="contact">
              <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6">RESEARCH TEAM CONTACT</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">Academic Research Project</p>
                <p className="text-gray-700 mb-2">
                  <strong>Research Project:</strong> Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Academic Institution:</strong> [University Name]
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Research Type:</strong> Academic Thesis Project
                </p>
                <p className="text-gray-700 text-sm">
                  For questions about this research project, please contact the research team at the university.
                  All communications will be handled in accordance with academic research standards.
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-8 p-4 bg-gray-100 rounded">
              <p><strong>Research Project:</strong> Listener-Driven Micro-Donations in Music Streaming: A System Design and Evaluation</p>
              <p><strong>Academic Institution:</strong> [University Name]</p>
              <p><strong>Research Type:</strong> Academic Thesis Project</p>
              <p><strong>Purpose:</strong> System Design and Evaluation Research</p>
              <p><strong>Data Protection:</strong> Conducted in accordance with university research ethics guidelines</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ArtistTermsPage;

