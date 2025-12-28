// app/routes/history.tsx
import { Link } from "react-router";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/history";
import "./history.css";

export async function loader({ context }: Route.LoaderArgs) {
	const { env } = context.cloudflare;
	
	// Get all conversation keys
	const list = await env.REFLECTIONS.list({ prefix: 'conversation-' });
	
	const conversations = await Promise.all(
		list.keys.map(async (key) => {
			const data = await env.REFLECTIONS.get(key.name);
			if (!data) return null;
			const conversation = JSON.parse(data);
			return {
				id: key.name.replace('conversation-', ''),
				...conversation
			};
		})
	);
	
	return conversations
		.filter(Boolean)
		.sort((a, b) => b.lastUpdated - a.lastUpdated);
}

export default function History({ loaderData }: Route.ComponentProps) {
	const conversations = loaderData;
	
	return (
		<section className="history-section">
			<Link to="/" className="back-button">← Home</Link>
			
			<div className="history-container">
				<h1 className="history-title">Past Conversations</h1>
				
				{conversations.length === 0 ? (
					<p className="no-entries">No conversations yet. Start journaling!</p>
				) : (
					<div className="conversations-list">
						{conversations.map((conversation) => (
							<div key={conversation.id} className="conversation-card">
								<div className="conversation-header">
									<span className="conversation-date">
										{new Date(conversation.startedAt).toLocaleDateString()}
									</span>
									
								</div>
								
								<div className="conversation-preview">
									{conversation.messages.slice(0, 4).map((msg, idx) => (
										<div key={idx} className={`preview-message ${msg.role}`}>
											<strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {
												msg.content.length > 100 
													? msg.content.substring(0, 100) + '...'
													: msg.content
											}
										</div>
									))}
									{conversation.messages.length > 4 && (
										<p className="more-messages">
											+ {conversation.messages.length - 4} more messages
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}



