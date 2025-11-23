export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black border-4 border-chefini-yellow p-8">
        <h1 className="text-4xl font-black mb-6 text-chefini-yellow">PRIVACY POLICY</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-black text-white mb-3">1. Information We Collect</h2>
            <p>
              Chefini collects information you provide directly, including your name, email address, 
              and recipe preferences. We also collect usage data to improve our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to provide personalized recipe recommendations, save your cookbook, 
              and improve our AI-powered features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">3. Data Security</h2>
            <p>
              Your data is encrypted and stored securely using industry-standard practices. 
              We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">4. Your Rights</h2>
            <p>
              You have the right to access, modify, or delete your personal data at any time. 
              Contact us at <a href="bytebardderia@gmail.com">bytebardderia@gmail.com</a> for assistance.
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