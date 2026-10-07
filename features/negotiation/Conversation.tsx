"use client";
import Image from "next/image";
import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { rules } from "@/config/marketplace-rules";
import { unsafeMessage, type Role, type Thread } from "./model";
import { SafetyWarning, type Run } from "./OfferForm";
import { useDraft } from "./store";

export function Conversation({ listingId, thread, role, run, blocked }: { listingId: string; thread?: Thread; role: Role; run: Run; blocked: boolean }) {
  const [body, setBody] = useDraft(`${role}:${listingId}`);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acknowledge, setAcknowledge] = useState(false);
  const risky = unsafeMessage(body);
  return <section className="ws-deal-panel ws-deal-stack" aria-label="Conversation">
    <h2>Conversation</h2>
    <p className="ws-deal-notice">Keep payment and chat on WorldStore. Only payments made through WorldStore are covered.</p>
    <div role="log" aria-label="Messages" className="ws-deal-messages" aria-relevant="additions">
      {!thread?.messages.length && <p className="ws-deal-muted">Ask about the item, agree the details, and keep everything in one place.</p>}
      {thread?.messages.map((m) => <article key={m.id} className="ws-deal-message" data-own={m.role === role}>
        <p className="ws-deal-muted">{m.role === "buyer" ? "Buyer" : "Seller"} · <time dateTime={new Date(m.at).toISOString()}>{new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: rules.time.zone }).format(m.at)} WAT</time> · Saved on this device</p>
        <p>{m.body}</p>
        <div className="ws-deal-photos">{m.photos.map((photo, i) => <Image key={i} src={photo} alt={`Attached photo ${i + 1}`} width={160} height={120} unoptimized />)}</div>
        {m.flagged && <p className="ws-deal-muted">Safety warning acknowledged. Payment outside WorldStore is not covered.</p>}
      </article>)}
    </div>
    <form className="ws-deal-stack" onSubmit={(e) => { e.preventDefault(); run({ type: "message", id: crypto.randomUUID(), body, photos, acknowledge }, () => { setBody(""); setPhotos([]); setAcknowledge(false); setError(""); }); }}>
      <div className="ws-deal-actions">{["Is this still available?", "Can you deliver to my area?", "Could you share more photos?"].map((text) => <button key={text} type="button" className={buttonClass({ variant: "quiet", size: "sm" })} disabled={blocked} onClick={() => setBody(text)}>{text}</button>)}</div>
      <label className="ws-field">Message<textarea value={body} onChange={(e) => { setBody(e.target.value); setAcknowledge(false); }} maxLength={rules.messaging.maxChars} rows={3} disabled={blocked} aria-describedby="message-help" /></label>
      <p id="message-help" className="ws-deal-muted">{body.length}/{rules.messaging.maxChars} characters. Your text draft stays on this device.</p>
      <label className="ws-field">Attach photos<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={blocked || loading} onChange={async (e) => {
        const files = Array.from(e.target.files ?? []); e.target.value = ""; setError("");
        if (files.length + photos.length > rules.messaging.maxPhotos || files.some((f) => f.size > rules.messaging.photoMaxBytes || !["image/png", "image/jpeg", "image/webp"].includes(f.type))) { setError(`Choose up to ${rules.messaging.maxPhotos} PNG, JPEG or WebP photos, each under ${rules.messaging.photoMaxBytes / 1_000_000} MB.`); return; }
        setLoading(true);
        try {
          const data = await Promise.all(files.map((file) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Photo could not be read. Choose it again to retry.")); reader.readAsDataURL(file); })));
          setPhotos((old) => [...old, ...data]);
        } catch (e) { setError(e instanceof Error ? e.message : "Photo could not be read."); } finally { setLoading(false); }
      }} /></label>
      {error && <p role="alert" className="ws-field__error">{error}</p>}
      {loading && <p role="status">Reading photos…</p>}
      <div className="ws-deal-photos">{photos.map((photo, i) => <div key={i}><Image src={photo} alt={`Photo ${i + 1} to attach`} width={100} height={80} unoptimized /><button type="button" className={buttonClass({ variant: "quiet", size: "sm" })} onClick={() => setPhotos(photos.filter((_, n) => n !== i))}>Remove photo {i + 1}</button></div>)}</div>
      {risky && <SafetyWarning checked={acknowledge} change={setAcknowledge} />}
      {blocked && <p>This seller is blocked. Unblock them to send messages.</p>}
      <button className={buttonClass({})} disabled={blocked || loading || (risky && !acknowledge)}>Send message</button>
    </form>
  </section>;
}
