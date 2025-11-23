'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChefHat, 
  Sparkles, 
  Leaf, 
  Brain, 
  Users,
  Heart,
  Check,
  Zap,
  Wand2,
  UtensilsCrossed,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Wand2,
      title: 'The "Mom\'s Hands" Magic',
      description: 'Digitizing that motherly intuition. We see a feast where others see an empty fridge.'
    },
    {
      icon: Brain,
      title: 'Integrated AI',
      description: 'Our engine improvises. No tomato? Use tamarind. No cream? Use cashew paste. It knows the substitutions.'
    },
    {
      icon: Leaf,
      title: 'Bin to Banquet',
      description: 'In our culture, throwing food is a sin. We help you turn vegetable peels and leftover rice into gold.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join a community sharing secrets on how to turn "Yesterday\'s Leftover" into "Today\'s Feast".'
    }
  ];

  const benefits = [
    'Turn "Scraps" into Delicacies',
    'Stop the "What to cook?" struggle',
    'Master the art of Tarka & Phoron',
    'Save money for the Fish Market',
    'Cook with intuition, not strict rules',
    'Respect every grain of rice'
  ];

  return (
    <div className="min-h-screen bg-chefini-black font-sans text-black">
      {/* Navigation */}
      <nav className="border-b-4 border-chefini-yellow bg-black px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center relative">
          <div className="flex items-center gap-2 group cursor-pointer z-50">
            <ChefHat size={32} className="text-chefini-yellow group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-3xl font-black tracking-tighter text-chefini-yellow">CHEFINI</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4">
            <Link
              href="/login"
              className="px-6 py-2 font-bold border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              LOGIN
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 font-bold border-2 border-black bg-chefini-yellow text-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all"
            >
              START ALCHEMY
            </Link>
          </div>

          {/* Mobile Menu Toggle with Smooth Rotation */}
          <button 
            className="md:hidden text-chefini-yellow p-1 z-50 relative transition-transform duration-300 ease-in-out"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown with Smooth Slide/Fade 
            Note: We use absolute positioning relative to the nav container
        */}
        <div 
          className={`
            md:hidden absolute top-full left-0 w-full bg-black border-b-4 border-chefini-yellow p-6 flex flex-col gap-4 shadow-xl z-40
            transition-all duration-300 ease-in-out origin-top
            ${isMenuOpen 
              ? 'opacity-100 translate-y-0 visible' 
              : 'opacity-0 -translate-y-5 invisible pointer-events-none'}
          `}
        >
           <Link
            href="/login"
            className="w-full text-center px-6 py-3 font-bold border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
          >
            LOGIN
          </Link>
          <Link
            href="/signup"
            className="w-full text-center px-6 py-3 font-bold border-2 border-chefini-yellow bg-chefini-yellow text-black shadow-brutal"
          >
            START ALCHEMY
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-chefini-yellow font-bold border-2 border-black mb-6 transform -rotate-2">
                <Wand2 size={20} />
                <span>THE KITCHEN ALCHEMIST</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] text-black">
                DON'T JUST COOK. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-chefini-yellow to-orange-600">PERFORM MAGIC.</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed font-medium border-l-4 border-chefini-yellow pl-6">
                Remember how Mom could open an "empty" fridge and make a feast? We digitized that intuition. Turn your scraps and lonely veggies into gold.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 font-black text-lg border-4 border-black bg-chefini-yellow text-black shadow-brutal-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal transition-all flex items-center gap-2"
                >
                  CREATE MAGIC
                  <Sparkles size={24} />
                </Link>
                
                <Link
                  href="#features"
                  className="px-8 py-4 font-black text-lg border-4 border-black text-black hover:bg-black hover:text-white transition-colors"
                >
                  THE STORY
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Zero Waste</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">100% Soulful</span>
                </div>
              </div>
            </div>

            {/* Dynamic Recipe Card Visualization */}
            <div className="relative group perspective-1000">
              <div className="bg-black border-4 border-chefini-yellow p-8 shadow-brutal-lg transform transition-transform group-hover:rotate-1 duration-500">
                <div className="border-b-2 border-dashed border-chefini-yellow pb-4 mb-4 flex justify-between items-center">
                  <h3 className="text-xl font-black text-chefini-yellow flex items-center gap-2">
                    <UtensilsCrossed size={20}/> ALCHEMIZED RESULT
                  </h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 font-bold border border-white transform rotate-3">SAVED FROM BIN</span>
                </div>
                
                <h4 className="text-4xl font-black text-white mb-2 leading-none">
                  Royal Fish Head Dal
                </h4>
                <p className="text-gray-400 text-sm italic mb-6">"We don't throw away the head. We roast it into a wedding feast."</p>
                
                <div className="space-y-3 mb-8 bg-gray-900 p-4 border-2 border-gray-800">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Input Scraps:</p>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span className="line-through text-gray-500 decoration-2">Fish Head (Waste)</span>
                    <span className="text-chefini-yellow font-bold">→ The Flavor Bomb</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span className="line-through text-gray-500 decoration-2">Plain Lentils</span>
                    <span className="text-chefini-yellow font-bold">→ Golden Gravy</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Check size={16} className="text-green-400" />
                    <span className="line-through text-gray-500 decoration-2">Whole Spices</span>
                    <span className="text-chefini-yellow font-bold">→ Royal Aroma</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t-2 border-dashed border-gray-700">
                  <div>
                    <div className="text-2xl font-black text-white">1</div>
                    <div className="text-[10px] font-bold text-chefini-yellow uppercase">Part Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">45m</div>
                    <div className="text-[10px] font-bold text-chefini-yellow uppercase">Prep Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white">High</div>
                    <div className="text-[10px] font-bold text-chefini-yellow uppercase">Value Created</div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 w-20 h-20 bg-chefini-yellow border-4 border-black flex items-center justify-center rotate-12 shadow-brutal z-20">
                  <Sparkles size={36} className="text-black" />
                </div>
              </div>
              
              {/* Decorative background blob */}
              <div className="absolute inset-0 bg-chefini-yellow transform translate-x-4 translate-y-4 -z-10 border-4 border-black"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black border-b-4 border-chefini-yellow relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4 text-white">
              THE <span className="text-chefini-yellow">TOOLS</span> OF ALCHEMY
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built to digitize the resourceful eye of a master home cook.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:bg-chefini-yellow hover:border-chefini-yellow hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-black border-2 border-black flex items-center justify-center mb-4 text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-black mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Manifesto Section */}
      <section className="py-20 bg-chefini-yellow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-black text-white inline-block px-4 py-1 font-bold border-2 border-black mb-4 rotate-1">
                THE MANIFESTO
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-black leading-none">
                FAILURE OF <br/> IMAGINATION? <br/>
                <span className="text-white text-stroke-black">NEVER AGAIN.</span>
              </h2>
              <p className="text-xl text-black mb-8 font-bold border-l-4 border-black pl-6">
                She taught us that throwing away food wasn't just a loss of money, it was a missed opportunity for magic. Chefini ensures you never miss that opportunity.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/50 p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all cursor-default">
                    <div className="w-6 h-6 bg-black flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-chefini-yellow font-black" />
                    </div>
                    <span className="text-lg font-black text-black uppercase">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 mt-12 md:mt-0">
              {/* Stat 1 */}
              <div className="bg-white border-4 border-black p-8 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-black text-white">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-3xl font-black">10,000+</h3>
                </div>
                <p className="font-bold text-gray-600">"Empty Fridges" Transformed</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-black border-4 border-black p-8 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all transform md:translate-x-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-chefini-yellow text-black border-2 border-white">
                    <Leaf size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-white">2,500kg</h3>
                </div>
                <p className="font-bold text-gray-400">Food Saved from the Bin</p>
              </div>

               {/* Stat 3 */}
               <div className="bg-white border-4 border-black p-8 shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm transition-all">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-red-500 text-white border-2 border-black">
                    <Heart size={24} />
                  </div>
                  <h3 className="text-3xl font-black">5,000+</h3>
                </div>
                <p className="font-bold text-gray-600">Alchemists in the Kitchen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Grey */}
      <section className="py-32 bg-zinc-900 border-t-4 border-black relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 rotate-12"><ChefHat size={120} className="text-white"/></div>
             <div className="absolute bottom-10 right-10 -rotate-12"><Wand2 size={120} className="text-white"/></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-none">
            READY TO MAKE <br />
            <span className="text-chefini-yellow">SOMETHING OUT OF NOTHING?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 font-medium max-w-2xl mx-auto">
            Join Chefini today. Give us your leftovers, your stale bread, and your lonely veggies. We'll give you magic.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link
              href="/signup"
              className="w-full md:w-auto inline-flex justify-center items-center gap-3 px-12 py-6 font-black text-xl border-4 border-chefini-yellow bg-chefini-yellow text-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
            >
              <ChefHat size={28} />
              START COOKING FREE
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500 font-bold uppercase tracking-widest">
            No Credit Card • Instant Magic • Free Forever
          </p>
        </div>
      </section>

      {/* Footer - Black with Yellow Border Top */}
      <footer className="border-t-4 border-chefini-yellow bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ChefHat size={32} className="text-chefini-yellow" />
            <span className="text-3xl font-black text-white tracking-tighter">CHEFINI</span>
          </div>
          <p className="text-gray-500 text-sm mb-6 font-medium">
            "To a child, this wasn't just cooking—it was alchemy."
          </p>
          <div className="w-24 h-1 bg-gray-800 mx-auto mb-6"></div>
          <p className="text-gray-400 text-sm mb-2">
            Made with <Heart size={16} className="inline text-red-500 fill-red-500 mx-1" /> by <a href='https://profession-folio.vercel.app/' target='_blank'><b>RanitDERIA</b></a>
          </p>
          <p className="text-gray-600 text-xs mt-4">
            &copy; {new Date().getFullYear()} Chefini. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}