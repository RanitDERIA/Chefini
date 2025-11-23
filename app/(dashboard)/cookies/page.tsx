import { Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black border-4 border-chefini-yellow p-8">
        <div className="flex items-center gap-3 mb-6">
          <Cookie size={40} className="text-chefini-yellow" />
          <h1 className="text-4xl font-black text-chefini-yellow">COOKIE POLICY</h1>
        </div>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-black text-white mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-chefini-yellow mb-2">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, authentication, and session management. Without these 
                  cookies, Chefini cannot function properly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-chefini-yellow mb-2">Preference Cookies</h3>
                <p>
                  These cookies remember your choices and preferences (like dietary restrictions and 
                  favorite recipes) to provide a more personalized experience.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-chefini-yellow mb-2">Analytics Cookies</h3>
                <p>
                  We use analytics cookies to understand how visitors interact with our website. 
                  This helps us improve our service and user experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">3. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Google OAuth for authentication</li>
              <li>Groq AI for recipe generation</li>
              <li>MongoDB Atlas for data storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">4. Managing Cookies</h2>
            <p>
              You can control and manage cookies in your browser settings. However, please note that 
              disabling cookies may affect the functionality of Chefini and prevent you from using 
              certain features.
            </p>
            <div className="mt-3 p-4 bg-chefini-yellow bg-opacity-10 border-2 border-chefini-yellow">
              <p className="text-sm">
                <strong className="text-chefini-yellow">Note:</strong> Most web browsers allow some 
                control of cookies through browser settings. To find out more about cookies, including 
                how to see what cookies have been set and how to manage and delete them, visit 
                www.aboutcookies.org or www.allaboutcookies.org.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">5. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. Please revisit this page 
              periodically to stay informed about our use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-white text-black border-2 border-black">
              <p className="font-bold">Email: <a href="bytebardderia@gmail.com">bytebardderia@gmail.com</a></p>
              <p className="text-sm mt-1">We typically respond within 24-48 hours.</p>
            </div>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-6 border-t border-gray-700">
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