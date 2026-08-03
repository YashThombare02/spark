import { useState, useEffect } from "react";
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { 
  useDiscoverUsers, 
  useRecordSwipe,
  getDiscoverUsersQueryKey,
  getGetLikesQueryKey,
  getGetMatchesQueryKey,
  getGetUserStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { X, Star, Heart, BadgeCheck, MapPin, Sparkles, Loader2, Flame } from "lucide-react";
import { User, SwipeResult } from "@workspace/api-client-react/src/generated/api.schemas";

// Match Modal Component
function MatchModal({ matchedUser, onClose }: { matchedUser: User, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center px-6"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[150vw] h-[150vw] brand-gradient opacity-20 rounded-full blur-[100px] animate-pulse" />
      </div>
      
      <motion.div 
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        <h2 className="text-4xl font-extrabold italic brand-gradient-text mb-8 tracking-tight">It's a Match!</h2>
        
        <div className="relative mb-8">
          <motion.div 
            initial={{ x: -40, rotate: -10, opacity: 0 }}
            animate={{ x: -20, rotate: -5, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-32 h-40 rounded-2xl border-4 border-background overflow-hidden shadow-2xl relative z-0"
          >
            <div className="absolute inset-0 brand-gradient opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 40, rotate: 10, opacity: 0 }}
            animate={{ x: 20, rotate: 5, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-32 h-40 rounded-2xl border-4 border-background overflow-hidden shadow-2xl absolute top-0 z-10 origin-bottom-right"
          >
            <img src={matchedUser.profileImage} alt={matchedUser.fullName} className="w-full h-full object-cover" />
          </motion.div>
        </div>
        
        <p className="text-lg text-foreground font-medium mb-8">
          You and <span className="font-bold">{matchedUser.fullName}</span> have liked each other.
        </p>
        
        <div className="w-full space-y-3">
          <button 
            onClick={onClose}
            className="w-full h-14 brand-gradient rounded-xl text-white font-bold text-[15px] shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Send a Message
          </button>
          <button 
            onClick={onClose}
            className="w-full h-14 bg-transparent border-2 border-primary/20 text-primary font-bold text-[15px] rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useDiscoverUsers();
  const recordSwipe = useRecordSwipe();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchResult, setMatchResult] = useState<SwipeResult | null>(null);

  const activeUsers = Array.isArray(users) ? users.slice(currentIndex) : [];
  
  const handleSwipe = async (userId: number, action: 'like' | 'pass' | 'superlike') => {
    setCurrentIndex(prev => prev + 1);
    
    recordSwipe.mutate({
      data: { targetUserId: userId, action }
    }, {
      onSuccess: (result) => {
        // Invalidate queries to update matches, likes, stats
        queryClient.invalidateQueries({ queryKey: getGetLikesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMatchesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetUserStatsQueryKey() });
        
        if (result.isMatch) {
          setMatchResult(result);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <header className="pt-safe px-6 h-20 flex items-center justify-center z-10">
        <div className="flex items-center gap-2 text-primary">
          <Flame className="w-7 h-7 fill-current" />
          <span className="text-xl font-extrabold tracking-tight brand-gradient-text">Spark</span>
        </div>
      </header>

      {/* Cards Area */}
      <div className="flex-1 relative flex items-center justify-center px-4 w-full max-w-md mx-auto">
        <AnimatePresence>
          {activeUsers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8"
            >
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">You're all caught up!</h3>
              <p className="text-muted-foreground">Check back later for more people who share your vibe.</p>
            </motion.div>
          ) : (
            activeUsers.slice(0, 2).reverse().map((user, idx) => {
              const isFront = idx === 1; // Since reversed, index 1 is the front card (if 2 cards exist)
              const isOnlyCard = activeUsers.length === 1;
              const isTopCard = isFront || isOnlyCard;
              
              return (
                <Card 
                  key={user.id} 
                  user={user} 
                  isFront={isTopCard}
                  onSwipe={(dir) => {
                    const action = dir === 'right' ? 'like' : dir === 'up' ? 'superlike' : 'pass';
                    handleSwipe(user.id, action);
                  }}
                />
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {activeUsers.length > 0 && (
        <div className="h-28 pb-4 flex items-center justify-center gap-6 z-10 px-6 max-w-md mx-auto w-full">
          <button 
            onClick={() => handleSwipe(activeUsers[0].id, 'pass')}
            className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:scale-110 hover:text-red-500 transition-all active:scale-90"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
          
          <button 
            onClick={() => handleSwipe(activeUsers[0].id, 'superlike')}
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-border shadow-lg flex items-center justify-center text-blue-500 hover:scale-110 hover:text-blue-400 transition-all active:scale-90"
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={() => handleSwipe(activeUsers[0].id, 'like')}
            className="w-16 h-16 rounded-full brand-gradient shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:scale-110 transition-all active:scale-90"
          >
            <Heart className="w-7 h-7 fill-current" />
          </button>
        </div>
      )}

      {/* Match Modal */}
      <AnimatePresence>
        {matchResult?.isMatch && matchResult.matchedUser && (
          <MatchModal 
            matchedUser={matchResult.matchedUser} 
            onClose={() => setMatchResult(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Draggable Card Component
function Card({ 
  user, 
  isFront, 
  onSwipe 
}: { 
  user: User; 
  isFront: boolean;
  onSwipe: (direction: 'left'|'right'|'up') => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (e: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    } else if (info.offset.y < -swipeThreshold) {
      onSwipe('up');
    } else {
      // Return to center
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      style={{
        x: isFront ? x : 0,
        y: isFront ? y : 0,
        rotate: isFront ? rotate : 0,
        scale: isFront ? 1 : 0.95,
        y: isFront ? y : 15,
        opacity: isFront ? opacity : 1,
        zIndex: isFront ? 10 : 0,
      }}
      drag={isFront ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full aspect-[3/4] max-h-[65vh] rounded-3xl overflow-hidden shadow-xl bg-card border border-border touch-none"
    >
      <img 
        src={user.profileImage} 
        alt={user.fullName} 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />
      
      {/* Gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Swipe Indicators */}
      {isFront && (
        <>
          <motion.div 
            style={{ opacity: likeOpacity }} 
            className="absolute top-10 left-10 border-4 border-green-500 text-green-500 rounded-xl px-4 py-1 text-4xl font-extrabold uppercase tracking-wider rotate-[-15deg]"
          >
            Like
          </motion.div>
          <motion.div 
            style={{ opacity: nopeOpacity }} 
            className="absolute top-10 right-10 border-4 border-red-500 text-red-500 rounded-xl px-4 py-1 text-4xl font-extrabold uppercase tracking-wider rotate-[15deg]"
          >
            Nope
          </motion.div>
          <motion.div 
            style={{ opacity: superLikeOpacity }} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-blue-500 text-blue-500 rounded-xl px-4 py-1 text-3xl font-extrabold uppercase tracking-wider"
          >
            Super
          </motion.div>
        </>
      )}

      {/* Info Block */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl font-bold">{user.fullName}</h2>
              <span className="text-2xl font-light">{user.age}</span>
              {user.verified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-white" />}
            </div>
            <div className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{user.city}</span>
            </div>
          </div>
          {user.isOnline && (
            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {user.interests.slice(0, 3).map((interest, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/10 text-white">
              {interest}
            </span>
          ))}
          {user.interests.length > 3 && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/80">
              +{user.interests.length - 3}
            </span>
          )}
        </div>
        
        <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>
      </div>
    </motion.div>
  );
}