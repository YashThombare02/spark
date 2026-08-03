import { useGetLikes } from "@workspace/api-client-react";
import { Heart, Loader2, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Likes() {
  const { data: likes = [], isLoading } = useGetLikes();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="pt-safe px-6 h-20 flex items-center sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10">
        <h1 className="text-2xl font-bold">Likes You Sent</h1>
      </header>

      <main className="p-6">
        {likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No likes yet</h3>
            <p className="text-muted-foreground max-w-[250px] mb-8">
              Start swiping to find people who catch your eye.
            </p>
            <Link href="/" className="h-12 px-6 brand-gradient rounded-xl text-white font-bold flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all">
              Discover People
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likes.map((user, i) => (
              <div 
                key={user.id} 
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <img 
                  src={user.profileImage} 
                  alt={user.fullName} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold truncate">{user.fullName}</span>
                    <span className="font-light">{user.age}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{user.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}