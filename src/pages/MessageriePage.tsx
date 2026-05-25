import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/auth-session";
import { ROLE_ASSOC_LABELS, type RoleAssoc } from "@/lib/supabase-helpers";
import emptyMessages from "@/assets/empty-messages.png";

type Author = {
  id: string;
  nom: string;
  prenoms: string;
  photo_url: string | null;
  role_assoc: RoleAssoc | null;
  is_admin?: boolean;
};

type Message = {
  id: string;
  profile_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  author?: Author;
  unread?: boolean;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const initials = (a?: Author) =>
  a ? `${a.prenoms[0] ?? ""}${a.nom[0] ?? ""}`.toUpperCase() : "?";

const MessageriePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = getSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) {
      navigate("/connexion");
    }
  }, [session, navigate]);

  // Initial load
  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(500);
      const list = (msgs as Message[]) ?? [];
      setMessages(list);

      // Load authors
      const ids = Array.from(new Set(list.map((m) => m.profile_id)));
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles_public" as any)
          .select("id, nom, prenoms, photo_url, role_assoc")
          .in("id", ids);
        const map: Record<string, Author> = {};
        ((profs as Author[]) ?? []).forEach((p) => (map[p.id] = p));
        setAuthors(map);
      }

      // Load read state
      const { data: reads } = await supabase
        .from("message_reads")
        .select("message_id")
        .eq("profile_id", session.profileId);
      setReadIds(new Set(((reads as any[]) ?? []).map((r) => r.message_id)));
    })();
  }, [session]);

  // Realtime new messages
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("messages-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (!authors[msg.profile_id]) {
            const { data } = await supabase
              .from("profiles_public" as any)
              .select("id, nom, prenoms, photo_url, role_assoc")
              .eq("id", msg.profile_id)
              .maybeSingle();
            if (data) setAuthors((a) => ({ ...a, [(data as Author).id]: data as Author }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          const id = (payload.old as Message).id;
          setMessages((prev) => prev.filter((m) => m.id !== id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, authors]);

  // Sort: unread first then chronological
  const sorted = useMemo(() => {
    const withFlag = messages.map((m) => ({
      ...m,
      unread: !readIds.has(m.id) && m.profile_id !== session?.profileId,
    }));
    const unread = withFlag.filter((m) => m.unread);
    const read = withFlag.filter((m) => !m.unread);
    return [...read, ...unread];
  }, [messages, readIds, session]);

  // Auto-mark visible messages as read after a moment
  useEffect(() => {
    if (!session) return;
    const unread = messages
      .filter((m) => !readIds.has(m.id) && m.profile_id !== session.profileId)
      .map((m) => m.id);
    if (!unread.length) return;
    const t = setTimeout(async () => {
      try {
        await supabase.functions.invoke("mark-messages-read", {
          body: { profileId: session.profileId, password: session.password, messageIds: unread },
        });
        setReadIds((prev) => {
          const next = new Set(prev);
          unread.forEach((id) => next.add(id));
          return next;
        });
      } catch {}
    }, 1500);
    return () => clearTimeout(t);
  }, [messages, readIds, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sorted.length]);

  const send = async () => {
    if (!session || !content.trim()) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("post-message", {
        body: { profileId: session.profileId, password: session.password, action: "create", content },
      });
      if (error || data?.error) throw new Error(data?.error || "Erreur d'envoi");
      setContent("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!session) return;
    if (!confirm("Supprimer ce message ?")) return;
    try {
      const { data, error } = await supabase.functions.invoke("post-message", {
        body: { profileId: session.profileId, password: session.password, action: "delete", messageId: id },
      });
      if (error || data?.error) throw new Error(data?.error || "Erreur");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (!session) return null;

  const unreadCount = messages.filter((m) => !readIds.has(m.id) && m.profile_id !== session.profileId).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-header py-6 px-4 border-b-4 border-accent">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary-foreground flex items-center gap-3">
              <MessageCircle className="w-7 h-7" />
              Messagerie du groupe
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Les nouveaux messages apparaissent en priorité
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm font-bold">
              {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-40">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <img src={emptyMessages} alt="" width={240} height={180} className="mx-auto opacity-80" />
            <p className="mt-6 text-muted-foreground font-sans">
              Aucun message pour le moment. Soyez le premier à écrire !
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((m) => {
              const a = authors[m.profile_id];
              const mine = m.profile_id === session.profileId;
              return (
                <li
                  key={m.id}
                  className={`flex gap-3 rounded-xl p-4 border transition-all ${
                    m.unread
                      ? "border-accent/60 bg-accent/5 shadow-md ring-1 ring-accent/30"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                      {a?.photo_url ? (
                        <img src={a.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary">{initials(a)}</span>
                      )}
                    </div>
                    {m.unread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-semibold text-foreground">
                        {a ? `${a.prenoms} ${a.nom.toUpperCase()}` : "Membre"}
                      </span>
                      {a?.role_assoc && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                          <Crown className="w-3 h-3" />
                          {ROLE_ASSOC_LABELS[a.role_assoc]}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">{formatTime(m.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">{m.content}</p>
                    {mine && (
                      <button
                        onClick={() => remove(m.id)}
                        className="mt-2 text-xs text-destructive/80 hover:text-destructive inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Supprimer
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
            <div ref={bottomRef} />
          </ul>
        )}
      </div>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2 items-end">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrire un message au groupe..."
            rows={1}
            className="resize-none min-h-[44px] max-h-32"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={sending || !content.trim()} className="h-11 px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageriePage;
