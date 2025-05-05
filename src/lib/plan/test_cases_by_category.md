# Test Cases By Category for Myth Buster App

This document organizes test cases by functional and non-functional categories, focusing on specific aspects of the Myth Buster app.

## Core Functionality Test Cases

### Input Validation Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| IV-01 | Empty input | 1. Leave input field empty<br>2. Attempt to submit | Submit button remains disabled |
| IV-02 | Minimum input length | 1. Enter 2 characters<br>2. Attempt to submit | Submit button remains disabled |
| IV-03 | Valid input | 1. Enter "The Earth is round"<br>2. Check submit button | Submit button becomes enabled |
| IV-04 | Maximum input length | 1. Enter 501 characters<br>2. Check for validation message | Error message indicates excessive length |
| IV-05 | Input with special characters | 1. Enter text with HTML tags<br>2. Submit the form | Input is sanitized before processing |
| IV-06 | SQL injection attempt | 1. Enter SQL injection pattern<br>2. Submit the form | Input is sanitized, no injection occurs |
| IV-07 | Multi-line input | 1. Enter text with line breaks<br>2. Submit the form | Input is processed correctly |
| IV-08 | Input with emojis/unicode | 1. Enter text with emoji characters<br>2. Submit the form | Input is processed correctly |

### API Integration Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| API-01 | Successful API call | 1. Enter valid statement<br>2. Submit the form | API request is sent correctly |
| API-02 | API response parsing | 1. Submit valid statement<br>2. Receive API response | Response is parsed correctly into app state |
| API-03 | API error handling (400) | 1. Trigger a 400 error<br>2. Observe error handling | Appropriate error message displayed |
| API-04 | API error handling (500) | 1. Trigger a 500 error<br>2. Observe error handling | Server error message displayed |
| API-05 | API timeout handling | 1. Trigger a timeout<br>2. Observe timeout handling | Timeout message displayed after appropriate wait |
| API-06 | Network failure handling | 1. Disconnect network<br>2. Submit statement | Offline error message displayed |
| API-07 | Caching behavior | 1. Submit statement<br>2. Submit same statement again | Second request uses cached data |
| API-08 | Cache expiration | 1. Submit statement<br>2. Modify cache timestamp to be old<br>3. Submit same statement | Fresh API request is made |
| API-09 | Rate limiting handling | 1. Trigger rate limit error<br>2. Observe handling | Appropriate message with retry information |
| API-10 | Request cancellation | 1. Submit statement<br>2. Navigate away or cancel<br>3. Check for lingering requests | Request is properly cancelled |

### Verdict Classification Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| VC-01 | Clear true statement | 1. Submit "The Earth revolves around the Sun"<br>2. Observe classification | Classified as "true" |
| VC-02 | Clear false statement | 1. Submit "The Earth is flat"<br>2. Observe classification | Classified as "false" |
| VC-03 | Inconclusive statement | 1. Submit "Vitamin C prevents colds"<br>2. Observe classification | Classified as "inconclusive" |
| VC-04 | Ambiguous response | 1. Submit statement with mixed evidence<br>2. Observe classification | Appropriate classification based on predominant evidence |
| VC-05 | Empty API response | 1. Trigger empty response<br>2. Observe handling | Graceful error handling |
| VC-06 | Scientific myth | 1. Submit "We only use 10% of our brain"<br>2. Observe classification | Correctly classified as "false" |
| VC-07 | Historical myth | 1. Submit "Columbus discovered that the Earth is round"<br>2. Observe classification | Correctly classified as "false" |
| VC-08 | Medical myth | 1. Submit "Cracking knuckles causes arthritis"<br>2. Observe classification | Correctly classified as "false" |
| VC-09 | Partially true statement | 1. Submit statement with nuanced truth<br>2. Observe classification | Appropriate classification with explanation |
| VC-10 | Question format | 1. Submit statement as question<br>2. Observe handling | Properly processed despite question format |

### Citation Rendering Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| CR-01 | Multiple citations | 1. Submit statement with multiple sources<br>2. Observe citation list | All citations displayed correctly |
| CR-02 | No citations | 1. Trigger response with empty sources<br>2. Observe citation area | No citations section or appropriate message |
| CR-03 | Citation links | 1. Submit statement<br>2. Click citation link | Link opens in new tab with correct URL |
| CR-04 | Long citation titles | 1. Trigger response with long source titles<br>2. Observe rendering | Titles displayed properly, possibly truncated with ellipsis |
| CR-05 | Citation with missing URL | 1. Trigger response with missing URL<br>2. Observe rendering | Citation displayed without link or with appropriate fallback |
| CR-06 | Citation ordering | 1. Submit statement with multiple sources<br>2. Observe citation order | Citations displayed in order received from API |

## User Experience Test Cases

### Visual Feedback Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| VF-01 | Loading state | 1. Submit statement<br>2. Observe during API call | Loading indicator visible during processing |
| VF-02 | True verdict cues | 1. Trigger true verdict<br>2. Observe visual indicators | Green check icon with appropriate styling |
| VF-03 | False verdict cues | 1. Trigger false verdict<br>2. Observe visual indicators | Red X icon with appropriate styling |
| VF-04 | Inconclusive verdict cues | 1. Trigger inconclusive verdict<br>2. Observe visual indicators | Purple question mark with appropriate styling |
| VF-05 | Form validation feedback | 1. Enter invalid input<br>2. Observe validation feedback | Clear visual indication of validation errors |
| VF-06 | Button state changes | 1. Observe button in different states<br>2. Interact with button | Clear visual differentiation between states |
| VF-07 | Error state visuals | 1. Trigger various errors<br>2. Observe error displays | Visually distinctive error messages |
| VF-08 | Focus indicators | 1. Tab through interface<br>2. Observe focus indicators | Clear visual indication of focused elements |

### Audio Feedback Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AF-01 | True verdict sound | 1. Enable audio<br>2. Trigger true verdict | Appropriate success sound plays once |
| AF-02 | False verdict sound | 1. Enable audio<br>2. Trigger false verdict | Appropriate negative sound plays once |
| AF-03 | Inconclusive verdict sound | 1. Enable audio<br>2. Trigger inconclusive verdict | Appropriate neutral sound plays once |
| AF-04 | Audio toggle | 1. Toggle audio setting on/off<br>2. Trigger verdicts | Sounds play only when enabled |
| AF-05 | Audio persistence | 1. Set audio preference<br>2. Reload page<br>3. Check setting | Audio preference persists across sessions |
| AF-06 | Simultaneous sounds | 1. Trigger multiple verdicts quickly<br>2. Listen for overlapping sounds | Sounds do not overlap problematically |
| AF-07 | Audio with system muted | 1. Mute system audio<br>2. Enable in-app audio<br>3. Trigger verdict | No errors occur when system is muted |

### Theme Toggle Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TT-01 | Light to dark toggle | 1. Start in light mode<br>2. Click theme toggle | UI switches to dark mode |
| TT-02 | Dark to light toggle | 1. Start in dark mode<br>2. Click theme toggle | UI switches to light mode |
| TT-03 | Theme persistence | 1. Set theme preference<br>2. Reload page | Theme preference persists |
| TT-04 | System preference default | 1. Clear stored preference<br>2. Set system preference<br>3. Load app | App respects system preference |
| TT-05 | Theme override | 1. Set system preference<br>2. Set app preference<br>3. Check theme | App preference overrides system |
| TT-06 | Theme CSS application | 1. Toggle theme<br>2. Inspect elements | All components adopt theme colors correctly |
| TT-07 | Theme toggle accessibility | 1. Navigate to toggle with keyboard<br>2. Activate with Enter key | Theme changes appropriately |

### User Onboarding Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| UO-01 | First visit detection | 1. Clear storage<br>2. Load app | Onboarding experience appears |
| UO-02 | Onboarding flow | 1. Start onboarding<br>2. Progress through steps | Steps progress correctly |
| UO-03 | Sample myths | 1. View sample myths<br>2. Select a sample | Sample is submitted for verification |
| UO-04 | Skip onboarding | 1. Start onboarding<br>2. Click skip option | Onboarding is bypassed |
| UO-05 | Onboarding completion | 1. Complete onboarding<br>2. Reload page | Onboarding does not appear again |
| UO-06 | Help access | 1. Complete onboarding<br>2. Look for help option | Help is accessible after onboarding |
| UO-07 | Tooltip guidance | 1. Fresh installation<br>2. Observe interface | Helpful tooltips guide new users |

## Responsive Design Test Cases

### Mobile Device Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MD-01 | Small mobile layout (320px) | 1. View on 320px wide device<br>2. Check for horizontal scrolling | No horizontal scrolling, layout adjusts |
| MD-02 | Medium mobile layout (375px) | 1. View on 375px wide device<br>2. Check form and results display | Elements properly sized for viewport |
| MD-03 | Large mobile layout (428px) | 1. View on 428px wide device<br>2. Check content flow | Appropriate layout for larger phones |
| MD-04 | Mobile portrait & landscape | 1. View in portrait<br>2. Rotate to landscape<br>3. Check layout | Layout adjusts appropriately to orientation |
| MD-05 | Touch targets | 1. View on touch device<br>2. Tap interactive elements | Touch targets are sufficient size (min 44px) |
| MD-06 | Virtual keyboard | 1. Tap input field on mobile<br>2. Enter text using virtual keyboard | Form handles virtual keyboard properly |
| MD-07 | Pinch zoom | 1. Attempt to zoom content<br>2. Interact with zoomed interface | Content remains usable when zoomed |
| MD-08 | Mobile scrolling | 1. Generate long results<br>2. Scroll through content | Smooth scrolling, no content clipping |

### Tablet Device Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TD-01 | Small tablet layout (768px) | 1. View on iPad Mini (768px)<br>2. Check layout | Layout adapts for tablet width |
| TD-02 | Large tablet layout (1024px) | 1. View on iPad Pro (1024px)<br>2. Check layout | Layout uses space efficiently |
| TD-03 | Tablet portrait & landscape | 1. View in portrait<br>2. Rotate to landscape<br>3. Check layout | Layout adjusts appropriately to orientation |
| TD-04 | Split screen mode | 1. Use tablet split screen<br>2. Check app layout | App responds to reduced width |

### Desktop Layouts Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| DL-01 | Small desktop (1280px) | 1. View at 1280px width<br>2. Check layout | Layout uses space efficiently |
| DL-02 | Large desktop (1920px) | 1. View at 1920px width<br>2. Check layout | Content has reasonable maximum width |
| DL-03 | Ultra-wide screen (3440px) | 1. View on ultra-wide screen<br>2. Check layout | Content doesn't stretch unreasonably wide |
| DL-04 | Window resizing | 1. Load at desktop width<br>2. Resize window smaller<br>3. Resize window larger | Layout responds smoothly to resizing |

## Accessibility Test Cases

### Keyboard Navigation Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| KN-01 | Tab navigation | 1. Use Tab key to navigate<br>2. Check focus order | Focus moves in logical order |
| KN-02 | Enter key submission | 1. Focus on submit button<br>2. Press Enter | Form submits successfully |
| KN-03 | Form controls | 1. Navigate to form elements<br>2. Interact using keyboard | All controls operable via keyboard |
| KN-04 | Modal interaction | 1. Open any modal dialog<br>2. Interact via keyboard<br>3. Attempt to Tab out | Focus trapped within modal |
| KN-05 | Skip links | 1. Press Tab on page load<br>2. Look for skip link | Skip to content link available |
| KN-06 | Keyboard shortcuts | 1. Use defined keyboard shortcuts<br>2. Check functionality | Shortcuts work as expected |
| KN-07 | Focus restoration | 1. Trigger action that changes content<br>2. Check focus position | Focus restored to logical position |

### Screen Reader Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SR-01 | Form labeling | 1. Navigate form with screen reader<br>2. Check field announcements | Fields have descriptive labels |
| SR-02 | Button labeling | 1. Navigate to buttons<br>2. Check announcements | Buttons have clear descriptions |
| SR-03 | Status announcements | 1. Submit form<br>2. Listen for status updates | Loading and results announced via aria-live |
| SR-04 | Result announcements | 1. Get verification result<br>2. Check result announcement | Verdict announced clearly |
| SR-05 | Error announcements | 1. Trigger error state<br>2. Check announcement | Errors announced immediately |
| SR-06 | Icon accessibility | 1. Navigate to verdict icons<br>2. Check announcements | Icons have text alternatives |
| SR-07 | Link purpose | 1. Navigate to citation links<br>2. Check announcements | Link purpose is clear in context |

### Color and Contrast Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| CC-01 | Light mode text contrast | 1. View in light mode<br>2. Check text contrast | Text meets WCAG AA ratio (4.5:1) |
| CC-02 | Dark mode text contrast | 1. View in dark mode<br>2. Check text contrast | Text meets WCAG AA ratio (4.5:1) |
| CC-03 | UI controls contrast | 1. Check buttons, inputs, etc.<br>2. Measure contrast | Controls meet WCAG AA ratio (3:1) |
| CC-04 | Color independence | 1. View in grayscale<br>2. Check information conveyance | No information conveyed by color alone |
| CC-05 | Focus indicator contrast | 1. Tab through interface<br>2. Check focus indicators | Focus indicators have sufficient contrast |
| CC-06 | Error indication | 1. Trigger form errors<br>2. Check error indication | Errors indicated by more than just color |
| CC-07 | Link identification | 1. Check link styling<br>2. Evaluate visibility | Links visually distinct from surrounding text |

### Motion and Animation Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MA-01 | Reduced motion preference | 1. Enable reduced motion<br>2. Observe animations | Animations reduced or disabled |
| MA-02 | Animation timing | 1. Trigger animations<br>2. Time duration | Animations complete in reasonable time |
| MA-03 | Animation pausing | 1. Trigger animation<br>2. Attempt to pause | Animations can be paused if necessary |
| MA-04 | No seizure triggers | 1. Check all animations<br>2. Evaluate flashing elements | No elements flash more than 3 times per second |
| MA-05 | Motion distraction | 1. Review all animations<br>2. Evaluate distraction level | Animations don't distract from content |

## Performance Test Cases

### Loading Performance Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| LP-01 | Initial page load | 1. Measure time to first contentful paint<br>2. Measure time to interactive | FCP < 1.5s, TTI < 3s |
| LP-02 | Bundle size | 1. Measure JavaScript bundle size<br>2. Check for code splitting | Main bundle < 200KB, chunks loaded as needed |
| LP-03 | Resource loading | 1. Check resource waterfall<br>2. Evaluate loading order | Critical resources prioritized |
| LP-04 | First input delay | 1. Load page<br>2. Measure time until first input processed | FID < 100ms |
| LP-05 | Caching effectiveness | 1. Load page<br>2. Reload page<br>3. Check resource loading | Appropriate resources cached |

### API Performance Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| AP-01 | Request optimization | 1. Submit verification<br>2. Analyze request payload | Minimal, necessary data sent |
| AP-02 | Response processing time | 1. Measure time from response receipt to UI update | Processing < 100ms |
| AP-03 | Concurrent requests | 1. Trigger multiple requests<br>2. Check handling | Requests properly managed, no blocking |
| AP-04 | Cache hit performance | 1. Measure verification with cache miss<br>2. Measure same verification with cache hit | Cache hit significantly faster |
| AP-05 | Large response handling | 1. Trigger large API response<br>2. Measure parsing and rendering time | Handles large data efficiently |

### Animation Performance Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ANP-01 | Animation frame rate | 1. Enable performance monitor<br>2. Trigger animations<br>3. Measure FPS | Maintains 60fps |
| ANP-02 | CPU usage during animations | 1. Monitor CPU during animations<br>2. Check for spikes | CPU usage remains reasonable |
| ANP-03 | Animation concurrent with API | 1. Trigger animation during API request<br>2. Check for interference | Both processes run smoothly |
| ANP-04 | Animation on low-end devices | 1. Test on low-end device<br>2. Trigger animations | Animations remain smooth or gracefully degrade |

### Memory Usage Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MU-01 | Memory leaks | 1. Monitor memory during extended use<br>2. Check for continuous growth | No significant memory growth over time |
| MU-02 | DOM node count | 1. Check DOM size<br>2. Perform various operations | DOM size remains reasonable |
| MU-03 | Event listener cleanup | 1. Add and remove components<br>2. Check event listeners | Listeners properly removed with components |
| MU-04 | Local storage usage | 1. Cache multiple results<br>2. Check storage usage | Storage usage grows predictably and has limits |

## Browser Compatibility Test Cases

### Modern Browser Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MB-01 | Chrome latest | 1. Test core functionality in Chrome<br>2. Verify visual appearance | Works as expected |
| MB-02 | Firefox latest | 1. Test core functionality in Firefox<br>2. Verify visual appearance | Works as expected |
| MB-03 | Safari latest | 1. Test core functionality in Safari<br>2. Verify visual appearance | Works as expected |
| MB-04 | Edge latest | 1. Test core functionality in Edge<br>2. Verify visual appearance | Works as expected |
| MB-05 | Feature detection | 1. Check feature detection implementation<br>2. Verify fallbacks | Features detected correctly, fallbacks work |

### Mobile Browser Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MOB-01 | Mobile Safari | 1. Test on iOS Safari<br>2. Verify functionality and appearance | Works as expected |
| MOB-02 | Mobile Chrome | 1. Test on Android Chrome<br>2. Verify functionality and appearance | Works as expected |
| MOB-03 | Mobile Firefox | 1. Test on Mobile Firefox<br>2. Verify functionality and appearance | Works as expected |
| MOB-04 | Samsung Internet | 1. Test on Samsung Internet<br>2. Verify functionality and appearance | Works as expected |

### Browser Feature Support Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| BF-01 | LocalStorage support | 1. Test with LocalStorage disabled<br>2. Check for fallback | App works with reduced functionality |
| BF-02 | Modern CSS support | 1. Test in browsers with varying CSS support<br>2. Check visual degradation | Graceful degradation of styles |
| BF-03 | JavaScript features | 1. Check use of modern JS features<br>2. Verify transpilation | Code runs in all target browsers |
| BF-04 | Flexbox/Grid support | 1. Test layout in browsers with varied support<br>2. Check layout | Layout maintains integrity |
| BF-05 | Web Audio API | 1. Test audio in browsers with varied support<br>2. Check for errors | Audio works where supported, fails gracefully elsewhere |

## Specific Myths Test Cases

### Scientific Myths Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SM-01 | "Earth is flat" | 1. Submit "The Earth is flat"<br>2. Observe verdict and explanation | Classified as "false" with scientific explanation |
| SM-02 | "We only use 10% of our brain" | 1. Submit "Humans only use 10% of their brain"<br>2. Observe verdict and explanation | Classified as "false" with neuroscience explanation |
| SM-03 | "Vaccines cause autism" | 1. Submit "Vaccines cause autism"<br>2. Observe verdict and explanation | Classified as "false" with medical evidence |
| SM-04 | "Evolution is just a theory" | 1. Submit "Evolution is just a theory, not fact"<br>2. Observe verdict and explanation | Appropriate explanation of scientific terminology |
| SM-05 | "GMOs are dangerous" | 1. Submit "GMOs are dangerous to human health"<br>2. Observe verdict and explanation | Nuanced explanation of the evidence |

### Historical Myths Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| HM-01 | "Columbus proved Earth round" | 1. Submit "Columbus proved the Earth was round"<br>2. Observe verdict and explanation | Classified as "false" with historical context |
| HM-02 | "Napoleon was short" | 1. Submit "Napoleon Bonaparte was very short"<br>2. Observe verdict and explanation | Classified as "false" with historical context |
| HM-03 | "Vikings wore horned helmets" | 1. Submit "Vikings wore horned helmets in battle"<br>2. Observe verdict and explanation | Classified as "false" with archaeological evidence |
| HM-04 | "Great Wall visible from space" | 1. Submit "The Great Wall of China is visible from space"<br>2. Observe verdict and explanation | Classified appropriately with astronaut testimony |
| HM-05 | "Einstein failed math" | 1. Submit "Einstein failed math as a student"<br>2. Observe verdict and explanation | Classified as "false" with biographical evidence |

### Health Myths Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| HEM-01 | "Cracking knuckles causes arthritis" | 1. Submit "Cracking your knuckles causes arthritis"<br>2. Observe verdict and explanation | Classified as "false" with medical explanation |
| HEM-02 | "Vitamin C prevents colds" | 1. Submit "Vitamin C prevents the common cold"<br>2. Observe verdict and explanation | Classified with nuanced explanation |
| HEM-03 | "Reading in dim light harms eyes" | 1. Submit "Reading in dim light damages your eyesight"<br>2. Observe verdict and explanation | Classified as "false" with medical evidence |
| HEM-04 | "We need to drink 8 glasses of water" | 1. Submit "You need to drink 8 glasses of water daily"<br>2. Observe verdict and explanation | Classified with nuanced hydration explanation |
| HEM-05 | "Carrots improve night vision" | 1. Submit "Eating carrots significantly improves night vision"<br>2. Observe verdict and explanation | Classified with historical context of the myth |

### Nuanced or Context-Dependent Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ND-01 | "Coffee stunts growth" | 1. Submit "Coffee stunts growth in children"<br>2. Observe verdict and explanation | Classified with nuanced explanation |
| ND-02 | "Breakfast is most important meal" | 1. Submit "Breakfast is the most important meal"<br>2. Observe verdict and explanation | Classified with balanced nutritional context |
| ND-03 | "Sugar causes hyperactivity" | 1. Submit "Sugar causes hyperactivity in children"<br>2. Observe verdict and explanation | Classified with reference to scientific studies |
| ND-04 | "Dogs see in black and white" | 1. Submit "Dogs see in black and white"<br>2. Observe verdict and explanation | Classified as "false" with explanation of canine vision |
| ND-05 | "Alcohol kills brain cells" | 1. Submit "Alcohol kills brain cells"<br>2. Observe verdict and explanation | Classified with nuanced explanation of alcohol's effects |

## Test Execution Plan

| Category | Test Cases | Priority | Time Allocation | Testing Method |
|----------|------------|----------|-----------------|----------------|
| Input Validation | IV-01 to IV-08 | High | 1-2 hours | Automated + Manual |
| API Integration | API-01 to API-10 | High | 2-3 hours | Automated |
| Verdict Classification | VC-01 to VC-10 | High | 2-3 hours | Automated + Manual |
| Citation Rendering | CR-01 to CR-06 | Medium | 1-2 hours | Automated + Manual |
| Visual Feedback | VF-01 to VF-08 | Medium | 1-2 hours | Manual |
| Audio Feedback | AF-01 to AF-07 | Low | 1 hour | Manual |
| Theme Toggle | TT-01 to TT-07 | Medium | 1 hour | Automated + Manual |
| User Onboarding | UO-01 to UO-07 | Medium | 1-2 hours | Manual |
| Mobile Device | MD-01 to MD-08 | High | 2-3 hours | Manual |
| Tablet Device | TD-01 to TD-04 | Medium | 1-2 hours | Manual |
| Desktop Layouts | DL-01 to DL-04 | Medium | 1 hour | Manual |
| Keyboard Navigation | KN-01 to KN-07 | High | 1-2 hours | Manual |
| Screen Reader | SR-01 to SR-07 | High | 2-3 hours | Manual |
| Color and Contrast | CC-01 to CC-07 | High | 1-2 hours | Automated + Manual |
| Motion and Animation | MA-01 to MA-05 | Medium | 1 hour | Manual |
| Loading Performance | LP-01 to LP-05 | High | 1-2 hours | Automated |
| API Performance | AP-01 to AP-05 | High | 1-2 hours | Automated |
| Animation Performance | ANP-01 to ANP-04 | Medium | 1 hour | Automated + Manual |
| Memory Usage | MU-01 to MU-04 | Medium | 1-2 hours | Automated |
| Modern Browser | MB-01 to MB-05 | High | 2-3 hours | Automated + Manual |
| Mobile Browser | MOB-01 to MOB-04 | High | 2-3 hours | Manual |
| Browser Feature Support | BF-01 to BF-05 | Medium | 1-2 hours | Manual |
| Scientific Myths | SM-01 to SM-05 | High | 1-2 hours | Manual |
| Historical Myths | HM-01 to HM-05 | High | 1-2 hours | Manual |
| Health Myths | HEM-01 to HEM-05 | High | 1-2 hours | Manual |
| Nuanced Cases | ND-01 to ND-05 | High | 1-2 hours | Manual |

Total estimated testing time: 35-55 hours. This can be optimized by:
1. Automating high-priority test cases
2. Running compatible tests in parallel
3. Using a risk-based approach to prioritize critical test cases when time is limited