import axios from "axios";
import { useState } from "react";
import "./journal.css";
import { Link } from "react-router";

interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export default function Journal() {
	const [entry, setEntry] = useState<string>("");
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const handleSubmit = async () => {
		if (!entry) return;
		
		setLoading(true);
		
		const userMessage: Message = {
			role: 'user',
			content: entry,
			timestamp: Date.now()
		};
		setMessages(prev => [...prev, userMessage]);
		setEntry(""); 
		
		try {
            //send in body.data to worker backend
			const res = await axios.post("/reflect", { 
				entry,
				conversationId // Send conversation ID if exists to load for context
			});
			const data = res.data;
			
			// Save conversation ID for future messages
			if (data.conversationId) {
				setConversationId(data.conversationId);
			}
			
			const aiMessage: Message = {
				role: 'assistant',
				content: data.insight,
				timestamp: Date.now()
			};
			setMessages(prev => [...prev, aiMessage]);
			
		} catch (error) {
			console.error("Error submitting journal entry:", error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I had trouble processing that. Please try again.',
                timestamp: Date.now()
            }
			setMessages(prev => [...prev, errorMessage]);
		}
		
		setLoading(false);
	}
	
	
	
	const startNewConversation = () => {
		setConversationId(null);
		setMessages([]);
		setEntry("");
	}

	return (
    <section className="journal-section">
		<div className="journal-container">
            <Link to="/" className="back-button">← Home</Link>

			<div className="journal-header">
				<h1 className="journal-title">Your Reflection</h1>
				{conversationId && (
					<button 
						className="new-conversation-button"
						onClick={startNewConversation}
					>
						New Conversation
					</button>
				)}
			</div>

			<div className="conversation-view">
				{messages.length === 0 ? (
					<p className="conversation-placeholder">
						Start by sharing what's on your mind...
					</p>
				) : (
					<div className="messages-list">
						{messages.map((message, index) => (
							<div 
								key={index} 
                                //change from message.user to message.assistant
								className={`message ${message.role}`}
							>
								<div className="message-content">
									{message.content}
								</div>
								<div className="message-time">
									{new Date(message.timestamp).toLocaleTimeString()}
								</div>
							</div>
						))}
						{loading && (
							<div className="message assistant">
								<div className="message-content typing">
									<span></span><span></span><span></span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			<div className="input-area">
				<textarea
					className="journal-textarea"
					value={entry}
					onChange={(e) => setEntry(e.target.value)}
					placeholder="Write your thoughts here... "
					disabled={loading}
				/>

				<button 
					className="journal-button" 
					onClick={handleSubmit} 
					disabled={loading || !entry.trim()}
				>

					{loading ? "Reflecting..." : "Send"}
				</button>
			</div>
		</div>
    </section>
	);
}