"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
  delivered?: boolean
}

const SUPPORT_CONVERSATION = [
  { q: "Why is my payment pending?", a: "Your payment is currently under verification review because your campaign traffic became unstable." },
  { q: "Why was payment put on hold?", a: "Sudden traffic spikes and repeated campaign interruptions triggered an automatic finance review." },
  { q: "When will payment release?", a: "Once verification is completed successfully, your payment will continue processing automatically." },
  { q: "How much payment is on hold?", a: "Your current held payment amount is $19155.49." },
  { q: "Can I cancel my withdrawal?", a: "Yes. Your withdrawal cancellation request can be processed within 24-48 hours after confirmation." },
]

export default function LiveChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat on component mount
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: "init-1",
      text: "Hello! I'm Daniel Carter, Finance Verification Specialist. Your payment of $19,155.49 is currently under verification hold. How can I help clarify the status?",
      sender: "support",
      timestamp: new Date(),
      delivered: true,
    }
    setMessages([initialMessage])
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-load support conversation when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 1 && messageIndex === 0) {
      const loadNextMessage = () => {
        if (messageIndex < SUPPORT_CONVERSATION.length) {
          setIsTyping(true)
          setTimeout(() => {
            const pair = SUPPORT_CONVERSATION[messageIndex]
            
            // Add user message
            const userMsg: ChatMessage = {
              id: `user-${messageIndex}`,
              text: pair.q,
              sender: "user",
              timestamp: new Date(),
              delivered: true,
            }
            
            // Add support response
            const supportMsg: ChatMessage = {
              id: `support-${messageIndex}`,
              text: pair.a,
              sender: "support",
              timestamp: new Date(Date.now() + 1000),
              delivered: true,
            }
            
            setMessages((prev) => [...prev, userMsg, supportMsg])
            
            // Check if this is the cancellation question
            if (pair.q.toLowerCase().includes("cancel")) {
              setShowCancelConfirmation(true)
            }
            
            setMessageIndex((prev) => prev + 1)
            setIsTyping(false)
          }, 800)
        }
      }

      if (messageIndex === 0) {
        loadNextMessage()
      }
    }
  }, [isOpen, messageIndex, messages.length])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleCancelConfirmation = (confirmed: boolean) => {
    const confirmMsg: ChatMessage = {
      id: `user-confirm-${Date.now()}`,
      text: confirmed ? "Yes" : "No",
      sender: "user",
      timestamp: new Date(),
      delivered: true,
    }

    const responseMsg: ChatMessage = {
      id: `support-confirm-${Date.now()}`,
      text: confirmed
        ? "Your cancellation request has been submitted successfully.\n\nFinance department processing time: 24-48 hours.\n\nAfter cancellation completes, funds will return to your available balance automatically."
        : "Your withdrawal request will remain active under verification review.",
      sender: "support",
      timestamp: new Date(Date.now() + 1000),
      delivered: true,
    }

    setMessages((prev) => [...prev, confirmMsg, responseMsg])
    setShowCancelConfirmation(false)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden md:w-80 sm:w-72">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DC</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Daniel Carter</h3>
                <p className="text-xs text-blue-100">Finance Verification Specialist</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-xs text-blue-100">Online</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-100 mt-3">Verification Hold • Payment: $19,155.49 • Request: 23 Apr 2026</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-96">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.sender === "support" && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">DC</span>
                  </div>
                )}
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                    {msg.sender === "user" && msg.delivered && " ✓"}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">DC</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            {showCancelConfirmation && (
              <div className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">Do you really want to cancel your withdrawal request of $19155.49?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCancelConfirmation(true)}
                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleCancelConfirmation(false)}
                    className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white text-xs font-semibold rounded transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Status Messages */}
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">✓ Message delivered</p>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled
            />
            <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
