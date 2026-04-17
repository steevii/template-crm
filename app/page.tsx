"use client";
import { useEffect, useState, useCallback } from "react";

const STAGES: string[] = JSON.parse(process.env.NEXT_PUBLIC_PIPELINE_STAGES ?? '["Prospect","Qualifié","Proposition","Gagné"]');
const CUSTOM_FIELDS: string[] = JSON.parse(process.env.NEXT_PUBLIC_CUSTOM_FIELDS ?? "[]");
const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Mon Entreprise";
const TITLE = process.env.NEXT_PUBLIC_CRM_TITLE ?? "CRM";

const STAGE_COLORS: Record<string, string> = {
  Prospect: "#6366f1", Qualifié: "#3b82f6", Proposition: "#f59e0b",
  Gagné: "#10b981", Perdu: "#ef4444",
};
function stageColor(stage: string) { return STAGE_COLORS[stage] ?? "#8b5cf6"; }

interface Contact { id: string; name: string; company: string; stage: string; fields: Record<string, string>; }

export default function CRM() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  async function addContact() {
    if (!newName.trim()) return;
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), company: newCompany.trim(), stage: STAGES[0] }),
    });
    const contact = await res.json();
    setContacts((prev) => [...prev, contact]);
    setNewName(""); setNewCompany("");
  }

  async function moveStage(id: string, direction: 1 | -1) {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const idx = STAGES.indexOf(contact.stage);
    const next = STAGES[idx + direction];
    if (!next) return;
    setSaving(id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, stage: next } : c));
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: next }),
    });
    setSaving(null);
  }

  async function updateField(id: string, field: string, value: string) {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, fields: { ...c.fields, [field]: value } } : c));
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { [field]: value } }),
    });
  }

  async function deleteContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{COMPANY}</div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{TITLE}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addContact()}
            placeholder="Nom du contact..." style={{ border: "1px solid #d1d5db", borderRadius: "0.375rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none", width: "160px" }} />
          <input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addContact()}
            placeholder="Entreprise..." style={{ border: "1px solid #d1d5db", borderRadius: "0.375rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none", width: "130px" }} />
          <button onClick={addContact} style={{ background: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
            + Ajouter
          </button>
        </div>
      </header>

      {/* Kanban */}
      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
          Chargement des contacts...
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", gap: "1rem", padding: "1.5rem", overflowX: "auto" }}>
          {STAGES.map((stage) => {
            const stageContacts = contacts.filter((c) => c.stage === stage);
            return (
              <div key={stage} style={{ minWidth: "260px", flex: "0 0 260px", background: "white", borderRadius: "0.75rem", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "0.75rem 1rem", background: stageColor(stage), color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{stage}</span>
                  <span style={{ background: "rgba(255,255,255,0.3)", borderRadius: "1rem", padding: "0.1rem 0.5rem", fontSize: "0.75rem" }}>{stageContacts.length}</span>
                </div>
                <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {stageContacts.map((c) => (
                    <div key={c.id} onClick={() => setSelected(c)}
                      style={{ background: saving === c.id ? "#f0f9ff" : "#f9fafb", border: `1px solid ${saving === c.id ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: "0.5rem", padding: "0.75rem", cursor: "pointer" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.1rem" }}>{c.name}</div>
                      {c.company && <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.company}</div>}
                      <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
                        {STAGES.indexOf(c.stage) > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); moveStage(c.id, -1); }}
                            style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: "pointer" }}>←</button>
                        )}
                        {STAGES.indexOf(c.stage) < STAGES.length - 1 && (
                          <button onClick={(e) => { e.stopPropagation(); moveStage(c.id, 1); }}
                            style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: "pointer" }}>→</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageContacts.length === 0 && (
                    <div style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "center", padding: "1rem 0" }}>Vide</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: "white", borderRadius: "0.75rem", padding: "1.5rem", width: "400px", maxWidth: "90vw" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{selected.name}</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => deleteContact(selected.id)}
                  style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "0.375rem", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.8rem" }}>
                  Supprimer
                </button>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
              </div>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              Étape : <strong style={{ color: stageColor(selected.stage) }}>{selected.stage}</strong>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>Entreprise</label>
              <input defaultValue={selected.company} onBlur={(e) => {
                  const val = e.target.value;
                  setContacts((prev) => prev.map((c) => c.id === selected.id ? { ...c, company: val } : c));
                  fetch(`/api/contacts/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company: val }) });
                }}
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "0.375rem", padding: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box" }} />
            </div>
            {CUSTOM_FIELDS.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: "0.5rem" }}>Champs personnalisés</div>
                {CUSTOM_FIELDS.map((field) => (
                  <div key={field} style={{ marginBottom: "0.75rem" }}>
                    <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.2rem" }}>{field}</label>
                    <input defaultValue={selected.fields[field] ?? ""}
                      onBlur={(e) => updateField(selected.id, field, e.target.value)}
                      style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "0.375rem", padding: "0.5rem", fontSize: "0.875rem", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
