import { useEffect, useRef, useState } from "react";
import {
    View,
    Animated,
    ImageStyle,
    StyleSheet
  } from 'react-native';

  const StatusTransition = ({
    currentStatus,
  }: {
    currentStatus: 'sending' | 'sent' | 'seen' | 'error';
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const [status, setStatus] = useState(currentStatus);
    const [prevStatus, setPrevStatus] = useState(currentStatus);
  
    useEffect(() => {
      if (currentStatus !== status) {
        setPrevStatus(status);
        setStatus(currentStatus);
        fadeAnim.setValue(0);
  
        const animations = [
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ];
  
        if (currentStatus === 'seen') {
          rotateAnim.setValue(0);
          animations.unshift(
            Animated.timing(rotateAnim, {
              toValue: 2,
              duration: 300,
              useNativeDriver: true,
            })
          );
        }
  
        Animated.parallel(animations).start();
      }
    }, [currentStatus]);
  
    const getStatusIcon = (statusType: string) => {
      switch (statusType) {
        case 'sending':
          return require('../assets/TickSent_Icon.png');
        case 'sent':
          return require('../assets/TickDelivered_Icon.png');
        case 'seen':
          return require('../assets/TickRead_Icon.png');
        case 'error':
          return require('../assets/NotDelivered_Icon.png');
        default:
          return require('../assets/TickSent_Icon.png');
      }
    };
  
    // Rotate Y interpolation
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'], // simulate flip
    });
  
    return (
      <View style={styles.statusTransitionContainer}>
        <Animated.Image
          source={getStatusIcon(prevStatus)}
          style={[
            styles.statusIcon,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
        <Animated.Image
          source={getStatusIcon(status)}
          style={[
            styles.statusIcon,
            {
              opacity: fadeAnim,
              transform: [{ rotateY: status === 'seen' ? rotation : '0deg' }],
            } as ImageStyle,
          ]}
        />
      </View>
    );
  };

  export default StatusTransition;

  
  const styles = StyleSheet.create({
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
  });