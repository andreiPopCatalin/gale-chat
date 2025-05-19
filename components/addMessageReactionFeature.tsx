import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Clipboard, 
  StyleSheet,
  Animated,
  ToastAndroid, // or Alert for iOS
  Platform,
  Alert
} from 'react-native';
// We'll also use Ionicons for more emoji-like icons
import Icon from 'react-native-vector-icons/Feather';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { playSound } from '../utils/soundPlayer';

// This function would be added to your component
const addMessageReactionFeature = (renderItem) => {
  // Track which message has active reaction menu
  const [activeMessageId, setActiveMessageId] = useState(null);
  
  // State to store reactions on messages
  const [messageReactions, setMessageReactions] = useState({});
  
  // Animation value for reaction menu
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  // Available reactions
  const reactions = [
    { id: 'heart', icon: <IonIcon name="heart" size={24} color="#FF5959" />, emoji: '❤️' },
    { id: 'thumbsUp', icon: <IonIcon name="thumbs-up" size={24} color="#33A1FF" />, emoji: '👍' },
    { id: 'smile', icon: <IonIcon name="happy" size={24} color="#FFC843" />, emoji: '😊' }
  ];
  
  // Function to copy message text
  const copyMessageText = (text) => {
    Clipboard.setString(text);
    
    // Show toast or alert based on platform
    if (Platform.OS === 'android') {
      ToastAndroid.show('Message copied to clipboard', ToastAndroid.SHORT);
    } else {
      // For iOS
      Alert.alert('Copied', 'Message copied to clipboard');
    }
    playSound('tapSingleOption');
    // Close reaction menu
    setActiveMessageId(null);
  };
  
  // Function to add reaction to a message
  const addReaction = (messageId, reactionId) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: reactionId
    }));
    playSound('tapSingleOption');
    setActiveMessageId(null);
  };
  
  // Animation for opening reaction menu
  const showReactionMenu = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true
    }).start();
  };
  
  // Animation for closing reaction menu
  const hideReactionMenu = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setActiveMessageId(null));
  };
  
  // Enhanced render item function that wraps the original
  const enhancedRenderItem = ({ item }) => {
    const originalRenderedItem = renderItem({ item });
    
    // Get current reaction for this message
    const currentReaction = messageReactions[item.id];
    const reactionEmoji = currentReaction ? 
      reactions.find(r => r.id === currentReaction)?.emoji : null;
    
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => {
            setActiveMessageId(item.id);
            showReactionMenu();
            playSound('tapSecondary');
          }}
          delayLongPress={200}
        >
          {originalRenderedItem}
        </TouchableOpacity>
        
        {/* Display reaction if any */}
        {reactionEmoji && (
          <View style={[
            styles.reactionContainer,
            item.from === 'user' ? styles.userReaction : styles.galeReaction
          ]}>
            <Text style={styles.reactionText}>{reactionEmoji}</Text>
          </View>
        )}
        
        {/* Reaction Menu */}
        {activeMessageId === item.id && (
          <Animated.View 
            style={[
              styles.reactionMenu,
              item.from === 'user' ? styles.userReactionMenu : styles.galeReactionMenu,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.reactionOptions}>
              {reactions.map(reaction => (
                <TouchableOpacity
                  key={reaction.id}
                  style={styles.reactionButton}
                  onPress={() => addReaction(item.id, reaction.id)}
                >
                  {reaction.icon}
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyMessageText(item.text)}
            >
              <Icon name="copy" size={22} color="#555" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  // Close reaction menu when tapping elsewhere
  const handleOutsidePress = () => {
    if (activeMessageId) {
      hideReactionMenu();
    }
  };
  
  return {
    enhancedRenderItem,
    handleOutsidePress,
    activeMessageId
  };
};

// Styles to add
const styles = StyleSheet.create({
  reactionMenu: {
    position: 'absolute',
    top: -40,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userReactionMenu: {
    right: 10,
  },
  galeReactionMenu: {
    left: 10,
  },
  reactionOptions: {
    flexDirection: 'row',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 8,
    marginRight: 8,
  },
  reactionButton: {
    marginHorizontal: 6,
    padding: 4,
  },
  copyButton: {
    padding: 4,
  },
  reactionContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  userReaction: {
    right: 10,
  },
  galeReaction: {
    left: 10,
  },
  reactionText: {
    fontSize: 16,
  },
});

export default addMessageReactionFeature;