import { useGetMatches } from "@workspace/api-client-react";
import { MessageCircle, MapPin, Loader2 } from "lucide-react";

export default function Matches() {
  const { data: matches = [], isLoading } = useGetMatches();

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
        <h1 className="text-2xl font-bold">Messages</h1>
      </header>

      <main className="p-4">
        {/* New Matches Row */}
        <section className="mb-8">
          <h2 className="px-2 text-sm font-bold text-primary uppercase tracking-wider mb-4">New Matches</h2>
          {matches.length === 0 ? (
            <div className="px-2 py-8 flex flex-col items-center justify-center text-center bg-muted/50 rounded-2xl border border-border border-dashed">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Keep swiping to get matches</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
              {matches.map((match, i) => (
                <div 
                  key={match.id} 
                  className="flex flex-col items-center gap-2 flex-shrink-0 animate-in fade-in slide-in-from-right-8"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img 
                          src={match.user.profileImage} 
                          alt={match.user.fullName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                    {match.user.isOnline && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <span className="text-xs font-semibold">{match.user.fullName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Messages List (using matches as placeholder for conversations) */}
        <section>
          <h2 className="px-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Conversations</h2>
          {matches.length > 0 && (
            <div className="space-y-1">
              {matches.map((match, i) => (
                <div 
                  key={match.id} 
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${(i + matches.length) * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={match.user.profileImage} 
                        alt={match.user.fullName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base truncate">{match.user.fullName}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(match.matchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{match.user.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}