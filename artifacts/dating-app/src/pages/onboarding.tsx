import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Sparkles, User, Calendar, Heart, PartyPopper } from "lucide-react";

const HOBBIES = [
  "Photography", "Traveling", "Gym", "Cooking", "Gaming", 
  "Hiking", "Art", "Music", "Reading", "Dancing"
];

const LOOKING_FOR_OPTIONS = [
  { id: "casual", label: "Something Casual", icon: PartyPopper },
  { id: "hookup", label: "Hookup", icon: Sparkles },
  { id: "relationship", label: "Relationship", icon: Heart },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  
  // Step 1 state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  
  // Step 2 state
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd save this data, but for this fake UI we just redirect
    setLocation("/");
  };

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev => 
      prev.includes(hobby) 
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col px-6 pt-16 pb-12 w-full max-w-md mx-auto relative z-10">
        
        {/* Progress Bar */}
        <div className="w-full flex gap-2 mb-10">
          <div className="h-1.5 flex-1 rounded-full bg-primary" />
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step === 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">About you</h1>
                <p className="text-muted-foreground">Let's start with the basics to help others get to know you better.</p>
              </div>

              <form onSubmit={handleNext} className="flex-1 flex flex-col">
                <div className="space-y-5 flex-1">
                  
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 px-4 rounded-xl border border-border bg-white dark:bg-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      placeholder="e.g. Alex"
                    />
                  </div>

                  {/* Age Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full h-14 px-4 rounded-xl border border-border bg-white dark:bg-zinc-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                      placeholder="18+"
                    />
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">I identify as</label>
                    <div className="flex gap-3">
                      {['Male', 'Female', 'Other'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 h-12 rounded-xl border text-sm font-semibold transition-all ${
                            gender === g 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border bg-white dark:bg-zinc-900 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!name || !age || !gender}
                  className="w-full h-14 mt-8 brand-gradient rounded-xl text-white font-bold text-[15px] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-8 relative">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="absolute -top-12 -left-2 p-2 text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Your Vibe</h1>
                <p className="text-muted-foreground">What are you into and what are you looking for here?</p>
              </div>

              <form onSubmit={handleFinish} className="flex-1 flex flex-col">
                <div className="space-y-8 flex-1">
                  
                  {/* Looking For */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">I'm looking for...</label>
                    <div className="flex flex-col gap-3">
                      {LOOKING_FOR_OPTIONS.map(option => {
                        const Icon = option.icon;
                        const isSelected = lookingFor === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setLookingFor(option.id)}
                            className={`w-full h-16 px-4 rounded-xl border flex items-center gap-4 transition-all ${
                              isSelected 
                                ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                                : "border-border bg-white dark:bg-zinc-900 hover:border-primary/40"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "brand-gradient text-white" : "bg-muted text-muted-foreground"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center justify-between">
                      My Interests
                      <span className="text-xs text-muted-foreground font-normal">Pick up to 5</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {HOBBIES.map(hobby => {
                        const isSelected = selectedHobbies.includes(hobby);
                        return (
                          <button
                            key={hobby}
                            type="button"
                            onClick={() => toggleHobby(hobby)}
                            disabled={!isSelected && selectedHobbies.length >= 5}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                              isSelected 
                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20" 
                                : "border-border bg-white dark:bg-zinc-900 text-muted-foreground hover:border-primary/40 disabled:opacity-50"
                            }`}
                          >
                            {hobby}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={!lookingFor || selectedHobbies.length === 0}
                  className="w-full h-14 mt-8 brand-gradient rounded-xl text-white font-bold text-[15px] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                >
                  Find my Spark
                  <Sparkles className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
