import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";

  const TypingIndicator = ({ isTyping, dotColors = ['#F3B44D', '#02A0B0', '#4EC2D3'] }) => {
    const dotScale = useRef(new Animated.Value(1)).current;
  
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotScale, {
            toValue: 1.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dotScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
  
    useEffect(() => {
      if (isTyping) animateDots();
      else dotScale.setValue(1);
    }, [isTyping]);
  
    return (
      <View style={styles.typingContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.typingDot,
              {
                backgroundColor: dotColors[index],
                transform: [{ scale: dotScale }],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  export default TypingIndicator;
  
const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    padding:10,
    backgroundColor: '#fff',
    borderRadius:10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});