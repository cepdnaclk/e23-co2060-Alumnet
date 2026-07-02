import { useEffect, useState, useRef } from "react";
import PageShell from "../components/PageShell";
import {
  getChatContacts,
  getConversationMessages,
  sendMessage,
  getProfile,
} from "../api";

import {
  theme,
} from "../styles/ui";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const currentChatIdRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const isNewConversation = currentChatIdRef.current !== selectedConversation?.id;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (isNewConversation || isNearBottom) {
      bottomRef.current?.scrollIntoView({
        behavior: isNewConversation ? "auto" : "smooth",
      });
      currentChatIdRef.current = selectedConversation?.id;
    }
  }, [messages, selectedConversation]);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith("http") 
      ? avatarPath 
      : `http://localhost:5000${avatarPath}`;
  };

  const handleImageError = (id) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const formatMessageTime = (dateInput) => {
    try {
      if (!dateInput) return "";
      const date = new Date(dateInput);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata", 
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
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
      const data = await getChatContacts(token);
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function openConversation(conversation) {
    try {
      const token = localStorage.getItem("token");
      setSelectedConversation(conversation);

      setConversations((prevList) =>
        prevList.map((c) =>
          c.id === conversation.id ? { ...c, unread: false } : c
        )
      );

      if (conversation.id) {
        const data = await getConversationMessages(token, conversation.id);
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend() {
    if (!newMessage.trim()) return;
    if (!selectedConversation || !selectedConversation.id) return;

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.other_user_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
    const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <PageShell title="Messages" subtitle="Connect and chat with your matches">
      <div style={chatLayoutContainer}>
        <div style={gridContainer}>
          <div style={sidebarPanel}>
            <div style={sidebarHeader}>
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={sidebarSearchInput}
              />
            </div>

            <div style={conversationsListWrapper}>
              {sortedConversations.length === 0 ? (
                <div style={{ padding: 18, color: "rgba(17,17,17,0.52)", fontSize: "14px" }}>
                  No active connections or history found.
                </div>
              ) : (
                sortedConversations.map((conversation) => {
                  const hasValidAvatar = 
                    conversation.other_user_avatar && !brokenImages[conversation.id];
                  const isSelected = selectedConversation?.id === conversation.id;

                  return (
                    <div
                      key={conversation.id || `temp-${conversation.other_user_id}`}
                      onClick={() => openConversation(conversation)}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                      style={{
                        ...conversationItemRow,
                        background: isSelected ? "rgba(0, 0, 0, 0.05)" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {hasValidAvatar ? (
                          <img
                            src={getAvatarUrl(conversation.other_user_avatar)}
                            onError={() => handleImageError(conversation.id)}
                            alt=""
                            style={avatarStyle}
                          />
                        ) : (
                          <div style={avatarFallbackStyle}>
                            {conversation.other_user_name ? conversation.other_user_name.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={conversationNameText}>
                              {conversation.other_user_name}
                            </div>
                            {conversation.unread && !isSelected && (
                              <div style={unreadBadgeDot} />
                            )}
                          </div>
                          <div
                            style={{
                              ...conversationLastMessageText,
                              fontWeight: conversation.unread && !isSelected ? "500" : "400",
                              color: conversation.last_message ? "rgba(17,17,17,0.72)" : "rgba(17,17,17,0.52)",
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
          </div>

          <div style={chatPanelWindow}>
            {!selectedConversation ? (
              <div style={emptyChatPlaceholderWindow}>
                <div style={{ fontSize: "54px", marginBottom: "12px" }}>💬</div>
                <div style={placeholderTitle}>Select a conversation</div>
                <div style={placeholderSubtitle}>Start chatting with your mentor/mentee.</div>
              </div>
            ) : (
              <>
                <div style={chatTopHeaderBar}>
                  {selectedConversation.other_user_avatar && !brokenImages[`header-${selectedConversation.id}`] ? (
                    <img
                      src={getAvatarUrl(selectedConversation.other_user_avatar)}
                      onError={() => handleImageError(`header-${selectedConversation.id}`)}
                      alt="Profile"
                      style={avatarStyle}
                    />
                  ) : (
                    <div style={avatarFallbackStyle}>
                      {selectedConversation.other_user_name ? selectedConversation.other_user_name.charAt(0).toUpperCase() : "A"}
                    </div>
                  )}

                  <div>
                    <div style={headerConversationNameText}>
                      {selectedConversation.other_user_name}
                    </div>
                  </div>
                </div>

                <div ref={messagesRef} style={messageThreadContainer}>
                  {messages.length === 0 ? (
                    <div style={emptyHistoryMessageText}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMine = currentUser && Number(message.sender_id) === Number(currentUser.id);

                      return (
                        <div
                          key={message.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMine ? "flex-end" : "flex-start",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              ...chatMessageBubbleStyle,
                              background: isMine ? "rgba(255, 255, 255, 0.65)" : "#FFFFFF",
                              backdropFilter: isMine ? "blur(12px)" : "none",
                              WebkitBackdropFilter: isMine ? "blur(12px)" : "none",
                              borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                              border: isMine ? "1px solid rgba(255, 255, 255, 0.4)" : "1px solid rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            {message.message_text}
                          </div>
                          
                          <div
                            style={{
                              fontSize: "11px",
                              marginTop: "4px",
                              color: "rgba(17, 17, 17, 0.65)",
                              fontWeight: "500",
                              paddingLeft: isMine ? "0px" : "4px",
                              paddingRight: isMine ? "4px" : "0px",
                            }}
                          >
                            {formatMessageTime(message.created_at)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div style={messageInputConsolePanel}>
                  <textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    style={messageInputTextArea}
                  />

                  <button onClick={handleSend} style={messageSendBtnAction}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

const chatLayoutContainer = {
  paddingTop: 10,
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "320px 1fr", 
  gap: 20,
  height: "75vh", 
};

const sidebarPanel = {
  display: "flex",
  flexDirection: "column",
  background: "rgba(255, 255, 255, 0.65)",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  backdropFilter: "blur(6px)",
  borderRadius: 14,
  overflow: "hidden",
};

const sidebarHeader = {
  padding: "18px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
};

const sidebarSearchInput = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0, 0, 0, 0.08)",
  background: "rgba(255, 255, 255, 0.7)",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const conversationsListWrapper = {
  flex: 1,
  overflowY: "auto",
};

const conversationItemRow = {
  padding: "16px 18px",
  cursor: "pointer",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "all .15s ease",
};

const avatarStyle = {
  width: 46,
  height: 46,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const avatarFallbackStyle = {
  width: 46,
  height: 46,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ecebe7",
  color: "#111111",
  fontWeight: 500,
  fontSize: "14px",
  flexShrink: 0,
};

const conversationNameText = {
  fontSize: "16px",
  fontWeight: 500,
  color: "#111111",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  letterSpacing: "-0.01em",
};

const unreadBadgeDot = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#2527be",
  marginLeft: "6px",
  flexShrink: 0,
};

const conversationLastMessageText = {
  fontSize: "13px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginTop: "4px",
};

const chatPanelWindow = {
  display: "flex",
  flexDirection: "column",
  background: "rgba(255, 255, 255, 0.65)",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  backdropFilter: "blur(6px)",
  borderRadius: 14,
  overflow: "hidden",
};

const emptyChatPlaceholderWindow = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#f0f4f9", 
};

const placeholderTitle = {
  fontSize: "16px", 
  fontWeight: 500, 
  color: "#111111",
  letterSpacing: "-0.01em",
};

const placeholderSubtitle = {
  marginTop: "6px", 
  fontSize: "14px", 
  color: "rgba(17,17,17,0.54)",
};

const chatTopHeaderBar = {
  padding: "16px 20px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "rgba(255, 255, 255, 0.4)",
};

const headerConversationNameText = {
  fontWeight: 500, 
  fontSize: "16px", 
  color: "#111111", 
  letterSpacing: "-0.01em"
};

const messageThreadContainer = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  background: "#f0f4f9", 
};

const emptyHistoryMessageText = {
  color: "rgba(17,17,17,0.52)",
  textAlign: "center",
  marginTop: "30px",
  fontSize: "14px",
};

const chatMessageBubbleStyle = {
  color: "#111111",
  padding: "10px 14px",
  maxWidth: "60%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  fontSize: "14px",
  lineHeight: "1.6",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

const messageInputConsolePanel = {
  padding: "14px 20px",
  background: "rgba(255, 255, 255, 0.5)",
  borderTop: "1px solid rgba(0, 0, 0, 0.05)",
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const messageInputTextArea = {
  flex: 1,
  borderRadius: "12px",
  padding: "10px 14px",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  outline: "none",
  fontSize: "14px",
  background: "rgba(255, 255, 255, 0.85)",
  resize: "none",
  fontFamily: "inherit",
  lineHeight: "1.5",
  maxHeight: "80px",
  overflowY: "auto",
};

const messageSendBtnAction = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#111111",
  color: "#FFFFFF",
  border: "none",
  cursor: "pointer",
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: "2px",
  flexShrink: 0,
  transition: "opacity 0.15s ease",
};