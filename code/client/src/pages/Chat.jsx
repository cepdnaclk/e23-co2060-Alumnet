import { useEffect, useState } from "react";
import { getConversations } from "../api";
import {
  theme,
  cardStyle,
  sectionTitleStyle,
} from "../styles/ui";

export default function Chat() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const token = localStorage.getItem("token");

      const data = await getConversations(token);

      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      style={{
        marginLeft: "280px",
        padding: "24px",
        minHeight: "100vh",
        background: theme.bg,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: 0,
            overflow: "hidden",
            height: "80vh",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              height: "100%",
            }}
          >
            <div
              style={{
                borderRight: `1px solid ${theme.border}`,
                overflowY: "auto",
                background: "rgba(255,255,255,0.35)",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderBottom: `1px solid ${theme.borderSoft}`,
                }}
              >
                <h2 style={sectionTitleStyle}>
                  Messages
                </h2>
              </div>

              {conversations.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    color: theme.textSoft,
                  }}
                >
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: `1px solid ${theme.borderSoft}`,
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "transparent";
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 6,
                        color: theme.text,
                      }}
                    >
                      {conversation.other_user_name}
                    </div>

                    <div
                      style={{
                        color: theme.textSoft,
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {conversation.last_message ||
                        "No messages yet"}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: "grid",
                placeItems: "center",
                color: theme.textSoft,
                fontSize: 16,
              }}
            >
              Select a conversation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}