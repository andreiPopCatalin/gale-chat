# Gale Chat Application

## Overview
- React Native chat application with an AI assistant named Gale. Features realistic chat behaviors, animations, sound effects, and message persistence.
- I used some images by screenshoting them and removed bg to use them.
- The animations videos not working anymore in the requirements section pdf. But i downlaoded the app and view them there.

## Features
- **Core Chat**:
  - Message bubbles with status indicators (sent/delivered/read)
  - Typing indicators
  - Message history persistence
- **UI Enhancements**:
  - Quick-reaction emojis (long-press messages)
  - Copy to clipboard
  - Animated transitions
  - Sound effects (3 categories: UI, transitions, messages)
- **Gale Status System**:
  - Available → Online → Typing → Responding cycle
  - 10-15 second timeout before returning to "Available"

## Installation

### Requirements
- Node.js v14+
- Yarn or npm
- Android Studio (for Android emulator)
- Expo Go app (for physical device testing)

### Technical Stack
- React Native
- TypeScript
- Expo (Android only)
- AsyncStorage (for local message persistence)
- React Native Vector Icons
- Expo Linear Gradient
- React Native Animatable

### Setup
```bash
# Clone repository
git clone [repository-url]
cd gale-chat

# Install dependencies
npm intall
or
yarn install

# Start Android development
expo start --android
or
npm expo start
or
npm expo start --android


# Start the app on mobile
# Scan QR code with Expo Go app or use emulator
```


### 📱 Platform Support
| Platform | Test Status | Notes |
|----------|-------------|-------|
| Android  | ✅ Fully Tested | Primary development platform |
| iOS      | ⚠️ Untested | Requires Mac and IOS for proper testing |
| Web      | ❌ Untested | Expo web not configured |



### Key Features
**Realistic Chat Flow**: Message statuses (sent/delivered/read), typing indicators

**Rich Interactions**:
- Quick-reaction emojis
- Copy to clipboard
- Message animations
- Sound effects (UI, transitions, messages)

**Gale Status System**:
- User Message → Online → Typing → Response → Online → [Timeout] → Available

**Persistent Storage**: Message history saved between sessions

**Responsive Design**: Adapts to different screen sizes


## Roadmap
**Immediate Improvements**
- Implement loadMoreMessages ( so we wont load all messages in the chat and load them 40 by 40 or some rule )
- Implement proper scroll management
- Add pixel-perfect font scaling
- iOS compatibility testing
- Enhanced error handling
- Web support via Expo

## Development Notes
**Limitations**
- Currently Android-only due to:
- Lack of Mac/iOS test devices
- Expo web not configured


## 🧪Testing Matrix
- Verified Functionality
- Core Messaging
- Send/receive messages
- Message status updates
- Typing indicators
- UI Interactions
- Message reactions
- Clipboard copy
- Sound effects


## Bugs to be fixed
- Android system ui bar needs to be hidden when joining chat screen so it wont be overlaying on chat input. (This is diferent based on android settings if the bar is automaticaly hiding or staying permamently on bottom page).
- Store emoji reactions on messages even after user closes the chatscreen and reloads the app or joins the screen again.
- Gale sometimes not stoping typing if u start too late to write the message.



