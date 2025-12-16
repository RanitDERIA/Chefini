import Link from 'next/link';
import {
  Heart,
  Github,
  Linkedin,
  Mail,
  Code,
  ChefHat,
  Brain
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-4 border-chefini-yellow bg-black text-white pt-16 pb-32 md:pb-8" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Narrative */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <ChefHat size={32} className="text-chefini-yellow transform -rotate-12" />
              <span className="text-3xl font-black tracking-tighter text-chefini-white">CHEFINI</span>
            </div>

            <p className="text-gray-400 max-w-md leading-relaxed mb-6">
              The soul of a mother's intuition, digitized. We help you look at a handful of random scraps and see a table full of love instead of a bin full of waste.
              <br /><br />
              <span className="text-chefini-yellow font-bold">Don't just cook. Perform Alchemy.</span>
            </p>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Crafted with</span>
              <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
              <span className="text-gray-500">by</span>
              <span className="font-bold text-white border-b-2 border-chefini-yellow"><a href='https://profession-folio.vercel.app/' target='_blank'>Ranit Deria</a></span>
            </div>
          </div>

          {/* The Laboratory (Quick Links) */}
          <div>
            <h3 className="font-black text-xl mb-6 text-chefini-yellow flex items-center gap-2">
              QUICK LINKS
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white hover:pl-2 transition-all font-bold inline-block">
                  Generate Magic
                </Link>
              </li>
              <li>
                <Link href="/cookbook" className="text-gray-400 hover:text-white hover:pl-2 transition-all font-bold inline-block">
                  My Cookbook
                </Link>
              </li>
              <li>
                <Link href="/shopping-list" className="text-gray-400 hover:text-white hover:pl-2 transition-all font-bold inline-block">
                  Shopping List
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white hover:pl-2 transition-all font-bold inline-block">
                  Discover
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Boring Stuff */}
          <div>
            <h3 className="font-black text-xl mb-6 text-chefini-yellow">LEGAL</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white font-bold">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white font-bold">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white font-bold">Cookie Policy</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white font-bold">The Story</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-dashed border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Chefini. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Made in India. Zero Waste. 100% Flavor.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="https://github.com/RanitDERIA"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-zinc-900 border-2 border-zinc-800 text-white hover:bg-chefini-yellow hover:text-black hover:border-black hover:-translate-y-1 transition-all"
                title="GitHub"
              >
                <Github size={20} />
              </a>

              <a
                href="https://www.linkedin.com/in/ranit-deria-916864257/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-zinc-900 border-2 border-zinc-800 text-white hover:bg-blue-600 hover:text-white hover:border-black hover:-translate-y-1 transition-all"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>

              <a
                href="mailto:bytebardderia@gmail.com"
                className="p-3 bg-zinc-900 border-2 border-zinc-800 text-white hover:bg-red-500 hover:text-white hover:border-black hover:-translate-y-1 transition-all"
                title="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>


        </div>

      </div>
    </footer>
  );
}