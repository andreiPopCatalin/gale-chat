// utils/soundPlayer.ts
import { Audio } from 'expo-av';

// Sound categories to control which sounds can interrupt others
const SOUND_CATEGORIES = {
  UI: 'ui', // UI sounds like taps, buttons
  MESSAGE: 'message', // Message related sounds 
  TRANSITION: 'transition', // Screen transition sounds
};

const soundFiles: Record<string, any> = {
  sendMessage: require('../assets/sounds/SendMessage_SFX.mp3'),
  tapSecondary: require('../assets/sounds/Tap-Secondary_SFX.mp3'),
  tapSingleOption: require('../assets/sounds/Tap-SingleOption_SFX.mp3'),
  transitionWooshUp: require('../assets/sounds/TransitionWoosh-Up_SFX.mp3'),
  typing: require('../assets/sounds/Typing_SFX.mp3'),
  messageAppear: require('../assets/sounds/Message-Appear_SFX.mp3'),
};

// Define category for each sound
const soundCategories: Record<string, string> = {
  sendMessage: SOUND_CATEGORIES.MESSAGE,
  tapSecondary: SOUND_CATEGORIES.UI,
  tapSingleOption: SOUND_CATEGORIES.UI,
  transitionWooshUp: SOUND_CATEGORIES.TRANSITION,
  typing: SOUND_CATEGORIES.UI,
  messageAppear: SOUND_CATEGORIES.MESSAGE,
};

// Sound players
const players: Record<string, Audio.Sound> = {};
let soundsLoaded = false;

// Track the last played time for each sound to prevent rapid repetition
const lastPlayedTime: Record<string, number> = {};
// Minimum time between sound plays (in milliseconds)
const DEBOUNCE_TIME = 100;

// Sound muting settings
let isMuted = false;
// Track which categories are muted
const mutedCategories: Record<string, boolean> = {
  [SOUND_CATEGORIES.UI]: false,
  [SOUND_CATEGORIES.MESSAGE]: false,
  [SOUND_CATEGORIES.TRANSITION]: false,
};

/**
 * Load all sounds into memory
 */
export const loadAllSounds = async () => {
  if (soundsLoaded) return;
  
  try {
    for (const key in soundFiles) {
      const { sound } = await Audio.Sound.createAsync(soundFiles[key]);
      players[key] = sound;
      // Initialize last played times
      lastPlayedTime[key] = 0;
    }
    soundsLoaded = true;
    console.log('✅ Sounds loaded');
  } catch (error) {
    console.warn('🔴 Error loading sounds:', error);
  }
};

/**
 * Play a sound if it's not muted and not played recently
 */
export const playSound = async (key: string, force = false) => {
  // Check if sound exists
  const player = players[key];
  if (!player) {
    console.warn(`⚠️ Failed to play sound "${key}": Player does not exist.`);
    return;
  }
  
  // Check global mute
  if (isMuted && !force) {
    return;
  }
  
  // Check category mute
  const category = soundCategories[key];
  if (mutedCategories[category] && !force) {
    return;
  }
  
  // Check debounce
  const now = Date.now();
  if (!force && now - lastPlayedTime[key] < DEBOUNCE_TIME) {
    return;
  }
  
  try {
    // Only stop sounds in the same category to allow UI sounds to play alongside message sounds
    if (category) {
      for (const soundKey in players) {
        if (soundCategories[soundKey] === category) {
          const currentPlayer = players[soundKey];
          const status = await currentPlayer.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await currentPlayer.stopAsync();
          }
        }
      }
    }
    
    // Reset and play
    await player.setPositionAsync(0);
    await player.playAsync();
    
    // Update last played time
    lastPlayedTime[key] = now;
    
    console.log(`▶️ Playing sound: "${key}" (category: ${category})`);
  } catch (error) {
    console.warn(`🔴 Failed to play sound "${key}":`, error);
  }
};

/**
 * Mute or unmute all sounds
 */
export const toggleMute = (mute?: boolean) => {
  isMuted = mute !== undefined ? mute : !isMuted;
  return isMuted;
};

/**
 * Mute or unmute a specific category of sounds
 */
export const toggleCategoryMute = (category: string, mute?: boolean) => {
  if (mutedCategories[category] !== undefined) {
    mutedCategories[category] = mute !== undefined ? mute : !mutedCategories[category];
  }
  return mutedCategories[category];
};

/**
 * Unload all sounds from memory
 */
export const unloadAllSounds = async () => {
  for (const key in players) {
    await players[key].unloadAsync();
  }
  soundsLoaded = false;
};

/**
 * Get sound configuration/state
 */
export const getSoundConfig = () => {
  return {
    isMuted,
    mutedCategories: { ...mutedCategories },
    isLoaded: soundsLoaded,
  };
};

// Export categories for use elsewhere
export const CATEGORIES = SOUND_CATEGORIES;