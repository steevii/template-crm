"use client";
import { useState } from "react";

const STAGES: string[] = JSON.parse(process.env.NEXT_PUBLIC_PIPELINE_STAGES ?? '["Prospect","Qualifié","Proposition","Gagné"]');
const CUSTOM_FIELDS: string[] = JSON.parse(process.env.NEXT_PUBLIC_CUSTOM_FIELDS ?? "[]");
const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Mon Entreprise";
const TITLE = process.env.NEXT_PUBLIC_CRM_TITLE ?? "CRM";

const STAGE_COLORS: Record<string, string> = {
  Prospect: "#6366f1",
  Qualifié: "#3b82f6",
  Proposition: "#f59e0b",
  Gagné: "#10b981",
  Perdu: "#ef4444",
};

function stageColor(stage: string): string {
  return STAGE_COLORS[stage] ?? "#8b5cf6";
}

interface Contact {
  id: number;
  name: string;
  company: string;
  stage: string;
  fields: Record<string, string>;
}

const DEMO_CONTACTS: Contact[] = [
  { id: 1, name: "Marie Dupont", company: "Acme SARL", stage: STAGES[0] ?? "Prospect", fields: {} },
  { id: 2, name: "Pierre Martin", company: "Beta SAS", stage: STAGES[1] ?? "Qualifié", fields: {} },
  { id: 3, name: "Sophie Leclerc", company: "Gamma SA", stage: STAGES[2] ?? "Proposition", fields: {} },
];

export default function CRM() {
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [newName, setNewName] = useState("");

  function addContact() {
    if (!newName.trim()) return;
    setContacts((prev) => [
      ...prev,
      { id: Date.now(), name: newName.trim(), company: "", stage: STAGES[0] ?? "Prospect", fields: {} },
    ]);
    setNewName("");
  }

  function moveStage(id: number, direction: 1 | -1) {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.indexOf(c.stage);
        const next = STAGES[idx + direction];
        return next ? { ...c, stage: next } : c;
      })
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {COMPANY}
          </div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{TITLE}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addContact()}
            placeholder="Nom du contact..."
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          <button
            onClick={addContact}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            + Ajouter
          </button>
        </div>
      </header>

      {/* Kanban */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "1rem",
          padding: "1.5rem",
          overflowX: "auto",
        }}
      >
        {STAGES.map((stage) => {
          const stageContacts = contacts.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              style={{
                minWidth: "260px",
                flex: "0 0 260px",
                background: "white",
                borderRadius: "0.75rem",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: stageColor(stage),
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{stage}</span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "1rem",
                    padding: "0.1rem 0.5rem",
                    fontSize: "0.75rem",
                  }}
                >
                  {stageContacts.length}
                </span>
              </div>
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {stageContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelected(c)}
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      cursor: "pointer",
                      transition: "box-shadow 0.1s",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{c.name}</div>
                    {c.company && (
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.company}</div>
                    )}
                    <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.5rem" }}>
                      {STAGES.indexOf(c.stage) > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveStage(c.id, -1); }}
                          style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: "pointer" }}
                        >
                          ←
                        </button>
                      )}
                      {STAGES.indexOf(c.stage) < STAGES.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveStage(c.id, 1); }}
                          style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", border: "1px solid #d1d5db", borderRadius: "0.25rem", background: "white", cursor: "pointer" }}
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {stageContacts.length === 0 && (
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "center", padding: "1rem 0" }}>
                    Aucun contact
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              width: "400px",
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#6b7280" }}>×</button>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              Étape : <strong style={{ color: stageColor(selected.stage) }}>{selected.stage}</strong>
            </div>
            {CUSTOM_FIELDS.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: "0.5rem" }}>Champs personnalisés</div>
                {CUSTOM_FIELDS.map((field) => (
                  <div key={field} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280" }}>{field}</span>
                    <input
                      defaultValue={selected.fields[field] ?? ""}
                      placeholder="—"
                      style={{ border: "none", outline: "none", textAlign: "right", fontSize: "0.875rem", color: "#111827" }}
                      onChange={(e) => {
                        setContacts((prev) =>
                          prev.map((c) =>
                            c.id === selected.id ? { ...c, fields: { ...c.fields, [field]: e.target.value } } : c
                          )
                        );
                      }}
                    />
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
