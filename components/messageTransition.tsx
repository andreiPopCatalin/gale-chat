import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const MessageTransition = ({ isTyping, children }) => {
    const animation = useRef(new Animated.Value(isTyping ? 0 : 1)).current;
  
    useEffect(() => {
      Animated.timing(animation, {
        toValue: isTyping ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isTyping]);
  
    const messageStyle = {
      opacity: animation,
      transform: [
        {
          scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1], 
          }),
        },
      ],
    };
  
    // Return only the animated view without extra containers
    return (
      <Animated.View style={messageStyle}>
        {children}
      </Animated.View>
    );
  };

  export default MessageTransition;