import { useEffect, useState, useRef } from "react";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  getProfile,
} from "../api";

import {
  theme,
  cardStyle,
  sectionTitleStyle,
} from "../styles/ui";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith("http") 
      ? avatarPath 
      : `http://localhost:5000${avatarPath}`;
  };

  const handleImageError = (id) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  async function loadCurrentUser() {
    try {
      const token = localStorage.getItem("token");
      const user = await getProfile(token);
      setCurrentUser(user);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadConversations() {
    try {
      const token = localStorage.getItem("token");
      const data = await getConversations(token);
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function openConversation(conversation) {
    try {
      const token = localStorage.getItem("token");
      setSelectedConversation(conversation);

      const data = await getConversationMessages(token, conversation.id);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend() {
    if (!newMessage.trim()) return;
    if (!selectedConversation) return;

    try {
      const token = localStorage.getItem("token");

      await sendMessage(
        token,
        selectedConversation.id,
        newMessage
      );

      setNewMessage("");

      const updated = await getConversationMessages(token, selectedConversation.id);
      setMessages(updated);

      loadConversations();
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
            {/* LEFT SIDEBAR */}

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
                <h2 style={{ ...sectionTitleStyle, fontSize: "16px" }}>Conversations</h2>
              </div>

              {conversations.length === 0 ? (
                <div style={{ padding: 20, color: theme.textSoft, fontSize: "15px" }}>
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => {
                  const hasValidAvatar = 
                    conversation.other_user_avatar && !brokenImages[conversation.id];

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => openConversation(conversation)}
                      onMouseEnter={(e) => {
                        if (selectedConversation?.id !== conversation.id)
                          e.currentTarget.style.background = "#F4F6F8";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConversation?.id !== conversation.id)
                          e.currentTarget.style.background = "transparent";
                      }}
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        borderBottom: `1px solid ${theme.borderSoft}`,
                        transition: "all .2s ease",
                        background:
                          selectedConversation?.id === conversation.id
                            ? "#EAEAEA"
                            : "transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {hasValidAvatar ? (
                          <img
                            src={getAvatarUrl(conversation.other_user_avatar)}
                            onError={() => handleImageError(conversation.id)}
                            alt=""
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "50%",
                              background: "#222222",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 500,
                              fontSize: "15px",
                              flexShrink: 0,
                            }}
                          >
                            {conversation.other_user_name ? conversation.other_user_name.charAt(0).toUpperCase() : "?"}
                          </div>
                        )}

                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontWeight: 500, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: "#111", fontSize: "15px" }}>
                            {conversation.other_user_name}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#666",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {conversation.last_message || "Start chatting"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* RIGHT SIDE */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                minHeight: 0,
              }}
            >
              {!selectedConversation ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#888",
                  }}
                >
                  <div style={{ fontSize: "70px", marginBottom: "15px" }}>💬</div>

                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#333" }}>
                    Select a conversation
                  </div>

                  <div style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                    Start chatting with your mentor/mentee.
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}

                  <div
                    style={{
                      padding: "18px 24px",
                      borderBottom: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "#fff",
                    }}
                  >
                    {selectedConversation.other_user_avatar && !brokenImages[`header-${selectedConversation.id}`] ? (
                      <img
                        src={getAvatarUrl(selectedConversation.other_user_avatar)}
                        onError={() => handleImageError(`header-${selectedConversation.id}`)}
                        alt="Profile"
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          background: "#222222",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 500,
                          fontSize: "15px",
                          flexShrink: 0,
                        }}
                      >
                        {selectedConversation.other_user_name ? selectedConversation.other_user_name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 500, fontSize: "15px", color: "#111" }}>
                        {selectedConversation.other_user_name}
                      </div>
                    </div>
                  </div>

                  {/* Messages container */}

                  <div
                    ref={messagesRef}
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      background: "#F2F4F7",
                      minHeight: 0,
                    }}
                  >
                    {messages.length === 0 ? (
                      <div
                        style={{
                          color: theme.textSoft,
                          textAlign: "center",
                          marginTop: "40px",
                          fontSize: "15px"
                        }}
                      >
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine =
                          currentUser &&
                          Number(message.sender_id) === Number(currentUser.id);

                        return (
                          <div
                            key={message.id}
                            style={{
                              display: "flex",
                              justifyContent: isMine ? "flex-end" : "flex-start",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                background: isMine 
                                  ? "rgba(255, 255, 255, 0.65)" 
                                  : "#E6E8EB",
                                backdropFilter: isMine ? "blur(10px)" : "none",
                                WebkitBackdropFilter: isMine ? "blur(10px)" : "none",
                                color: "#111111",
                                padding: "10px 14px",
                                borderRadius: "18px",
                                maxWidth: "70%",
                                wordBreak: "break-word",
                                fontSize: "15px",
                                border: isMine 
                                  ? "1px solid rgba(255, 255, 255, 0.4)" 
                                  : "1px solid transparent",
                                boxShadow: isMine
                                  ? "0 4px 12px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.2)"
                                  : "0 2px 6px rgba(0, 0, 0, 0.02)",
                                transition: "all .2s ease",
                              }}
                            >
                              <div>{message.message_text}</div>

                              <div
                                style={{
                                  fontSize: "11px",
                                  marginTop: "6px",
                                  opacity: 0.5,
                                  textAlign: "right",
                                }}
                              >
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Colombo"
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef}></div>
                  </div>

                  {/* Input */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "18px",
                      borderTop: `1px solid ${theme.border}`,
                    }}
                  >
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        borderRadius: "25px",
                        padding: "14px 18px",
                        border: "1px solid #E0E0E0",
                        outline: "none",
                        fontSize: "15px",
                        background: "#FAFAFA"
                      }}
                    />

                    <button
                      onClick={handleSend}
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "#222222",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "22px",
                        transition: "0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingLeft: "4px",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#444444"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#222222"}
                    >
                      ➤
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}