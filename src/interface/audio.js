
export const state = {
  audioContext: null,
  audioContextReady: false,
  samples: {},
}

export function init() {
  if (!state.audioContext) {
    state.audioContext = new AudioContext()
  }
  if (state.audioContext.state === 'playing') {
    state.audioContextReady = true
    startMusic()
  } else {
    resumeAudioContextOnUserGesture()
  }
}

function resumeAudioContextOnUserGesture() {
  function onClick() {
    document.body.removeEventListener('click', onClick)
    state.audioContext.resume()
      .then(function () {
        state.audioContextReady = true
        startMusic()
      })
      .catch(function () {
        // No audio available
      })
  }
  document.body.addEventListener('click', onClick)
}

const samples = [
  'rumble',
  'thumb_piano_dry_3_03_07',
  'toy_glock_1_3_5',
  'toy_glock_6_4_5',
  'whaledrum_1_b_05',
  'whaledrum_8_b_19',
]

const soundTypes = [
  'pickupCoin',
  'laserShoot',
  'explosion',
  'powerUp',
  'hitHurt',
  'jump',
  'blipSelect'
]

function startMusic() {
  function tick() {
    const choice = Math.random()

    if (choice > 0.9) {
      // makeRandomSound()
    } else if (choice > 0.8) {
      makeSound('heavytraffic', 1, 6)
    } else if (choice > 0.7) {
      makeSound('honkhonk-low', 1, 6)
    } else if (choice > 0.6) {
      makeSound('siren', 0.7, 6)
    } else if (choice > 0.5) {
      makeSound('computer', 0.7, 4)
    }

    setTimeout(tick, 3000 + (Math.random() * 12000))
  }
  setTimeout(tick, 6000)
}

export function makeRandomSound() {
  const sound = samples[
    Math.floor(samples.length * Math.random())
  ]
  makeSound(sound)
}

async function loadSound(url) {
  let audioBuffer = state.samples[name]
  if (!audioBuffer) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    audioBuffer = state.samples[name] = await state.audioContext.decodeAudioData(arrayBuffer)
  }
  return audioBuffer
}

function playAudioBuffer(buffer, playbackRate = 1, velocity = 50) {
  const sourceNode = new AudioBufferSourceNode(state.audioContext, {
    buffer,
    playbackRate
  })
  // sourceNode.connect(state.audioContext.destination)

  const gainNode = new GainNode(state.audioContext)
  gainNode.gain.setValueAtTime(velocity / 100, state.audioContext.currentTime)

  sourceNode.connect(gainNode)
    .connect(state.audioContext.destination)
  sourceNode.start(0)
}

export async function makeSound(name, playbackRate, velocity) {
  if (typeof name === 'number') {
    name = samples[name]
  }
  try {
    if (!state.audioContextReady) await state.resumeAudioContext()
    playAudioBuffer(
      await loadSound(`sounds/${name}.mp3`),
      playbackRate,
      velocity
    )
  } catch (e) {
    // ok
  }
}
