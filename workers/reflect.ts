export async function handleReflect(request: Request,env: Env,ctx: ExecutionContext): Promise<Response> {

	interface RequestBody {
		entry: string;
		conversationId?: string;
	}


	try {
		const { entry, conversationId } = await request.json() as RequestBody
		
		
		if (!entry) {
			return Response.json(
				{ error: 'Journal entry is required' },
				{ status: 400 }
			);
		}
		
		// Get or create conversation
		let conversation;
		let conversationKey;
		
		if (conversationId) {
			//e.g conversation-1697058493021
			conversationKey = `conversation-${conversationId}`;
			const stored = await env.REFLECTIONS.get(conversationKey);

			if(stored){
				conversation = JSON.parse(stored);
			} else {
				conversation = {messages:[]};
			}

		} else {
			//new conversation
			conversationKey = `conversation-${Date.now()}`;
			conversation = { 
				messages: [],
				startedAt: Date.now()
			};
		}
		
		// Add user message to history
		conversation.messages.push({
			role: 'user',
			content: entry,
			timestamp: Date.now()
		});
		
		// Build messages array 
		const aiMessages = [
			{
				role: 'system',
				content: 'You are a mindful companion. Provide brief, compassionate insights and thoughtful follow-up questions. Remember the conversation context and refer back to previous reflections when relevant.'
			},
			...conversation.messages.map(msg => ({
				role: msg.role,
				content: msg.content
			}))
		];
		
		// Call AI 
		const aiResponse = await env.AI.run(
			'@cf/meta/llama-3.3-70b-instruct-fp8-fast',
			{ messages: aiMessages }
		);
		
		// Add AI response to conversation 
		conversation.messages.push({
			role: 'assistant',
			content: aiResponse.response || 'Thank you for sharing your thoughts.',
			timestamp: Date.now()
		});
		
		
		conversation.lastUpdated = Date.now();
		//send to backend and add to KV  
		await env.REFLECTIONS.put(conversationKey, JSON.stringify(conversation));
		
		return Response.json({
			conversationId: conversationKey.replace('conversation-', ''),
			insight: aiResponse.response || 'Thank you for sharing your thoughts.',
			messageCount: conversation.messages.length,
			history: conversation.messages 
		});
		
	} catch (error) {
		console.error('Error in reflect handler:', error);
		return Response.json(
			{ error: 'Failed to process reflection' },
			{ status: 500 }
		);
	}
}