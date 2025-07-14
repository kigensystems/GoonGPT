## Current Task
- [ ] Fix immediate UI inconsistencies in video mode
- [ ] Plan architectural consolidation to eliminate code duplication

## Completed - Component Refactoring (40% App.tsx Reduction)
- [x] Hook validation pipeline implemented
- [x] CLAUDE.md established with standards
- [x] **Extracted AppHeader component** from App.tsx (74 lines removed)
  - Reduced App.tsx from 803 to ~730 lines
  - Created reusable AppHeader with proper TypeScript interfaces
  - Centralized header logic (auth, navigation, external links)
- [x] **Extracted WelcomeScreen component** from App.tsx (213 lines removed)
  - Reduced App.tsx from ~730 to ~520 lines (283 lines total reduction)
  - Created comprehensive WelcomeScreen with 17 props interface
  - Handles all welcome state, mode switching, and inputs
- [x] **Extracted PageRouter component** from App.tsx (40+ lines removed)
  - Reduced App.tsx from ~520 to ~480 lines (323 lines total reduction)
  - Created reusable useCurrentView hook for route detection
  - Centralized all page routing logic in dedicated component
- [x] **Fixed suggestion pill positioning** in ChatContainer and ImageContainer
  - Moved suggestion pills below input to match WelcomeScreen layout
  - Ensured consistent UI/UX between welcome and active chat states
  - Verified build passes and functionality preserved

## Identified Issues - UI Inconsistencies
- [ ] **Video mode missing suggestion pills** in WelcomeScreen (mode === 'video' case missing)
- [ ] **Video mode missing instructions** in VideoContainer (upload instruction + yellow warning box)
- [ ] **Code duplication** between WelcomeScreen and Container components
  - Each container has its own welcome screen fallback
  - Duplicated mode toggles, inputs, and suggestion logic
  - Maintenance burden: changes needed in multiple places

## Immediate Fixes Needed
- [ ] Add video suggestion pills to WelcomeScreen component
- [ ] Add instructional messages to VideoContainer welcome screen
- [ ] Ensure video mode UI consistency between states

## Future Architectural Improvements
- [ ] **Consolidate Container Architecture** (Major Refactor)
  - Problem: WelcomeScreen + 5 Container components duplicate layout logic
  - Solution: Single unified container with conditional message display
  - Benefits: Eliminate duplication, consistent UX, easier maintenance
  - Risk: High - touches many components, needs careful planning
- [ ] **Extract Custom Hooks** for state management
  - sendMessage, sendVideo, sendAsmr, sendDeepfake functions
  - Mode state management and switching logic
  - Message state and synchronization
- [ ] **Component Optimization**
  - Break down large container components
  - Implement proper memoization where needed
  - Consider lazy loading for container components

## Development Standards
- [ ] Automate Claude subagent workflows
- [ ] Implement slash commands for common workflows
- [ ] Maintain CLAUDE.md compliance in all changes
