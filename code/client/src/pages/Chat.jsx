import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Search, Send, Smile, Trash2, Type, X } from "lucide-react";
import {
  deleteChatMessage,
  getChatContacts,
  getConversationMessages,
  getProfile,
  sendMessage,
} from "../api";
import { supabase } from "../supabase";
import docIcon from "../assets/doc.png";
import fileIcon from "../assets/file.png";
import imageIcon from "../assets/image.png";
import pdfIcon from "../assets/pdf.png";
import recIcon from "../assets/rec.png";
import chatIcon from "../assets/chat.png";

const CRIMSON = "#D7263D";
const LASER_BLUE = "#2B59C3";
const CHAT_BUCKET = "chat-attachments";
const EMOJIS = ["\u{1F600}", "\u{1F602}", "\u{1F60A}", "\u{1F60D}", "\u{1F44D}", "\u{1F64F}", "\u{1F393}", "\u{1F4A1}", "\u{1F525}", "\u{2705}", "\u{1F64C}", "\u{1F680}"];

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});
  const [sortOrder, setSortOrder] = useState("newest");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [voiceClip, setVoiceClip] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const bottomRef = useRef(null);
  const messagesRef = useRef(null);
  const currentChatIdRef = useRef(null);
  const pendingScrollToBottomRef = useRef(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();

    return () => {
      window.dispatchEvent(
        new CustomEvent("alumnet:chat-selection-changed", {
          detail: { name: "" },
        })
      );
    };
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const isNewConversation = currentChatIdRef.current !== selectedConversation?.id;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (pendingScrollToBottomRef.current || isNewConversation || isNearBottom) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: pendingScrollToBottomRef.current || isNewConversation ? "auto" : "smooth",
        });
        pendingScrollToBottomRef.current = false;
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
      return new Date(dateInput).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Colombo",
      });
    } catch {
      return "";
    }
  };

  const formatConversationTime = (dateInput) => {
    try {
      if (!dateInput) return "";
      return new Date(dateInput).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Colombo",
      });
    } catch {
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
      pendingScrollToBottomRef.current = true;
      setSelectedConversation(conversation);
      window.dispatchEvent(
        new CustomEvent("alumnet:chat-selection-changed", {
          detail: { name: conversation.other_user_name || "" },
        })
      );

      setConversations((prevList) =>
        prevList.map((c) =>
          c.id === conversation.id ? { ...c, unread: false, unread_count: 0 } : c
        )
      );

      if (conversation.id) {
        const data = await getConversationMessages(token, conversation.id);
        setMessages(data);
        window.dispatchEvent(new Event("alumnet:chat-unread-changed"));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend() {
    if (!selectedConversation?.id) return;

    const cleanText = newMessage.trim();
    const attachment = voiceClip
      ? {
          file: new File([voiceClip.blob], voiceClip.name, { type: "audio/webm" }),
          type: "voice",
        }
      : attachedFile
        ? { file: attachedFile, type: "file" }
        : null;

    if (!cleanText && !attachment) return;

    try {
      setIsSending(true);
      setSendError("");
      const token = localStorage.getItem("token");

      let payload = {
        message_type: "text",
        message_text: cleanText,
      };

      if (attachment) {
        const uploaded = await uploadChatAttachment(
          selectedConversation.id,
          attachment.file
        );

        payload = {
          message_type: attachment.type,
          message_text: cleanText || null,
          attachment_url: uploaded.url,
          attachment_name: attachment.file.name,
          attachment_mime_type: attachment.file.type || "application/octet-stream",
          attachment_size: attachment.file.size,
        };
      }

      await sendMessage(token, selectedConversation.id, payload);
      setNewMessage("");
      setAttachedFile(null);
      setVoiceClip(null);
      setShowEmojiPicker(false);

      const updated = await getConversationMessages(token, selectedConversation.id);
      setMessages(updated);
      loadConversations();
      window.dispatchEvent(new Event("alumnet:chat-unread-changed"));
    } catch (err) {
      console.error(err);
      setSendError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!selectedConversation?.id) return;

    try {
      const token = localStorage.getItem("token");
      await deleteChatMessage(token, messageId);
      const updated = await getConversationMessages(token, selectedConversation.id);
      setMessages(updated);
      loadConversations();
      window.dispatchEvent(new Event("alumnet:chat-unread-changed"));
    } catch (err) {
      console.error(err);
      setSendError(err.message || "Failed to delete message");
    }
  }

  const focusComposer = () => {
    textareaRef.current?.focus();
  };

  const addEmoji = (emoji) => {
    setNewMessage((value) => `${value}${emoji}`);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setVoiceClip(null);
    }
    e.target.value = "";
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      recordingChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
        setVoiceClip({
          name: `voice-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`,
          blob,
        });
        setAttachedFile(null);
        setIsRecording(false);
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getUnreadCount = (conversation) => {
    if (Number(conversation.unread_count) > 0) return Number(conversation.unread_count);
    return conversation.unread ? 1 : 0;
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.other_user_name?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.last_message_time || a.last_message_at;
    const timeB = b.last_message_time || b.last_message_at;
    const valueA = timeA ? new Date(timeA).getTime() : 0;
    const valueB = timeB ? new Date(timeB).getTime() : 0;
    return sortOrder === "newest" ? valueB - valueA : valueA - valueB;
  });

  const renderAvatar = (conversation, size = "normal", keyPrefix = "") => {
    const brokenKey = `${keyPrefix}${conversation.id}`;
    const hasValidAvatar = conversation.other_user_avatar && !brokenImages[brokenKey];

    if (hasValidAvatar) {
      return (
        <img
          src={getAvatarUrl(conversation.other_user_avatar)}
          onError={() => handleImageError(brokenKey)}
          alt=""
          className={`chatAvatar ${size}`}
        />
      );
    }

    return (
      <div className={`chatAvatar fallback ${size}`}>
        {conversation.other_user_name?.charAt(0)?.toUpperCase() || "A"}
      </div>
    );
  };

  const renderMessageContent = (message) => {
    if (message.deleted_at) {
      return <span className="deletedMessageText">Message deleted</span>;
    }

    if (message.message_type === "voice" && message.attachment_url) {
      return (
        <div className="attachmentMessage">
          {message.message_text && <p>{message.message_text}</p>}
          <AttachmentChip
            name={message.attachment_name || "Voice recording"}
            mimeType={message.attachment_mime_type || "audio/webm"}
            href={message.attachment_url}
            variant="voice"
          />
          <audio controls src={message.attachment_url} />
        </div>
      );
    }

    if (message.message_type === "file" && message.attachment_url) {
      return (
        <div className="attachmentMessage">
          {message.message_text && <p>{message.message_text}</p>}
          <AttachmentChip
            name={message.attachment_name || "Download file"}
            mimeType={message.attachment_mime_type}
            href={message.attachment_url}
          />
        </div>
      );
    }

    return message.message_text;
  };

  return (
    <main className="chatPage">
      <style>{css}</style>

      <section className="inboxShell">
        <aside className="inboxSidebar">
          <label className="conversationSearch">
            <Search size={15} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search conversations"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <div className="conversationList">
            {sortedConversations.length === 0 ? (
              <div className="emptyList">No active connections or history found.</div>
            ) : (
              sortedConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const unreadCount = getUnreadCount(conversation);
                const lastMessageTime =
                  conversation.last_message_time || conversation.last_message_at;

                return (
                  <button
                    key={conversation.id || `temp-${conversation.other_user_id}`}
                    type="button"
                    className={`conversationItem ${isSelected ? "selected" : ""}`}
                    onClick={() => openConversation(conversation)}
                  >
                    {renderAvatar(conversation)}

                    <span className="conversationCopy">
                      <span className="conversationNameRow">
                        <strong>{conversation.other_user_name}</strong>
                      </span>

                      <span
                        className={`conversationPreview ${
                          unreadCount > 0 && !isSelected ? "unread" : ""
                        }`}
                      >
                        {conversation.last_message || "Start chatting"}
                      </span>
                    </span>

                    <span className="conversationMeta">
                      {unreadCount > 0 && !isSelected && (
                        <span className="unreadBadge">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      <span className="conversationTime">
                        {formatConversationTime(lastMessageTime)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="chatWindow">
          {!selectedConversation ? (
            <div className="emptyChat">
              <img src={chatIcon} alt="" className="emptyChatIcon" />
              <h2>Select a conversation</h2>
              <p>Start chatting with your mentor or mentee.</p>
            </div>
          ) : (
            <>
              <header className="chatHeader">
                <div className="chatHeaderIdentity">
                  {renderAvatar(selectedConversation, "small", "header-")}
                  <div>
                    <h2>{selectedConversation.other_user_name}</h2>
                  </div>
                </div>
              </header>

              <div ref={messagesRef} className="messageThread">
                {messages.length === 0 ? (
                  <div className="emptyHistory">No messages yet. Start the conversation.</div>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      currentUser && Number(message.sender_id) === Number(currentUser.id);

                    return (
                      <div
                        key={message.id}
                        className={`messageGroup ${isMine ? "mine" : "theirs"}`}
                      >
                        <div className="messageMeta">
                          <span className="messageSender">
                            {isMine ? `${currentUser?.full_name || "Me"} (Me)` : selectedConversation.other_user_name}
                          </span>
                          <span className="messageTime">{formatMessageTime(message.created_at)}</span>
                        </div>
                        <div className={`messageBubble ${message.deleted_at ? "deleted" : ""}`}>
                          {renderMessageContent(message)}
                          {isMine && !message.deleted_at && (
                            <button
                              className="deleteMessageBtn"
                              type="button"
                              onClick={() => handleDeleteMessage(message.id)}
                              aria-label="Delete message"
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <footer className="composer">
                <div className="composerBox">
                  <textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  {(attachedFile || voiceClip) && (
                    <div className="pendingAttachments">
                      {attachedFile && (
                        <AttachmentChip
                          name={attachedFile.name}
                          mimeType={attachedFile.type}
                          onRemove={() => setAttachedFile(null)}
                        />
                      )}
                      {voiceClip && (
                        <AttachmentChip
                          name={voiceClip.name}
                          mimeType="audio/webm"
                          variant="voice"
                          onRemove={() => setVoiceClip(null)}
                        />
                      )}
                    </div>
                  )}
                  {showEmojiPicker && (
                    <div className="emojiPicker">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="composerTools" aria-label="Message options">
                    <button type="button" aria-label="Text options" onClick={focusComposer}>
                      <Type size={15} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label="Emoji"
                      onClick={() => setShowEmojiPicker((open) => !open)}
                    >
                      <Smile size={15} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label={isRecording ? "Stop recording" : "Voice message"}
                      className={isRecording ? "recording" : ""}
                      onClick={toggleRecording}
                    >
                      <Mic size={15} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      aria-label="Attach file"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip size={15} strokeWidth={2} />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="fileInput"
                    onChange={handleFileSelect}
                  />
                  <button
                    className="sendButton"
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    <span>{isSending ? "Sending" : "Send"}</span>
                    <Send size={15} strokeWidth={2.2} />
                  </button>
                </div>
                {sendError && <div className="sendError">{sendError}</div>}
              </footer>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

async function uploadChatAttachment(conversationId, file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `${conversationId}/${id}-${safeName}`;

  const { error } = await supabase.storage.from(CHAT_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new Error(error.message || "Upload failed");

  const { data } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

function AttachmentChip({ name, mimeType = "", href, onRemove, variant }) {
  const icon = getAttachmentIcon(name, mimeType, variant);
  const content = (
    <>
      <span className="attachmentIcon">
        <img src={icon} alt="" />
      </span>
      <span className="attachmentName">{name}</span>
      {onRemove && (
        <span className="attachmentRemove" aria-hidden="true">
          <X size={12} strokeWidth={2.2} />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        className="attachmentChip"
        href={href}
        target="_blank"
        rel="noreferrer"
        download
      >
        {content}
      </a>
    );
  }

  return (
    <button className="attachmentChip" type="button" onClick={onRemove}>
      {content}
    </button>
  );
}

function getAttachmentIcon(name = "", mimeType = "", variant) {
  const lowerName = name.toLowerCase();
  if (variant === "voice" || mimeType.startsWith("audio/")) return recIcon;
  if (mimeType.startsWith("image/")) return imageIcon;
  if (mimeType.includes("pdf") || lowerName.endsWith(".pdf")) return pdfIcon;
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    lowerName.endsWith(".doc") ||
    lowerName.endsWith(".docx")
  ) {
    return docIcon;
  }
  return fileIcon;
}

const css = `
.chatPage{
  height:calc(100dvh - 92px);
  min-height:0;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:14px 22px 22px;
  overflow:hidden;
  animation:chatDissolve .22s ease both;
}

.inboxShell{
  width:min(1340px, 100%);
  height:100%;
  min-height:0;
  margin:0 auto;
  display:grid;
  grid-template-columns:330px minmax(0, 1fr);
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  border-radius:22px;
  overflow:hidden;
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.inboxSidebar{
  min-width:0;
  min-height:0;
  display:flex;
  flex-direction:column;
  border-right:1px solid rgba(0,0,0,.08);
  background:#fafbfc;
}

.conversationSearch{
  height:36px;
  margin:18px 14px 14px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:999px;
  background:#f3f5f8;
  border:1px solid rgba(0,0,0,.05);
  color:rgba(17,17,17,.48);
}

.conversationSearch input{
  min-width:0;
  width:100%;
  border:0;
  outline:0;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.conversationSearch input::placeholder{
  color:rgba(17,17,17,.44);
}

.conversationList{
  flex:1;
  min-height:0;
  overflow-y:auto;
  padding:4px 10px 12px;
}

.emptyList{
  padding:18px 8px;
  color:rgba(17,17,17,.50);
  font-size:14px;
  line-height:1.4;
}

.conversationItem{
  position:relative;
  width:100%;
  display:grid;
  grid-template-columns:42px minmax(0, 1fr) 42px;
  gap:10px;
  padding:10px 9px;
  border-radius:12px;
  text-align:left;
  font-family:"Google Sans";
  transition:background .16s ease, transform .16s ease;
}

.conversationItem + .conversationItem{
  margin-top:1px;
}

.conversationItem::before{
  content:"";
  position:absolute;
  left:9px;
  right:9px;
  top:-1px;
  height:1px;
  background:rgba(0,0,0,.07);
}

.conversationItem:first-child::before,
.conversationItem.selected::before,
.conversationItem.selected + .conversationItem::before{
  display:none;
}

.conversationItem:nth-child(even){
  background:#fafbfc;
}

.conversationItem:hover,
.conversationItem.selected{
  background:#e8f0ff;
  transform:translateY(-1px);
}

.chatAvatar{
  width:42px;
  height:42px;
  border-radius:50%;
  object-fit:cover;
  flex-shrink:0;
}

.chatAvatar.small{
  width:34px;
  height:34px;
}

.chatAvatar.fallback{
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:14px;
  font-weight:500;
}

.conversationCopy{
  min-width:0;
  display:grid;
  gap:4px;
}

.conversationNameRow{
  display:flex;
  align-items:center;
}

.conversationNameRow strong{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#111111;
  font-size:14px;
  font-weight:500;
}

.conversationPreview{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:rgba(17,17,17,.58);
  font-size:13px;
}

.conversationPreview.unread{
  color:#111111;
  font-weight:600;
}

.conversationMeta{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  justify-content:flex-start;
  gap:5px;
  padding-top:1px;
}

.conversationTime{
  color:rgba(17,17,17,.46);
  font-size:12px;
  white-space:nowrap;
}

.unreadBadge{
  min-width:20px;
  height:18px;
  padding:0 5px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  background:${CRIMSON};
  color:#ffffff;
  font-size:11px;
  font-weight:500;
  box-shadow:0 6px 14px rgba(215,38,61,.22);
}

.chatWindow{
  min-width:0;
  min-height:0;
  display:flex;
  flex-direction:column;
  background:#ffffff;
}

.emptyChat{
  flex:1;
  display:grid;
  place-content:center;
  justify-items:center;
  text-align:center;
  background:#ffffff;
}

.emptyChatIcon{
  width:58px;
  height:58px;
  object-fit:contain;
  margin-bottom:14px;
  filter:drop-shadow(0 10px 18px rgba(0,0,0,.12));
}

.emptyChat h2{
  margin:0;
  font-size:18px;
  font-weight:500;
}

.emptyChat p{
  margin:6px 0 0;
  color:rgba(17,17,17,.52);
  font-size:14px;
}

.chatHeader{
  min-height:58px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  padding:0 18px;
  border-bottom:1px solid rgba(0,0,0,.08);
  background:#ffffff;
}

.chatHeaderIdentity{
  display:flex;
  align-items:center;
  gap:9px;
}

.chatHeader h2{
  margin:0;
  font-size:14px;
  font-weight:500;
  line-height:1.2;
}

.messageThread{
  flex:1;
  min-height:0;
  overflow-y:auto;
  padding:18px 28px 26px;
  background:#ffffff;
}

.emptyHistory{
  margin-top:32px;
  text-align:center;
  color:rgba(17,17,17,.52);
  font-size:14px;
}

.messageGroup{
  display:flex;
  flex-direction:column;
  margin-bottom:18px;
}

.messageGroup.theirs{
  align-items:flex-start;
}

.messageGroup.mine{
  align-items:flex-end;
}

.messageMeta{
  display:flex;
  align-items:center;
  gap:7px;
  margin:0 0 6px;
  font-size:12px;
}

.messageSender{
  color:rgba(17,17,17,.68);
  font-weight:600;
}

.messageTime{
  color:rgba(17,17,17,.52);
  font-weight:400;
}

.messageBubble{
  position:relative;
  max-width:min(460px, 72%);
  padding:10px 14px;
  color:#111111;
  font-size:14px;
  line-height:1.45;
  white-space:pre-wrap;
  word-break:break-word;
  box-shadow:0 10px 24px rgba(0,0,0,.10), 0 2px 7px rgba(0,0,0,.05);
}

.messageBubble.deleted{
  color:rgba(17,17,17,.48);
  font-style:italic;
}

.deletedMessageText{
  color:rgba(17,17,17,.48);
}

.deleteMessageBtn{
  position:absolute;
  top:-8px;
  right:-8px;
  width:24px;
  height:24px;
  display:grid;
  place-items:center;
  border-radius:999px;
  background:#ffffff;
  color:rgba(17,17,17,.56);
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 6px 14px rgba(0,0,0,.10);
  opacity:0;
  transform:translateY(2px);
  transition:opacity .16s ease, transform .16s ease, color .16s ease;
}

.messageGroup.mine .messageBubble:hover .deleteMessageBtn{
  opacity:1;
  transform:translateY(0);
}

.deleteMessageBtn:hover{
  color:${CRIMSON};
}

.messageGroup.theirs .messageBubble{
  background:#eef6f5;
  border:1px solid rgba(17,17,17,.04);
  border-radius:10px 10px 10px 3px;
}

.messageGroup.mine .messageBubble{
  background:#dcecff;
  border:1px solid rgba(47,95,245,.05);
  border-radius:10px 10px 3px 10px;
}

.attachmentMessage{
  display:grid;
  gap:8px;
}

.attachmentMessage p{
  margin:0;
}

.attachmentMessage audio{
  width:min(320px, 64vw);
  height:36px;
}

.composer{
  padding:10px 34px 16px;
  flex-shrink:0;
  border-top:1px solid rgba(0,0,0,.08);
  background:#ffffff;
}

.composerBox{
  position:relative;
  min-height:62px;
  display:flex;
  align-items:flex-end;
  gap:10px;
  padding:8px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.06);
  box-shadow:0 10px 24px rgba(0,0,0,.08);
  background:#ffffff;
}

.composerBox textarea{
  flex:1;
  min-height:42px;
  max-height:92px;
  resize:none;
  border:0;
  outline:0;
  padding:3px 4px;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
  line-height:1.45;
}

.pendingAttachments{
  position:absolute;
  left:10px;
  bottom:48px;
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  max-width:calc(100% - 20px);
}

.attachmentChip{
  max-width:210px;
  min-width:0;
  height:28px;
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:0 7px 0 6px;
  border-radius:7px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.10);
  color:#111111;
  text-decoration:none;
  font-family:"Google Sans";
  font-size:12px;
  line-height:1;
  box-shadow:0 1px 3px rgba(0,0,0,.05);
  transition:background .18s ease, box-shadow .18s ease, transform .18s ease;
}

.attachmentChip:hover{
  background:#f7f8f9;
  box-shadow:0 4px 10px rgba(0,0,0,.07);
  transform:translateY(-1px);
}

.attachmentIcon{
  width:16px;
  height:16px;
  display:grid;
  place-items:center;
  border-radius:4px;
  flex:0 0 auto;
}

.attachmentIcon img{
  width:16px;
  height:16px;
  object-fit:contain;
  display:block;
}

.attachmentName{
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.attachmentRemove{
  width:14px;
  height:14px;
  display:grid;
  place-items:center;
  color:rgba(17,17,17,.60);
  flex:0 0 auto;
}

.emojiPicker{
  position:absolute;
  right:122px;
  bottom:48px;
  width:178px;
  padding:8px;
  display:grid;
  grid-template-columns:repeat(6, 1fr);
  gap:4px;
  border-radius:10px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 14px 34px rgba(0,0,0,.12);
}

.emojiPicker button{
  width:24px;
  height:24px;
  display:grid;
  place-items:center;
  border-radius:6px;
  font-size:16px;
  transition:background .18s ease, transform .18s ease;
}

.emojiPicker button:hover{
  background:#eef1f4;
  transform:translateY(-1px);
}

.composerTools{
  display:flex;
  align-items:center;
  gap:4px;
  padding:0 2px 2px 0;
}

.composerTools button{
  width:24px;
  height:24px;
  display:grid;
  place-items:center;
  border-radius:6px;
  color:rgba(17,17,17,.58);
  transition:background .18s ease, color .18s ease, transform .18s ease;
}

.composerTools button:first-child{
  background:#dbe9ff;
  color:${LASER_BLUE};
}

.composerTools button:hover{
  background:rgba(0,0,0,.05);
  color:#111111;
  transform:translateY(-1px);
}

.composerTools button.recording{
  background:${CRIMSON};
  color:#ffffff;
}

.fileInput{
  display:none;
}

.sendButton{
  height:38px;
  padding:0 15px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border-radius:999px;
  background:${LASER_BLUE};
  color:#ffffff;
  font-family:"Google Sans";
  font-size:13px;
  font-weight:500;
  box-shadow:0 8px 18px rgba(43,89,195,.24);
  transition:transform .18s ease, box-shadow .18s ease;
}

.sendButton:hover{
  transform:translateY(-1px);
  box-shadow:0 10px 22px rgba(43,89,195,.30);
}

.sendButton:disabled{
  opacity:.72;
  cursor:not-allowed;
  transform:none;
}

.sendError{
  margin-top:8px;
  color:${CRIMSON};
  font-size:12px;
}

@keyframes chatDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:900px){
  .chatPage{
    padding:12px 16px 18px;
  }

  .inboxShell{
    grid-template-columns:280px minmax(0, 1fr);
  }
}

@media (max-width:720px){
  .inboxShell{
    grid-template-columns:1fr;
    height:auto;
    min-height:0;
    border-radius:18px;
  }

  .inboxSidebar{
    max-height:320px;
    border-right:0;
    border-bottom:1px solid rgba(0,0,0,.08);
  }

  .chatWindow{
    min-height:520px;
  }

  .messageThread{
    padding:16px;
  }

  .composer{
    padding:10px 14px 14px;
  }
}
`;
