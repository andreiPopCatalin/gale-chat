// ChatScreen.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { playSound } from '../utils/soundPlayer';
import * as Animatable from 'react-native-animatable';
import { groupMessagesByDate, splitMessageIntoSentences } from '../utils/messageHelpers';
import addMessageReactionFeature from '../components/addMessageReactionFeature';
import chatApi , { ChatMessage } from '../utils/chatApi';
import StatusTransition from '../components/statusTransition';
import TypingIndicator from '../components/typingIndicator';
import MessageTransition from '../components/messageTransition';


const ChatScreen = () => {
  const navigation = useNavigation();
  const listRef = useRef<SectionList>(null);
  const [isGaleTyping, setIsGaleTyping] = useState(false);
  const [galeStatus, setGaleStatus] = useState<'available' | 'typing' | 'online'>('available');
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [groupedMessages, setGroupedMessages] = useState([]);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [shouldAbortResponse, setShouldAbortResponse] = useState(false);
  

  useEffect(() => {
    setGroupedMessages(groupMessagesByDate(messages));
  }, [messages]);



// Load messages and show preset if first load
useEffect(() => {
  const loadMessages = async () => {
    try {
      const { messages: initialMessages, hasMore, userHasInteracted } = await chatApi.getInitialMessages();
      
      setMessages(initialMessages);
      setHasMoreMessages(hasMore);
      setHasUserInteracted(userHasInteracted);
      
       // Don't use a fixed timeout, instead wait for the next render cycle
       if (initialMessages.length > 0) {
        // Use requestAnimationFrame for better timing after render
        requestAnimationFrame(() => {
          // Small delay to ensure the list has rendered
          setTimeout(() => scrollToBottom(true), 1000);
        });
      }
      
      // If user hasn't interacted, show welcome messages
      if (!userHasInteracted) {
        setGaleStatus('typing');
        setIsGaleTyping(true);
        
        const welcomeMessages = await chatApi.getWelcomeMessages();
        
        // Show messages one by one with delay
        for (const message of welcomeMessages) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setMessages(prev => [...prev, message]);
          playSound('messageAppear');
        }
        
        setGaleStatus('online');
        setIsGaleTyping(false);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  loadMessages();
}, []);

// Save messages when they change
useEffect(() => {
  const saveMessages = async () => {
    // Only save if user has interacted
    if (hasUserInteracted && messages.length > 0) {
      try {
        await chatApi.saveMessages(messages);
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
    }
  };

  // Add a small debounce to prevent too frequent saves
  const timer = setTimeout(saveMessages, 500);
  return () => clearTimeout(timer);
}, [messages, hasUserInteracted]);

useEffect(() => {
    if (isNearBottom) {
      scrollToBottom(false); // No animation for initial scroll
    }
  }, [groupedMessages]);

   // Status management effects
   useEffect(() => {
    // Set status to 'typing' when Gale is typing
    if (isGaleTyping) {
      setGaleStatus('typing');
      // Clear any existing timeout
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  }, [isGaleTyping,typingTimeout]);

  const enhancedGroupedMessages = useMemo(() => {
    if (groupedMessages.length === 0) return [];
    
    // Clone the array to avoid mutating state
    const lastSectionIndex = groupedMessages.length - 1;
    const enhancedSections = [...groupedMessages];
    
    // Add typing indicator as a special message item
    if (isGaleTyping) {
      enhancedSections[lastSectionIndex] = {
        ...enhancedSections[lastSectionIndex],
        data: [
          ...enhancedSections[lastSectionIndex].data,
          { id: 'typing-indicator', isTypingIndicator: true }
        ]
      };
    }
    
    return enhancedSections;
  }, [groupedMessages, isGaleTyping]);


  useEffect(() => {
    // Only auto-scroll if user has interacted or we're near the bottom
    if (hasUserInteracted || isNearBottom) {
      // Use requestAnimationFrame to ensure rendering is complete
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  }, [enhancedGroupedMessages]);


      const goBackFunction = () => {
          playSound('transitionWooshUp');
          if(navigation.canGoBack()) {
              navigation.goBack()
          } else {
              navigation.navigate("Dashboard");
          }
      };

      const StatusCircle = ({ status }: { status: 'available' | 'typing' | 'online' }) => {
        const statusColors = {
          available: '#9E9E9E', // Green
          typing: '#FFC107',   // Yellow/orange
          online: '#4CAF50'    // Gray
        };
      
        return (
          <View style={[styles.statusCircle, { backgroundColor: statusColors[status] }]} />
        );
      };

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const paddingToBottom = 100;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= 
                      contentSize.height - paddingToBottom;
    setIsNearBottom(nearBottom);
  };

  const scrollToBottom = (animated = true) => {
    if (!listRef.current || enhancedGroupedMessages.length === 0) return;
  
    try {
      // Using scrollToEnd is more reliable than scrollToLocation for getting to the bottom
      listRef.current.getScrollResponder()?.scrollToEnd({ animated });
    } catch (error) {
      console.warn('scrollToBottom primary method failed:', error);
      
      // Fallback method
      try {
        const lastSection = enhancedGroupedMessages[enhancedGroupedMessages.length - 1];
        if (!lastSection || !lastSection.data || lastSection.data.length === 0) return;
        
        const lastIndex = lastSection.data.length - 1;
        
        listRef.current.scrollToLocation({
          sectionIndex: enhancedGroupedMessages.length - 1,
          itemIndex: lastIndex,
          animated,
          viewOffset: 0,
          viewPosition: 1, // 1 means at the bottom
        });
      } catch (secondError) {
        console.warn('scrollToBottom fallback method failed:', secondError);
      }
    }
  };


  const sendMessage = async () => {
    if (input.trim() === '') return;
  
    try {
      // Cancel any pending Gale response
      setShouldAbortResponse(true);
      
      // Get user messages with 'sending' status
      const { userMessages, galeMessages } = await chatApi.sendMessage(input.trim());
      
      // Reset the abort flag now that we're sending a new message
      setShouldAbortResponse(false);
      setHasUserInteracted(true);
      
      // Add user messages to the chat
      setMessages(prev => [...prev, ...userMessages]);
      setInput('');
      playSound('sendMessage');
  
      // Simulate message delivery status updates
      const { sentMessages, seenMessages } = await chatApi.simulateMessageDelivery(userMessages);
      
      // Update to 'sent' status
      setTimeout(() => {
        // Start Gale typing animation only if not aborted
        if (!shouldAbortResponse) {
          setIsGaleTyping(true);
        }
        setMessages(prev => prev.map(msg => 
          userMessages.some(m => m.id === msg.id) 
            ? sentMessages.find(m => m.id === msg.id) || msg
            : msg
        ));
        
        // Update to 'seen' status after another delay
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            userMessages.some(m => m.id === msg.id) 
              ? seenMessages.find(m => m.id === msg.id) || msg
              : msg
          ));
        }, 1000);
      }, 1000);
      
      // Only proceed with Gale's response if not aborted
      if (!shouldAbortResponse) {
        for (const message of galeMessages) {
          // Check before each message if we should abort
          if (shouldAbortResponse) break;
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          setMessages(prev => [...prev, message]);
          playSound('messageAppear');
        }
      }
      
      // Update Gale's status
      setIsGaleTyping(false);
      setGaleStatus('online');
      
      // Set a timeout to change status back to available
      statusTimeoutRef.current = setTimeout(() => {
        setGaleStatus('available');
      }, 10000);
      
      // Remove this line - it's causing duplication
      // await chatApi.saveMessages([...messages, ...userMessages, ...galeMessages]);
      
      // Instead, rely on the useEffect that watches messages changes
      // This will automatically save the current state of messages
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderDateHeader = ({ section: { title } }) => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    let displayDate;
    if (title === today) {
      displayDate = 'Today';
    } else if (title === yesterdayString) {
      displayDate = 'Yesterday';
    } else {
      // For older dates, show the full date
      const messageDate = new Date(title);
      
      // Options for date formatting
      const options = { 
        month: 'short',
        day: 'numeric', 
        year: 'short'
      };
      
      displayDate = messageDate.toLocaleDateString('en-US', options);
    }
    
    return (
      <View style={styles.dateHeaderContainer}>
        <View style={styles.line} />
            <Text style={styles.dateHeaderText}>{displayDate}</Text>
        <View style={styles.line} />
      </View>
    );
  };

  const originalRenderItem = ({ item }) => {
    if (item.isTypingIndicator) {
      return (
        <View style={styles.typingBubble}>
          <TypingIndicator isTyping={true} />
        </View>
      );
    }
  
    // Add fallback for time
    const messageTime = item.time || new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  
    return (
      <MessageTransition isTyping={item.isTyping}>
        <Animatable.View
          animation={item.from === 'user' ? "zoomInRight" : "zoomInLeft"}
          duration={400}
          delay={250}
          style={[
            styles.messageBubble,
            item.from === 'user' ? styles.userBubble : styles.galeBubble,
          ]}
        >
          <Text style={[
            styles.messageText,
            item.from === 'user' ? styles.messageTextUser : null
          ]}>
            {item.text}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={[
              styles.messageTime,
              item.from === 'user' ? styles.messageTimeUser : null
            ]}>
              {messageTime} {/* Use the safe time value here */}
            </Text>
            {item.from === 'user' && (
              <View style={styles.messageStatusContainer}>
                <StatusTransition currentStatus={item.status || 'sent'} />
              </View>
            )}
          </View>
        </Animatable.View>
      </MessageTransition>
    );
  };

    const { enhancedRenderItem, handleOutsidePress, activeMessageId } = addMessageReactionFeature(originalRenderItem);
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#14242F', '#1B4056']} style={styles.header}>
        <TouchableOpacity onPress={() => goBackFunction()}>
          <Icon style={styles.backIcon} name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('../assets/Chat-Female_Icon_Img.png')} 
            style={styles.avatar} 
          />
          <StatusCircle status={galeStatus} />
        </View>
        <View>
          <Text style={styles.galeName}>Gale</Text>
          <Text style={styles.typingText}>
            {isGaleTyping ? 'Typing…' : 
            galeStatus === 'online' ? 'Online' : 'Available'}
          </Text>
        </View>
      </LinearGradient>

      {/* CHAT */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.flexchat}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'height' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
        >
              <SectionList
              ref={listRef}
              sections={enhancedGroupedMessages}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={enhancedRenderItem}
              renderSectionHeader={renderDateHeader}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              initialNumToRender={10}
              windowSize={21}
              onEndReachedThreshold={0.2}
              progressViewOffset={50}
            />

          {/* INPUT */}
          <LinearGradient colors={['#08A2AF', '#0C839A']} style={styles.gradientContainer}>
            
            <Animatable.View
        animation="fadeInUp"
        duration={800}
        delay={250} style={styles.inputContainer} >
                <TextInput
  value={input}
  onChangeText={(text) => {
    setInput(text);
    playSound('typing');
    
    // Cancel any pending Gale response when user types
    if (isGaleTyping) {
      setShouldAbortResponse(true);
      setIsGaleTyping(false);
    }
    
    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to detect when user stops typing
    setTypingTimeout(setTimeout(() => {
      // User stopped typing
    }, 1000));
  }}
  placeholder="Type Message"
  placeholderTextColor="#ccc"
  style={styles.input}
  numberOfLines={5}
  multiline
/>
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
            </Animatable.View>
            <Text style={styles.infoText}>
                Gale can make mistakes. Please check important information.
            </Text>
            </LinearGradient>
        </KeyboardAvoidingView>
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChatScreen;


const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitionContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 0,
    marginLeft: 15,
    marginBottom:10,
    alignSelf: 'flex-start',
  },
  container: {
        flex: 1,
        backgroundColor: '#F6F6F6',
      },
  bubble: {
    maxWidth: '75%',
    padding: 4,
    borderRadius: 12,
  },
  messageStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  statusTransitionContainer: {
    position: 'relative',
    width: 13,
    height: 13,
    
  },
  statusIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 13,
    height: 13,
  },
  flex: {
    flex: 1,
    justifyContent: 'space-between'
  },
  flexchat: {
    flex: 1,
    backgroundColor: '#EFEBE0',
  },
  messageBubble: {
    borderRadius: 14,
    padding: 10,
    paddingBottom: 5,
    marginVertical:6,
  },
  galeBubble: {
    maxWidth: '64%',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    marginLeft:15,
  },
  userBubble: {
    maxWidth: '64%',
    backgroundColor: '#48A0AC',
    alignSelf: 'flex-end',
    marginRight:15,
    marginVertical:10,
  },
  messageText: {
    fontFamily: 'Lato-Regular',
    color: '#000',
    fontSize: 15,
  },
  messageTextUser: {
    color: '#fff',
    fontSize: 15,
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Lato-Regular',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageTimeUser: {
    fontSize: 11,
    color: '#fff',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop: 0,
  },
  gradientContainer: {
    padding: 10,
    paddingBottom:0,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    fontFamily: 'Lato-Regular',
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 240,
  },
  sendButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#14242F',
    borderRadius: 20,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
  infoText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 12,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    elevation: 4,        
  },
  backIcon: {
    fontSize: 28,
    marginRight:4,
    color: '#fff',
    fontWeight: 'bold',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  statusCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1B4056', // Should match your header gradient
  },
  galeName: {
    fontFamily: 'Lato-Bold',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  typingText: {
    fontFamily: 'Lato-Regular',
    color: '#fff',
    fontSize: 12,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dateHeaderText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#000',
  },
});