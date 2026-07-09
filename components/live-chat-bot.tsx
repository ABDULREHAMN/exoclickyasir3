"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, RefreshCw, Maximize2, Check, ChevronDown, AlertCircle, CheckCircle2, Clock, Paperclip, Smile } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
  delivered?: boolean
  seen?: boolean
}

interface VerificationStep {
  id: string
  name: string
  status: "completed" | "in_progress" | "pending"
  completedDate?: string
  description: string
}

const VERIFICATION_STEPS: VerificationStep[] = [
  { id: "1", name: "Identity Verification", status: "completed", completedDate: "Nov 15, 2024", description: "Verified your identity and personal information." },
  { id: "2", name: "Account Verification", status: "completed", completedDate: "Nov 16, 2024", description: "Confirmed account ownership and security settings." },
  { id: "3", name: "Payment Method Verification", status: "completed", completedDate: "Nov 17, 2024", description: "Validated your Payoneer payment method." },
  { id: "4", name: "Security Verification", status: "completed", completedDate: "Nov 18, 2024", description: "Completed security and compliance checks." },
  { id: "5", name: "Finance Department Review", status: "in_progress", description: "Reviewing traffic patterns and account activity." },
  { id: "6", name: "Fund Receipt Verification", status: "in_progress", description: "Verifying fund receipt and transaction details." },
  { id: "7", name: "Payment Authorization", status: "pending", description: "Awaiting final payment authorization." },
  { id: "8", name: "Payment Release", status: "pending", description: "Processing and releasing funds to your account." },
]

const PAYMENT_SUPPORT_CONVERSATION = [
  { q: "Why is my $19,145.49 withdrawal pending?", a: "Your withdrawal is currently under verification review due to recent traffic pattern changes detected on your account." },
  { q: "What triggered the verification?", a: "Our system detected campaign interruptions and traffic instability. Multiple traffic spikes were followed by sudden drops, which triggered automated verification checks." },
  { q: "How long will the review take?", a: "Verification typically takes 3-5 business days. However, it may take longer depending on the finance department's review findings." },
  { q: "Can I cancel this withdrawal?", a: "Yes, you can cancel the withdrawal at any time. Would you like to proceed with cancellation?" },
  { q: "Will my funds be returned to my balance?", a: "Yes, if you cancel, the $19,145.49 will be returned to your available balance immediately." },
  { q: "What caused the traffic drops?", a: "Common causes include campaign pauses, traffic source interruptions, or seasonal fluctuations. Please check your campaign settings." },
  { q: "Is my account flagged?", a: "Your account is under routine verification. This is a standard security measure and doesn't indicate any violations." },
  { q: "Can I make another withdrawal?", a: "New withdrawal requests can be submitted, but they will also go through verification until your current review is completed." },
  { q: "How can I improve traffic stability?", a: "Focus on organic, consistent traffic growth. Avoid sudden campaign changes and maintain steady audience engagement rates." },
  { q: "What are acceptable traffic patterns?", a: "Stable, organic growth with minimal fluctuations is preferred. Traffic should not spike dramatically or drop suddenly." },
  { q: "Will the finance department contact me?", a: "The finance department will reach out if they need additional information about your account activity." },
  { q: "What happens if verification fails?", a: "If verification cannot be completed, your withdrawal may be declined and the funds returned to your balance." },
  { q: "Is there a way to speed up the review?", a: "Reviews are processed automatically. Manual expediting is not available, but you can ensure accurate information is on file." },
  { q: "What documents might be needed?", a: "Usually, no additional documents are needed. However, the finance team may request traffic source details if needed." },
  { q: "Can I check the verification status?", a: "You can monitor the status in your dashboard under Payments. We'll notify you of any updates." },
  { q: "What causes traffic verification failures?", a: "Unusual patterns, bot traffic, sudden traffic sources changes, or inconsistent engagement metrics can trigger flags." },
  { q: "Should I stop my current campaigns?", a: "No, continue running your campaigns normally. Just ensure traffic patterns remain stable and organic." },
  { q: "How is traffic quality measured?", a: "We measure engagement rates, visit duration, bounce rates, and consistency. Higher quality traffic shows stable metrics." },
  { q: "Will this affect future payouts?", a: "Once verification is complete, future withdrawals will follow the normal processing timeline." },
  { q: "What if I disagree with the hold?", a: "You can provide additional context about your traffic sources. Please contact support with specific details." },
  { q: "Is there a minimum withdrawal amount?", a: "Your current withdrawal meets all minimum requirements. Future withdrawals also follow standard minimums." },
  { q: "Can I request a manual review?", a: "Manual reviews are not available. However, providing detailed traffic source information may help expedite verification." },
  { q: "What's the withdrawal processing fee?", a: "There are no processing fees during verification. Standard rates apply once the withdrawal is approved." },
  { q: "How often does verification occur?", a: "Verification is triggered based on account activity patterns. It's a security measure applied as needed." },
  { q: "Will I receive email notifications?", a: "Yes, all verification updates will be sent to your registered email address." },
  { q: "What if my account has legitimate traffic spikes?", a: "Legitimate spikes are fine. Just ensure they're followed by sustained engagement, not sudden drops." },
  { q: "Can I view my traffic analytics here?", a: "Traffic analytics should be reviewed in your publisher dashboard. Provide accurate reports to support verification." },
  { q: "Is the hold permanent?", a: "No, this is temporary. Verification is a standard process that typically resolves within 3-5 business days." },
  { q: "What payment methods are available?", a: "Payoneer is currently available. We may support additional methods in the future." },
  { q: "Can I change my payment method during verification?", a: "You can update your payment method, but the current withdrawal will continue to the original method once approved." },
  { q: "What if verification takes longer?", a: "If verification extends beyond 5 days, you'll receive a notification with an updated timeline." },
  { q: "Are there tax implications?", a: "Tax matters are your responsibility. Consult a tax professional regarding your specific situation." },
  { q: "How do I improve my account trustworthiness?", a: "Maintain consistent, organic traffic. Avoid sudden changes and keep detailed records of your traffic sources." },
  { q: "What happens after verification passes?", a: "Your withdrawal will be released to your payment method within 1-2 business days." },
  { q: "Can multiple withdrawals be pending?", a: "Only one withdrawal can be in verification status at a time. Others must wait for the current one to complete." },
  { q: "Is there a withdrawal history limit?", a: "You can view your withdrawal history in the Payments section. Historical records are maintained for compliance." },
  { q: "What should I do while waiting?", a: "Continue running your campaigns normally, maintain stable traffic, and monitor your dashboard for updates." },
  { q: "Can I negotiate the review timeline?", a: "Review timelines are automatic. However, providing complete information helps avoid delays." },
  { q: "Is my data secure during verification?", a: "Yes, all your data is encrypted and secure. Verification is conducted internally within our secure systems." },
  { q: "What if I have SEO traffic sources?", a: "SEO traffic is excellent! Just ensure it remains consistent and doesn't show unusual spikes or drops." },
  { q: "Can I contact the finance department directly?", a: "The finance department will initiate contact if needed. You can also reply to any emails they send regarding your verification." },
  { q: "Will there be a confirmation when verification passes?", a: "Yes, you'll receive an email and a dashboard notification confirming verification completion and withdrawal approval." },
  { q: "What's the next step?", a: "Please wait for the verification to complete. You'll be notified once the review is finished and your withdrawal is processed." },
]

export default function LiveChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showVerificationPanel, setShowVerificationPanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat on component mount with timeline updates
  useEffect(() => {
    const timelineMessages: ChatMessage[] = [
      {
        id: "timeline-1",
        text: "✅ Identity Verification completed on Nov 15, 2024",
        sender: "support",
        timestamp: new Date(Date.now() - 3600000 * 96),
        delivered: true,
        seen: true,
      },
      {
        id: "timeline-2",
        text: "✅ Account Verification completed on Nov 16, 2024",
        sender: "support",
        timestamp: new Date(Date.now() - 3600000 * 72),
        delivered: true,
        seen: true,
      },
      {
        id: "timeline-3",
        text: "✅ Payment Method Verification completed on Nov 17, 2024",
        sender: "support",
        timestamp: new Date(Date.now() - 3600000 * 48),
        delivered: true,
        seen: true,
      },
      {
        id: "timeline-4",
        text: "✅ Security Verification completed on Nov 18, 2024",
        sender: "support",
        timestamp: new Date(Date.now() - 3600000 * 24),
        delivered: true,
        seen: true,
      },
      {
        id: "timeline-5",
        text: "🔵 Finance Department Review started today. We're analyzing your traffic patterns and account activity to ensure everything meets our compliance standards.",
        sender: "support",
        timestamp: new Date(Date.now() - 3600000 * 2),
        delivered: true,
        seen: true,
      },
      {
        id: "init-1",
        text: "Hello 👋\n\nWelcome to ExoClick Live Support.\n\nYour withdrawal of $19,145.49 is progressing through our verification system. Currently, we have completed 4 of 8 verification steps. Your Finance Department Review is underway.\n\nHow can we help you today?",
        sender: "support",
        timestamp: new Date(),
        delivered: true,
        seen: true,
      },
    ]
    setMessages(timelineMessages)
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSendMessage = () => {
    if (!userInput.trim()) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userInput,
      sender: "user",
      timestamp: new Date(),
      delivered: true,
    }

    setMessages((prev) => [...prev, userMsg])
    setUserInput("")

    // Check if user wants to cancel withdrawal
    const cancelKeywords = ["cancel", "withdraw", "cancellation"]
    const shouldShowCancelFlow = cancelKeywords.some((keyword) =>
      userInput.toLowerCase().includes(keyword)
    )

    // Simulate support typing
    setIsTyping(true)

    setTimeout(() => {
      let supportReply = ""

      if (shouldShowCancelFlow) {
        supportReply =
          "I can help you with that. Are you sure you want to cancel your $19,145.49 withdrawal? This action will return the funds to your available balance."
        setShowCancelConfirm(true)
      } else {
        // Find matching Q&A from dataset
        const matchingPair = PAYMENT_SUPPORT_CONVERSATION.find((pair) =>
          userInput.toLowerCase().includes(pair.q.toLowerCase().split(" ")[0])
        )
        supportReply = matchingPair
          ? matchingPair.a
          : "This matter is handled by the finance department. They will contact you with further details. In the meantime, your withdrawal remains secure in our system."
      }

      const supportMsg: ChatMessage = {
        id: `support-${Date.now()}`,
        text: supportReply,
        sender: "support",
        timestamp: new Date(),
        delivered: true,
        seen: true,
      }

      setMessages((prev) => [...prev, supportMsg])
      setIsTyping(false)
    }, 1000)
  }

  const handleCancelWithdrawal = (confirmed: boolean) => {
    setShowCancelConfirm(false)

    if (confirmed) {
      const confirmMsg: ChatMessage = {
        id: `support-${Date.now()}`,
        text: "Your cancellation request has been submitted successfully. Processing may take 24–48 hours. The $19,145.49 will be returned to your available balance.",
        sender: "support",
        timestamp: new Date(),
        delivered: true,
        seen: true,
      }
      setMessages((prev) => [...prev, confirmMsg])
    } else {
      const declineMsg: ChatMessage = {
        id: `support-${Date.now()}`,
        text: "Understood. Your withdrawal will continue with the verification process. Is there anything else I can help you with?",
        sender: "support",
        timestamp: new Date(),
        delivered: true,
        seen: true,
      }
      setMessages((prev) => [...prev, declineMsg])
    }
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
        <div className="fixed bottom-24 right-6 z-40 w-[480px] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden md:w-96 sm:w-80">
          {/* Header - Fixed */}
          <div className="sticky top-0 bg-blue-600 px-5 py-3 border-b border-blue-700 shadow-sm">
            {/* Top Row - Name and Badges */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">MA</span>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-white text-sm leading-tight whitespace-nowrap">Michael Anderson</h3>
                  <p className="text-xs text-blue-100 leading-tight">Support Manager</p>
                </div>
              </div>

              {/* Badges and Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Online
                </div>
                <div className="flex items-center gap-1 border border-white text-white px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  <Check className="w-3 h-3" />
                  Verified
                </div>
                <button 
                  onClick={() => setShowVerificationPanel(!showVerificationPanel)}
                  className="p-1 hover:bg-blue-700 rounded transition-colors text-white ml-1"
                  title="View verification details"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showVerificationPanel ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* Bottom Row - Activity Info */}
            <div className="flex items-center justify-between text-xs text-blue-100 px-0">
              <span>Last Active: Active Now</span>
              <span>Response Time: Usually replies within a few minutes</span>
            </div>

            {/* Verification Panel */}
            {showVerificationPanel && (
              <div className="mt-3 pt-3 border-t border-blue-500 max-h-64 overflow-y-auto">
                <h4 className="text-xs font-semibold text-white mb-2">Verification Progress (4/8 Completed)</h4>
                <div className="space-y-2">
                  {VERIFICATION_STEPS.map((step) => (
                    <div key={step.id} className="flex items-start gap-2 text-xs">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-300" />}
                        {step.status === "in_progress" && <Clock className="w-4 h-4 text-yellow-300" />}
                        {step.status === "pending" && <Clock className="w-4 h-4 text-gray-300" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{step.name}</p>
                        <p className="text-blue-200">{step.description}</p>
                        {step.completedDate && <p className="text-blue-100 text-xs">Completed: {step.completedDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 h-80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.sender === "support" && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-xs">MA</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 flex-1">
                  <div
                    className={`max-w-sm rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none ml-auto"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm"
                    }`}
                  >
                  {msg.text}
                  </div>
                  <div
                    className={`text-xs mt-1 px-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                    {msg.sender === "user" && msg.delivered && " ✓"}
                    {msg.sender === "support" && msg.seen && " ✓ Seen"}
                  </div>
                </div>
              </div>
            ))}

            {showCancelConfirm && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">MC</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg rounded-bl-none px-4 py-3">
                  <p className="text-sm text-gray-900 mb-3">
                    Are you sure you want to cancel your $19,145.49 withdrawal?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelWithdrawal(true)}
                      className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium"
                    >
                      Yes, Cancel
                    </button>
                    <button
                      onClick={() => handleCancelWithdrawal(false)}
                      className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded font-medium"
                    >
                      No, Keep It
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Professional Footer */}
          <div className="border-t border-gray-200 bg-white p-4 flex items-end gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50 transition-all"
            />
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

