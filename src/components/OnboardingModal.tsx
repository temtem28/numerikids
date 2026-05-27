import React, { useState } from 'react';
import { X, ArrowRight, User, Baby, Gamepad2, Code } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    selectedCourse: ''
  });

  const courses = [
    { id: 'scratch', name: 'Scratch - Mes premiers jeux', age: '7-12 ans', icon: <Gamepad2 className="w-6 h-6" /> },
    { id: 'python', name: 'Python pour débutants', age: '13-16 ans', icon: <Code className="w-6 h-6" /> },
    { id: 'cyber', name: 'Cybersécurité Junior', age: '7-16 ans', icon: <User className="w-6 h-6" /> }
  ];

  if (!isOpen) return null;

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 1 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Créons votre compte parent</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Votre prénom"
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Votre email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={nextStep}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profil de votre enfant</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Prénom de votre enfant"
                value={formData.childName}
                onChange={(e) => setFormData({...formData, childName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={formData.childAge}
                onChange={(e) => setFormData({...formData, childAge: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Âge de votre enfant</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={7 + i}>{7 + i} ans</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Retour
              </button>
              <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Choisissez le premier parcours</h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setFormData({...formData, selectedCourse: course.id})}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.selectedCourse === course.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {course.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.age}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                Retour
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Commencer !
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;