interface Message {
  id: string;
  text: string;
  time: string;
  from: 'user' | 'gale';
  date: string;
  isContinuation: number;
  status?: 'sending' | 'sent' | 'seen' | 'error';
}

interface GroupedMessage {
  title: string;
  data: Message[];
}

export const groupMessagesByDate = (messages: Message[]): GroupedMessage[] => {
  // First sort messages by date (oldest to newest)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Group by date
  const grouped = sortedMessages.reduce<Record<string, GroupedMessage>>((acc, message) => {
    if (!acc[message.date]) {
      acc[message.date] = {
        title: message.date,
        data: [],
      };
    }
    acc[message.date].data.push(message);
    return acc;
  }, {});
  
  // Convert to array and sort sections by date (oldest to newest)
  return Object.values(grouped).sort((a, b) => {
    return new Date(a.title).getTime() - new Date(b.title).getTime();
  });
};
  export const splitMessageIntoSentences = (text: string): string[] => {
      // Split by sentence-ending punctuation followed by whitespace
      return text.split(/(?<=[.!?])\s+/).filter(sentence => sentence.trim().length > 0);
  };

  