import { useEffect, useRef, useState } from "react";
import "./AIChat.css";
import SendIcon from "@mui/icons-material/Send";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
export default function AIChat({ sideBarActive }) {
  const geminiKey = import.meta.env.VITE_GEMINI_KEY;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setloading] = useState(false);
  const lastMsgRef = useRef();
  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { textBy: "user", text: input }]);
  };
  const HandleChattingWithAi = async () => {
    try {
      setloading(true);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              parts: [{ text: input }],
            },
          ],
        }
      );
      const aiResponse =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(aiResponse);
      setMessages((pre) => [...pre, { textBy: "Ai", text: aiResponse }]);
      setInput("");
      setloading(false);
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  };

  const classifyAndFormatText = (text) => {
    return text
      .split("\n")
      .map((line, index) => {
        line = line.trim(); // Remove extra spaces

        // Bold text: **text** → <b>text</b>
        line = line.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

        // Headings
        if (line.startsWith("### "))
          return { type: "h4", content: line.replace(/^###\s*/, "") };
        if (line.startsWith("## "))
          return { type: "h4", content: line.replace(/^##\s*/, "") };
        if (line.startsWith("# "))
          return { type: "h4", content: line.replace(/^#\s*/, "") };

        // Lists
        if (line.startsWith("* ") || line.startsWith("- "))
          return { type: "ul", content: line.replace(/^[-*]\s*/, "") };
        if (line.match(/^\d+\./))
          return { type: "ol", content: line.replace(/^\d+\.\s*/, "") }; // Ordered list

        // Paragraphs
        if (line !== "") return { type: "p", content: line };

        return null; // Ignore empty lines
      })
      .filter(Boolean);
  };
  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);
  return (
    <>
      {sideBarActive === "AiChat" && (
        <div className="chat-container">
          <header className="chat-header">
            <img
              src="https://cdn-icons-png.flaticon.com/128/11306/11306080.png"
              alt="AI Logo"
              className="ai-logo"
            />
            <span>AI ChatBot</span>
          </header>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                style={{
                  // backgroundColor: "green",
                  border: "1px solid #eaeaea",
                  padding: "1rem",
                  borderRadius: "1rem",
                  letterSpacing: "0.5px",
                  width: "80%",
                  margin: "auto",
                  marginTop: "0.5rem",
                  position: "relative",
                  //   background: "rgb(255,255,255)",
                  background:
                    " linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(98,178,212,1) 100%)",
                }}
                key={index}
                ref={lastMsgRef}
              >
                {msg.textBy === "Ai" && (
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/17556/17556177.png"
                    alt=""
                    style={{
                      position: "absolute",
                      width: "1.5rem",
                      top: "0.2rem",
                      left: "-2rem",
                      height: "2rem",
                    }}
                  />
                )}
                {msg.textBy === "user" ? (
                  <p>{msg.text}</p>
                ) : (
                  classifyAndFormatText(msg.text).map((item, index) => {
                    switch (item.type) {
                      case "h4":
                        return (
                          <h4
                            key={index}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        );
                      case "ul":
                        return (
                          <li
                            key={index}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        );
                      case "ol":
                        return (
                          <p
                            key={index}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        );
                      case "p":
                        return (
                          <p
                            key={index}
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />
                        );
                      default:
                        return null;
                    }
                  })
                )}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  border: "1px solid #eaeaea",
                  padding: "1rem",
                  borderRadius: "1rem",
                  letterSpacing: "0.5px",
                  width: "80%",
                  margin: "auto",
                  marginTop: "0.5rem",
                  position: "relative",
                  background:
                    " linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(98,178,212,1) 100%)",
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/128/17556/17556177.png"
                  alt=""
                  style={{
                    position: "absolute",
                    width: "1.5rem",
                    top: "0.2rem",
                    left: "-2rem",
                    height: "2rem",
                  }}
                />
                <ul style={{ listStyle: "none" }}>
                  <li
                    style={{
                      border: "1px solid #f0f0f0",
                      width: "100%",
                      height: "1.6rem",
                      backgroundColor: " #f0f0f0",
                      borderRadius: "1rem",
                    }}
                  ></li>
                  <li
                    style={{
                      border: "1px solid #f0f0f0",
                      width: "100%",
                      height: "1.6rem",
                      backgroundColor: " #f0f0f0",
                      borderRadius: "1rem",
                    }}
                  ></li>
                  <li
                    style={{
                      border: "1px solid #f0f0f0",
                      width: "100%",
                      height: "1.6rem",
                      backgroundColor: " #f0f0f0",
                      borderRadius: "1rem",
                    }}
                  ></li>
                </ul>
              </div>
            )}
          </div>
          <footer className="chat-footer">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                handleSend();
                HandleChattingWithAi();
              }}
            >
              <SendIcon />
            </button>
          </footer>
        </div>
      )}
    </>
  );
}
