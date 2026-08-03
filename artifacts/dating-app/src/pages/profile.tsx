import { useGetMe, useGetUserStats, useLogout } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Settings, LogOut, Heart, MessageCircle, Star, Eye, MapPin, Loader2, BadgeCheck } from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: stats, isLoading: isStatsLoading } = useGetUserStats();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      }
    });
  };

  if (isUserLoading || isStatsLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !stats) return null;

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="pt-safe px-6 h-20 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link href="/settings" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors">
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      <main className="p-6 pb-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
              <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
            </div>
            {user.verified && (
              <div className="absolute bottom-1 right-1 bg-background rounded-full p-0.5">
                <BadgeCheck className="w-7 h-7 text-blue-500" />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              {user.fullName}, <span className="font-light">{user.age}</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{user.city}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.likesSent}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Likes Sent</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <MessageCircle className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.matches}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Matches</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.superLikes}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Super Likes</div>
            </div>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.profileViews}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Views</div>
            </div>
          </div>
        </div>

        {/* Bio & Interests */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-12 duration-700">
          <h3 className="font-bold text-lg mb-3">About Me</h3>
          <p className="text-muted-foreground leading-relaxed mb-6">{user.bio}</p>
          
          <h3 className="font-bold text-lg mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-foreground">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full h-14 bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[15px] rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-[0.98]"
        >
          {logoutMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Sign Out
        </button>
      </main>
    </div>
  );
}