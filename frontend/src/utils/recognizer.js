// ─── VisiGesture AI Unified Recognizer ──────────────────────────────────────────

/**
 * Calculates Euclidean distance between two 3D points
 */
const dist = (p1, p2) => {
  if (!p1 || !p2) return 0
  return Math.hypot(p1.x - p2.x, p1.y - p2.y, (p1.z || 0) - (p2.z || 0))
}

/**
 * Recognizes ASL Hand Gestures (A-Z) and custom words
 * @param {Array} lm - MediaPipe 21 Hand Landmarks
 * @returns {Object|null} - Recognized gesture details
 */
export const recognizeSign = (lm) => {
  if (!lm || lm.length < 21) return null

  // Wrist
  const wrist = lm[0]

  // Fingers landmarks
  // Thumb
  const tMcp = lm[2], tIp = lm[3], tTip = lm[4]
  // Index
  const iMcp = lm[5], iPip = lm[6], iDip = lm[7], iTip = lm[8]
  // Middle
  const mMcp = lm[9], mPip = lm[10], mDip = lm[11], mTip = lm[12]
  // Ring
  const rMcp = lm[13], rPip = lm[14], rDip = lm[15], rTip = lm[16]
  // Pinky
  const pMcp = lm[17], pPip = lm[18], pDip = lm[19], pTip = lm[20]

  // Detect whether fingers are extended based on vertical alignment and distance from MCP
  const iE = iTip.y < iPip.y && iPip.y < iMcp.y
  const mE = mTip.y < mPip.y && mPip.y < mMcp.y
  const rE = rTip.y < rPip.y && rPip.y < rMcp.y
  const pE = pTip.y < pPip.y && pPip.y < pMcp.y
  
  // Folded state
  const iF = iTip.y > iPip.y
  const mF = mTip.y > mPip.y
  const rF = rTip.y > rPip.y
  const pF = pTip.y > pPip.y

  // Thumb extension heuristic
  const tE = dist(tTip, wrist) > dist(tMcp, wrist) * 1.15 && dist(tTip, iMcp) > 0.07

  // Inter-finger distances
  const dIM = dist(iTip, mTip)
  const dMR = dist(mTip, rTip)
  const dRP = dist(rTip, pTip)
  const dTI = dist(tTip, iTip)
  const dTM = dist(tTip, mTip)
  const dTR = dist(tTip, rTip)
  const dTP = dist(tTip, pTip)

  // 1. Hello / Open Hand / B / Stop / School
  if (iE && mE && rE && pE) {
    if (dIM < 0.04 && dMR < 0.04 && dRP < 0.04) {
      if (!tE) {
        // Flat hand, thumb in - ASL B / Stop / School
        return { letter: 'B', word: 'Stop', confidence: 0.96, label: 'Stop / School / B' }
      }
      // Flat hand, thumb out - Please / Thank You shape
      return { letter: 'B', word: 'Please', confidence: 0.96, label: 'Please / Thank You / B' }
    }
    if (tE) {
      return { letter: 'Hello', word: 'Hello', confidence: 0.98, label: 'Hello / Welcome' }
    }
  }

  // 2. Y (Thumb + Pinky extended, rest folded)
  if (pE && tE && iF && mF && rF) {
    return { letter: 'Y', word: 'AC Toggle', confidence: 0.97, label: 'AC Toggle / Y' }
  }

  // 3. L (Thumb + Index extended, rest folded)
  if (iE && tE && mF && rF && pF) {
    return { letter: 'L', word: 'Light Toggle', confidence: 0.98, label: 'Light Toggle / L' }
  }

  // 4. F (Index + Thumb touching, others extended)
  if (dTI < 0.045 && mE && rE && pE) {
    return { letter: 'F', word: 'Good Morning', confidence: 0.96, label: 'Good Morning / F' }
  }

  // 5. W / Water (Index, Middle, Ring extended, Pinky + Thumb folded)
  if (iE && mE && rE && pF) {
    return { letter: 'W', word: 'Water', confidence: 0.95, label: 'Water / W' }
  }

  // 6. V (Peace Sign - Index + Middle extended & spread, Ring + Pinky folded)
  if (iE && mE && rF && pF && dIM > 0.055) {
    return { letter: 'V', word: 'TV Toggle', confidence: 0.96, label: 'TV Toggle / V' }
  }

  // 7. U (Index + Middle extended together, Ring + Pinky folded)
  if (iE && mE && rF && pF && dIM <= 0.055) {
    return { letter: 'U', word: 'Curtains Toggle', confidence: 0.95, label: 'Curtains Toggle / U' }
  }

  // 8. I / J (Pinky extended, others folded)
  if (pE && iF && mF && rF) {
    if (tE) {
      return { letter: 'ILY', word: 'Love', confidence: 0.96, label: 'Love / ILY' }
    }
    return { letter: 'I', word: 'Bedroom Light', confidence: 0.97, label: 'Bed Light / I' }
  }

  // 9. K (Index + Middle extended, Thumb touching Middle Pip)
  if (iE && mE && rF && pF && dTM < 0.06 && dTM > 0.02) {
    return { letter: 'K', word: 'Cozy Scene', confidence: 0.93, label: 'Cozy Scene / K' }
  }

  // 10. D / Door Lock (Index extended up, others forming a loop with thumb)
  if (iE && mF && rF && pF) {
    if (dTM < 0.05 && dTR < 0.05) {
      return { letter: 'D', word: 'Door Lock', confidence: 0.94, label: 'Door Lock / D' }
    }
  }

  // 11. C / Hungry / Home (Fingers curved, forming a C)
  const isC = !iE && !iF && !mE && !mF && dTI > 0.08 && dTI < 0.18
  if (isC) {
    return { letter: 'C', word: 'Hungry', confidence: 0.90, label: 'Hungry / C' }
  }

  // 12. A (Fist, thumb on index side)
  if (iF && mF && rF && pF && tTip.y < iPip.y && tTip.x > iMcp.x) {
    return { letter: 'A', word: 'Alarm Off', confidence: 0.95, label: 'Alarm Off / A' }
  }

  // 13. E (Fingers curled tight, thumb tucked under)
  if (iF && mF && rF && pF && tTip.y > iPip.y && dist(tTip, iMcp) < 0.08) {
    return { letter: 'E', word: 'Kitchen Light', confidence: 0.93, label: 'Kitchen Light / E' }
  }

  // 14. S / Sorry (Fist, thumb across index/middle)
  if (iF && mF && rF && pF && dist(tTip, mPip) < 0.06) {
    return { letter: 'S', word: 'Sorry', confidence: 0.92, label: 'Sorry / S' }
  }

  // 15. T / Toilet / Bathroom (Fist, thumb tucked under index)
  if (iF && mF && rF && pF && tTip.x > iMcp.x && tTip.y > iPip.y && tTip.y < mPip.y) {
    return { letter: 'T', word: 'Toilet', confidence: 0.91, label: 'Toilet / Bathroom / T' }
  }

  // 16. O / No (Closed loop)
  const isO = iF && mF && rF && pF && dist(iTip, tTip) < 0.03 && dist(mTip, tTip) < 0.03
  if (isO) {
    return { letter: 'O', word: 'No', confidence: 0.92, label: 'No / O' }
  }

  // 17. R / Study Light (Index and Middle crossed)
  if (iE && mE && rF && pF && iTip.x > mTip.x) {
    return { letter: 'R', word: 'Study Light', confidence: 0.91, label: 'Study Light / R' }
  }

  // 18. X / Yes (Hooked index, others folded)
  const isX = iTip.y > iDip.y && iDip.y < iPip.y && mF && rF && pF
  if (isX) {
    return { letter: 'X', word: 'Yes', confidence: 0.90, label: 'Yes / X' }
  }

  // 19. G / Help (Index & thumb pointing sideways parallel)
  if (iTip.x < iMcp.x && tTip.x < tMcp.x && mF && rF && pF) {
    return { letter: 'G', word: 'Help', confidence: 0.88, label: 'Help / G' }
  }

  // 20. H / Friend (Index & Middle sideways parallel)
  if (iTip.x < iMcp.x && mTip.x < mMcp.x && rF && pF) {
    return { letter: 'H', word: 'Friend', confidence: 0.89, label: 'Friend / H' }
  }

  // 21. M / Mother (Thumb tucked under 3 fingers)
  if (iF && mF && rF && pF && tTip.x < rMcp.x) {
    return { letter: 'M', word: 'Mother', confidence: 0.85, label: 'Mother / M' }
  }

  // 22. N / Father (Thumb tucked under 2 fingers)
  if (iF && mF && rF && pF && tTip.x < mMcp.x && tTip.x > rMcp.x) {
    return { letter: 'N', word: 'Father', confidence: 0.86, label: 'Father / N' }
  }

  // ─── NEW ADDITIONAL GESTURES ───
  
  // 23. Food / Eat (Fingers in closed pinch shape facing upwards)
  const isPinched = dist(iTip, tTip) < 0.04 && dist(mTip, tTip) < 0.04 && dist(rTip, tTip) < 0.04 && dist(pTip, tTip) < 0.04
  if (isPinched && iTip.y < wrist.y) {
    return { letter: 'Food', word: 'Food', confidence: 0.91, label: 'Food / Eat' }
  }

  // 24. Sleep (Fingers spread curved pointing down)
  if (iTip.y > iMcp.y && mTip.y > mMcp.y && rTip.y > rMcp.y && pTip.y > pMcp.y && !tE) {
    return { letter: 'Sleep', word: 'Sleep', confidence: 0.88, label: 'Sleep' }
  }

  // 25. Doctor (Index and Middle fingers tapping wrist/MCP side)
  if (iE && mE && rF && pF && dist(iTip, wrist) < 0.09) {
    return { letter: 'Doctor', word: 'Doctor', confidence: 0.85, label: 'Doctor' }
  }

  // Default fallback to approximate letters if none match perfectly
  if (iE && !mE && !rE && !pE) return { letter: 'D', word: 'Door Lock', confidence: 0.75, label: 'Door Lock / D' }
  if (iE && mE && !rE && !pE) return { letter: 'V', word: 'TV Toggle', confidence: 0.78, label: 'TV Toggle / V' }

  return null
}

// ─── Viseme Lip-Reading Decoder ───────────────────────────────────────────────

/**
 * Tracks lip aspect ratios and decodes spoken syllables
 */
export class LipDecoder {
  constructor() {
    this.history = []
    this.maxHistory = 30
    this.cooldown = false
  }

  /**
   * Calculates Lip Aspect Ratio (LAR) using vertical/horizontal lip metrics
   * Inner lip top: 13, Inner lip bottom: 14
   * Left corner: 61, Right corner: 291
   * @param {Array} lm - MediaPipe 468+ Face Landmarks
   */
  calculateLAR(lm) {
    if (!lm || lm.length < 300) return 0
    const top = lm[13]
    const bottom = lm[14]
    const left = lm[61]
    const right = lm[291]

    const vertical = Math.hypot(top.x - bottom.x, top.y - bottom.y)
    const horizontal = Math.hypot(left.x - right.x, left.y - right.y)

    if (horizontal === 0) return 0
    return vertical / horizontal
  }

  /**
   * Maps Lip Aspect Ratio (LAR) and lip width to a specific Viseme
   */
  getViseme(lar, lm) {
    if (lar < 0.08) return 'Closed' // Lips closed (M, P, B)
    if (lar > 0.35) return 'Open Wide' // Open wide (A, E, I, O)
    
    // Check width to differentiate round vs wide stretch
    const left = lm[61]
    const right = lm[291]
    const width = Math.hypot(left.x - right.x, left.y - right.y)
    
    if (width < 0.055) return 'Open Rounded' // Puckered/Rounded (O, U, W)
    return 'Wide Stretch' // Extended lips (S, F, T)
  }

  /**
   * Tracks viseme transitions to predict spoken words
   */
  feedFrame(lm, onWordDecoded) {
    if (!lm || lm.length < 300) return { lar: 0, viseme: 'Unknown' }

    const lar = this.calculateLAR(lm)
    const viseme = this.getViseme(lar, lm)

    this.history.push(viseme)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }

    // Decode only when not in cooldown
    if (!this.cooldown && this.history.length >= 10) {
      const recent = this.history.slice(-8)
      
      // Basic state machine translation:
      // Pattern 1: Closed -> Open Rounded -> Closed (Wa-ter)
      const hasClosedStart = recent.slice(0, 3).includes('Closed')
      const hasRoundMiddle = recent.slice(2, 6).includes('Open Rounded')
      const hasClosedEnd = recent.slice(5).includes('Closed')

      // Pattern 2: Closed -> Open Wide -> Closed (Hun-gry)
      const hasWideMiddle = recent.slice(2, 6).includes('Open Wide')
      
      // Pattern 3: Wide Stretch -> Open Wide -> Closed (Please / Hello)
      const hasStretchStart = recent.slice(0, 3).includes('Wide Stretch')

      if (hasClosedStart && hasRoundMiddle && hasClosedEnd) {
        this.triggerWord('Water', onWordDecoded)
      } else if (hasClosedStart && hasWideMiddle && hasClosedEnd) {
        this.triggerWord('Hungry', onWordDecoded)
      } else if (hasStretchStart && hasWideMiddle && hasClosedEnd) {
        this.triggerWord('Hello', onWordDecoded)
      } else if (recent.filter(v => v === 'Open Wide').length > 5) {
        // High constant open
        const lastThree = this.history.slice(-3)
        if (lastThree.every(v => v === 'Closed')) {
          this.triggerWord('Toilet', onWordDecoded)
        }
      }
    }

    return { lar, viseme }
  }

  triggerWord(word, callback) {
    this.cooldown = true
    this.history = [] // Reset history
    callback(word)
    setTimeout(() => {
      this.cooldown = false
    }, 2500) // 2.5s cooldown
  }
}
