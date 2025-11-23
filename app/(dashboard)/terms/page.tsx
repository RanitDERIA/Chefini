export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black border-4 border-chefini-yellow p-8">
        <h1 className="text-4xl font-black mb-6 text-chefini-yellow">TERMS OF SERVICE</h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-black text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Chefini, you accept and agree to be bound by these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">2. Use License</h2>
            <p>
              Permission is granted to use Chefini for personal, non-commercial purposes.
              You may not redistribute or sell content from this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">3. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining account security and for all activities under their account.
              AI-generated recipes should be reviewed for food safety and dietary restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">4. Disclaimer</h2>
            <p>
              Recipe suggestions are AI-generated and should be used as inspiration. Always verify ingredients
              and cooking methods for safety. Chefini is not liable for any health issues resulting from recipes.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}