import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Maman de Lucas, 9 ans",
      content: "Lucas a créé son premier jeu en 3 semaines ! Il est passionné et moi je peux suivre ses progrès facilement. Parfait !",
      rating: 5,
      avatar: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759134563079_0233b1df.webp"
    },
    {
      name: "Thomas Martin",
      role: "Papa de Emma et Noah",
      content: "Mes deux enfants adorent leurs parcours respectifs. Emma fait du design, Noah du Python. Le dashboard parent est génial.",
      rating: 5,
      avatar: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759134564765_f8edca8b.webp"
    },
    {
      name: "Sophie Laurent",
      role: "Maman de Chloé, 14 ans",
      content: "Enfin une plateforme qui prend la cybersécurité au sérieux ! Chloé a appris à protéger ses données personnelles.",
      rating: 5,
      avatar: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759134566459_015e7c52.webp"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que disent les parents
          </h2>
          <p className="text-xl text-gray-600">
            Plus de 2,500 familles nous font confiance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 relative">
              <Quote className="w-8 h-8 text-blue-500 mb-4" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-semibold">4.9/5</span>
            <span>sur 847 avis parents</span>
          </div>
          <p className="text-sm text-gray-500">
            Rejoignez les milliers de familles qui font confiance à NumériKids
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;