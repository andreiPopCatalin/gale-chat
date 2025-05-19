// utils/ChatAPI.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define our message types
export interface ChatMessage {
  id: string;
  text: string;
  time: string;
  from: 'user' | 'gale';
  date: string;
  isContinuation: number;
  status?: 'sending' | 'sent' | 'seen' | 'error';
}

// Preset messages shown to a new user
const PRESET_MESSAGES: ChatMessage[] = [
    {
      id: 'welcome-1',
      text: 'Hello there! Welcome to our chat. I\'m here to help you with anything you need. Feel free to ask me anything!',
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      from: 'gale',
      date: new Date().toDateString(),
      isContinuation: 0,
    },
    {
      id: 'welcome-2',
      text: "Welcome! I'm Gale, your personal assistant. How can I help you today?",
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      from: 'gale',
      date: new Date().toDateString(),
      isContinuation: 0,
    },
    {
      id: 'welcome-3',
      text: "Hi there! Thanks for reaching out. What brings you here today?",
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      from: 'gale',
      date: new Date().toDateString(),
      isContinuation: 0,
    }
  ];

// Sample responses from Gale
const GALE_RESPONSES: string[] = [
  "Thanks for sharing that. I will take it in consideration and find the best solution for you.",
  "Thanks for sharing that. I appreciate your input!",
  "That's interesting! Tell me more about it.",
  "I understand. Let me think about how I can help.",
  "How lovely.",
  "That's a good point. Let me offer my thoughts on this.",
  "I see what you mean. Have you considered trying a different approach?",
  "Thanks for explaining. Is there anything specific you'd like me to help with?",
  "I appreciate you sharing that with me. Let's explore some solutions together.",
  "That's quite insightful! Would you like me to elaborate on any part of this topic?"
];

// Utility to create message bubbles from text

export const createMessageBubbles = (text: string, from: 'user' | 'gale', date: string): ChatMessage[] => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  
    // Generate a more unique base ID
    const baseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
    // For user messages, don't split into multiple bubbles
    if (from === 'user') {
      return [{
        id: `${baseId}-0-${from}`,
        text: text,
        time,
        from,
        date: date || now.toDateString(),
        isContinuation: 0,
        status: 'sending'
      }];
    }
  
    // For Gale messages, split into sentences as before
    const sentences = splitMessageIntoSentences(text);
    return sentences.map((sentence, index) => ({
      id: `${baseId}-${index}-${from}`,
      text: sentence,
      time,
      from,
      date: date || now.toDateString(),
      isContinuation: index > 0 ? 1 : 0,
      status: undefined
    }));
  };

// Helper function to split messages into sentences
export const splitMessageIntoSentences = (text: string): string[] => {
  // Basic split by sentence-ending punctuation while preserving the punctuation
  const sentenceEnders = /([.!?])\s+/g;
  const sentences = text.split(sentenceEnders);
  
  // Process the split result to reconstruct proper sentences
  const result: string[] = [];
  let currentSentence = '';
  
  sentences.forEach((part, index) => {
    if (index % 2 === 0) {
      currentSentence = part;
    } else {
      // This is a punctuation mark
      currentSentence += part;
      if (currentSentence.trim()) {
        result.push(currentSentence.trim());
      }
      currentSentence = '';
    }
  });
  
  // Add the last part if it's not empty
  if (currentSentence.trim()) {
    result.push(currentSentence.trim());
  }
  
  return result.length > 0 ? result : [text];
};

class ChatAPI {
  private storageKey = 'chatMessages';

  // Get initial messages - either from storage or preset welcome messages
  async getInitialMessages(): Promise<{ messages: ChatMessage[], hasMore: boolean, userHasInteracted: boolean }> {
    try {

      //await AsyncStorage.removeItem(this.storageKey);
      const storedMessages = await AsyncStorage.getItem(this.storageKey);
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as ChatMessage[];
        const hasMore = parsedMessages.length > 40;
        
        const userHasInteracted = parsedMessages.some(msg => msg.from === 'user');
        
        // Load messages with proper status preservation
        const initialMessages = userHasInteracted 
          ? parsedMessages.slice(-40).map(msg => ({
              ...msg,
              status: msg.from === 'user' 
                ? (msg.status === 'sending' ? 'seen' : msg.status || 'seen')
                : undefined
            }))
          : [];
        
        return { 
          messages: initialMessages, 
          hasMore, 
          userHasInteracted 
        };
      }
      
      return { 
        messages: [], 
        hasMore: false, 
        userHasInteracted: false 
      };
    } catch (error) {
      console.error('Failed to load messages:', error);
      return { 
        messages: [], 
        hasMore: false, 
        userHasInteracted: false 
      };
    }
  }

  // Load more historical messages for infinite scrolling
  async loadMoreMessages(currentMessages: ChatMessage[]): Promise<{ messages: ChatMessage[], hasMore: boolean }> {
    try {
      const storedMessages = await AsyncStorage.getItem(this.storageKey);
      
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as ChatMessage[];
        const currentCount = currentMessages.length;
        
        if (currentCount >= parsedMessages.length) {
          return { messages: [], hasMore: false };
        }
        
        const remainingMessages = parsedMessages.length - currentCount;
        const loadCount = Math.min(40, remainingMessages);
        const startIndex = parsedMessages.length - currentCount - loadCount;
        const endIndex = parsedMessages.length - currentCount;
        
        const moreMessages = parsedMessages.slice(startIndex, endIndex);
        
        // Filter out any messages that already exist in our state
        const newMessages = moreMessages.filter(newMsg => 
          !currentMessages.some(existingMsg => existingMsg.id === newMsg.id)
        );
        
        return { 
          messages: newMessages, 
          hasMore: parsedMessages.length > (currentCount + loadCount) 
        };
      }
      
      return { messages: [], hasMore: false };
    } catch (error) {
      console.error('Failed to load more messages:', error);
      return { messages: [], hasMore: false };
    }
  }

  // Get welcome messages with a delay to simulate typing
  async getWelcomeMessages(): Promise<ChatMessage[]> {
    // Get a random index from the PRESET_MESSAGES array
    const randomIndex = Math.floor(Math.random() * PRESET_MESSAGES.length);
    // Get the randomly selected message
    const selectedMessage = PRESET_MESSAGES[randomIndex];
    // Split it into bubbles using createMessageBubbles
    return createMessageBubbles(selectedMessage.text, 'gale', new Date().toDateString());
  }

  // Send a user message and get a response
  async sendMessage(text: string): Promise<{ 
    userMessages: ChatMessage[],
    galeMessages: ChatMessage[]
  }> {
    const userMessages = createMessageBubbles(text, 'user', new Date().toDateString());
    
    // Simulate response generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get a random response
    const responseText = GALE_RESPONSES[Math.floor(Math.random() * GALE_RESPONSES.length)];
    const galeMessages = createMessageBubbles(responseText, 'gale', new Date().toDateString());
    
    return { userMessages, galeMessages };
  }

  // Simulates sending a message and updating its status
  async simulateMessageDelivery(userMessages: ChatMessage[]): Promise<{
    sentMessages: ChatMessage[],
    seenMessages: ChatMessage[]
  }> {
    // First update to "sent"
    const sentMessages = userMessages.map(msg => ({
      ...msg,
      status: 'sent'
    }));
    
    // Wait for seen status
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then update to "seen"
    const seenMessages = sentMessages.map(msg => ({
      ...msg,
      status: 'seen'
    }));
    
    return { sentMessages, seenMessages };
  }

  // Save messages to storage
  async saveMessages(messages: ChatMessage[]): Promise<void> {
    try {
      // Always get current messages first to prevent duplication
      const existing = await AsyncStorage.getItem(this.storageKey);
      const existingMessages = existing ? JSON.parse(existing) : [];
      
      // Combine and deduplicate
      const allMessages = [...existingMessages, ...messages];
      const uniqueMessages = allMessages.filter(
        (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
      );
  
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(uniqueMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }
}

export default new ChatAPI();