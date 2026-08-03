import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Moon, Sun, X, Plus } from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  
  const { data: user, isLoading } = useGetMe();
  const updateMutation = useUpdateMe();

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (user) {
      setBio(user.bio);
      setCity(user.city);
      setInterests(user.interests);
    }
  }, [user]);

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") return;
    e.preventDefault();
    
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSave = () => {
    updateMutation.mutate({
      data: { bio, city, interests }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast.success("Profile Updated", {
          description: "Your changes have been saved.",
        });
        setLocation("/profile");
      },
      onError: () => {
        toast.error("Error", {
          description: "Failed to update profile."
        });
      }
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="pt-safe px-6 h-20 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="text-primary font-bold text-sm"
        >
          {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
        </button>
      </header>

      <main className="p-6 flex-1 overflow-y-auto">
        {/* Appearance Settings */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Appearance</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                  {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <span className="font-semibold">Dark Mode</span>
              </div>
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`w-14 h-8 rounded-full transition-colors relative flex items-center px-1 ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Profile Details */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Profile Details</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Location</label>
            <input 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-14 px-4 bg-card border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">About Me</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-32 p-4 bg-card border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium resize-none"
              placeholder="Write a little about yourself..."
            />
            <div className="text-right text-xs text-muted-foreground pr-1">
              {bio.length}/500
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold ml-1">Interests</label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {interests.map((interest) => (
                <div key={interest} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                  <span className="text-sm font-semibold">{interest}</span>
                  <button 
                    onClick={() => handleRemoveInterest(interest)}
                    className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleAddInterest}
                className="flex-1 h-12 px-4 bg-card border border-border rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium"
                placeholder="Add an interest..."
              />
              <button 
                onClick={handleAddInterest}
                disabled={!newInterest.trim()}
                className="h-12 px-4 bg-primary text-white rounded-xl font-bold flex items-center gap-1 disabled:opacity-50 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}