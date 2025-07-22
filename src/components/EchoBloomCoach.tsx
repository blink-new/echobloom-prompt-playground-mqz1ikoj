import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw,
  Heart,
  Brain,
  Zap,
  Wind,
  Sparkles
} from 'lucide-react'
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit'
import { blink } from '../blink/client'
import BreathingVisualizer from './BreathingVisualizer'
import MoodTracker from './MoodTracker'

interface CoachingSession {
  type: 'affirmation' | 'breathing' | 'mindfulness' | 'motivation'
  content: string
  audioInstructions: string[]
  duration?: number
}

export default function EchoBloomCoach() {
  const [input, setInput] = useState('')
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'coach', content: string}>>([])
  const [showMoodTracker, setShowMoodTracker] = useState(true)
  const [breathingActive, setBreathingActive] = useState(false)
  
  const { speak, cancel, speaking, supported: speechSupported } = useSpeechSynthesis()
  const stepInterval = useRef<NodeJS.Timeout>()

  const getCoachVoice = useCallback(() => {
    const voices = speechSynthesis.getVoices()
    // Prefer female voices for coaching as they're often perceived as more calming
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Moira')
    )
    return preferredVoice || voices[0]
  }, [])

  const stopSession = useCallback(() => {
    setIsPlaying(false)
    setBreathingActive(false)
    cancel()
    if (stepInterval.current) clearTimeout(stepInterval.current)
  }, [cancel])

  const startAudioSession = useCallback((session: CoachingSession) => {
    if (!speechSupported) return
    
    setIsPlaying(true)
    setCurrentStep(0)
    
    const playStep = (stepIndex: number) => {
      if (stepIndex >= session.audioInstructions.length) {
        setIsPlaying(false)
        setSessionProgress(100)
        return
      }
      
      const instruction = session.audioInstructions[stepIndex]
      speak({ 
        text: instruction, 
        voice: getCoachVoice(),
        rate: 0.8 // Slower, more calming pace
      })
      
      setCurrentStep(stepIndex)
      setSessionProgress((stepIndex / session.audioInstructions.length) * 100)
      
      // Move to next step after speaking + pause
      stepInterval.current = setTimeout(() => {
        playStep(stepIndex + 1)
      }, instruction.length * 80 + 2000) // Estimate speaking time + 2s pause
    }
    
    playStep(0)
  }, [speechSupported, speak, getCoachVoice])

  const generateSession = useCallback(async (type: CoachingSession['type']) => {
    setIsLoading(true)
    
    try {
      let prompt = ''
      let audioInstructions: string[] = []
      let duration = 0

      switch (type) {
        case 'breathing':
          prompt = `Create a guided breathing exercise for someone who needs to calm down. Include specific timing and gentle encouragement. Use "let's" and "we" language.`
          audioInstructions = [
            "Welcome to your breathing session. Let's find a comfortable position and begin together.",
            "Place one hand on your chest, one on your belly. Feel your body settling.",
            "Now, let's breathe in slowly through your nose for 4 counts. Ready? 1... 2... 3... 4...",
            "Perfect. Now hold that breath gently for 4 counts. 1... 2... 3... 4...",
            "Beautiful. Now let's exhale slowly through your mouth for 6 counts. 1... 2... 3... 4... 5... 6...",
            "Wonderful. Let's pause for 2 counts. 1... 2... Feel your body relaxing.",
            "You're doing great. Let's continue this rhythm together. Notice how your shoulders are dropping.",
            "With each breath, feel tension melting away. Your jaw is softening, your mind is clearing.",
            "Keep following this gentle rhythm. You're creating space for peace and calm.",
            "Take a moment to appreciate this gift you're giving yourself. You deserve this peace."
          ]
          duration = 300 // 5 minutes
          setBreathingActive(true)
          break

        case 'affirmation':
          prompt = `Generate a personalized affirmation session based on: "${input}". Create empowering statements that address their specific concern. Use present tense and "I am" statements.`
          break

        case 'mindfulness':
          prompt = `Create a mindfulness exercise to help someone focus and be present. Include sensory awareness and grounding techniques.`
          audioInstructions = [
            "Let's ground ourselves in this moment. Sit comfortably and close your eyes if you'd like.",
            "First, let's notice 5 things you can hear around you. Take your time.",
            "Now, let's feel 4 things you can touch - your clothes, the chair, the air on your skin.",
            "Next, notice 3 things you can smell in your environment.",
            "Now 2 things you can taste - perhaps the lingering taste of something you drank.",
            "Finally, when you open your eyes, notice 1 thing you can see with fresh awareness."
          ]
          duration = 300 // 5 minutes
          break

        case 'motivation':
          prompt = `Create an energizing motivation session. Include action-oriented language and confidence-building statements. Use "you can" and "you will" language.`
          break
      }

      const { text } = await blink.ai.generateText({
        prompt: `You are EchoBloom, a wellness coach. ${prompt}

Create a structured session with:
1. A warm welcome
2. Clear, step-by-step guidance
3. Encouraging language throughout
4. A positive closing

Make it feel personal and interactive. Use natural pacing for spoken delivery.`,
        model: 'gpt-4o-mini',
        maxTokens: 200
      })

      const session: CoachingSession = {
        type,
        content: text,
        audioInstructions: audioInstructions.length > 0 ? audioInstructions : [text],
        duration
      }

      setCurrentSession(session)
      setCurrentStep(0)
      setSessionProgress(0)
      setActiveTab('session')
      
      // Start the session automatically
      startAudioSession(session)
      
    } catch (error) {
      console.error('Error generating session:', error)
    } finally {
      setIsLoading(false)
    }
  }, [input, startAudioSession])

  const generateConversationalResponse = useCallback(async (userInput: string) => {
    setIsLoading(true)
    
    try {
      const conversationContext = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Coach'}: ${msg.content}`)
        .join('\n')

      const { text } = await blink.ai.generateText({
        prompt: `You are EchoBloom, a compassionate AI wellness coach. You help people with emotional support, breathing exercises, mindfulness, and motivation.

Previous conversation:
${conversationContext}

Current user input: "${userInput}"

Respond as a caring coach who:
- Uses "we" and "let's" language to be inclusive
- Gives specific, actionable guidance
- Offers interactive exercises when appropriate
- Asks follow-up questions to understand their needs better
- Suggests breathing, affirmations, or mindfulness based on their emotional state

Keep responses conversational, warm, and under 100 words. If they seem stressed/anxious, offer a breathing exercise. If they need confidence, suggest affirmations.`,
        model: 'gpt-4o-mini',
        maxTokens: 150
      })

      const newHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: userInput },
        { role: 'coach' as const, content: text }
      ]
      
      setConversationHistory(newHistory.slice(-10)) // Keep last 10 messages
      
      // Auto-speak the response
      if (speechSupported) {
        speak({ text, voice: getCoachVoice() })
      }
      
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setIsLoading(false)
    }
  }, [conversationHistory, speechSupported, speak, getCoachVoice])

  const handleVoiceInput = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase()
    
    // Check for voice commands first
    if (lowerTranscript.includes('breathing') || lowerTranscript.includes('breathe') || lowerTranscript.includes('breath')) {
      generateSession('breathing')
      return
    }
    if (lowerTranscript.includes('affirmation') || lowerTranscript.includes('affirm') || lowerTranscript.includes('positive')) {
      generateSession('affirmation')
      return
    }
    if (lowerTranscript.includes('focus') || lowerTranscript.includes('mindfulness') || lowerTranscript.includes('meditation')) {
      generateSession('mindfulness')
      return
    }
    if (lowerTranscript.includes('motivation') || lowerTranscript.includes('motivate') || lowerTranscript.includes('energy')) {
      generateSession('motivation')
      return
    }
    if (lowerTranscript.includes('stop') || lowerTranscript.includes('pause') || lowerTranscript.includes('end')) {
      stopSession()
      return
    }
    
    // If no command matched, treat as conversational input
    setInput(transcript)
    if (transcript.trim()) {
      generateConversationalResponse(transcript)
    }
  }, [generateSession, stopSession, generateConversationalResponse])

  const { listen, listening, stop: stopListening, supported: recognitionSupported } = useSpeechRecognition({
    onResult: (result: string) => {
      handleVoiceInput(result)
      setIsListening(false)
    }
  })

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening()
      setIsListening(false)
    } else {
      listen({ continuous: false, interimResults: false })
      setIsListening(true)
    }
  }, [listening, stopListening, listen])

  const getSessionIcon = (type: CoachingSession['type']) => {
    switch (type) {
      case 'breathing': return <Wind className="w-5 h-5" />
      case 'affirmation': return <Heart className="w-5 h-5" />
      case 'mindfulness': return <Brain className="w-5 h-5" />
      case 'motivation': return <Zap className="w-5 h-5" />
    }
  }

  const getSessionColor = (type: CoachingSession['type']) => {
    switch (type) {
      case 'breathing': return 'bg-blue-500'
      case 'affirmation': return 'bg-pink-500'
      case 'mindfulness': return 'bg-purple-500'
      case 'motivation': return 'bg-orange-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            EchoBloom Coach
          </h1>
          <p className="text-gray-600 text-lg">Your AI wellness companion for mindful living</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="session">Session</TabsTrigger>
            <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Mood Tab */}
          <TabsContent value="mood" className="space-y-6">
            <MoodTracker 
              onMoodSelect={(mood, suggestion) => {
                setInput(suggestion)
                setActiveTab('chat')
                generateConversationalResponse(suggestion)
              }}
            />
            
            {/* Quick Mood-Based Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Instant Relief
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => generateSession('breathing')}
                    className="h-auto p-4 flex items-center gap-3"
                  >
                    <Wind className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">Quick Calm</div>
                      <div className="text-xs text-gray-600">2-minute breathing</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => generateConversationalResponse("I need a quick confidence boost")}
                    className="h-auto p-4 flex items-center gap-3"
                  >
                    <Heart className="w-5 h-5 text-pink-500" />
                    <div className="text-left">
                      <div className="font-medium">Confidence Boost</div>
                      <div className="text-xs text-gray-600">Instant affirmation</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Conversation History */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {conversationHistory.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Heart className="w-12 h-12 mx-auto mb-4 text-indigo-300" />
                        <p>Hi! I'm your wellness coach. How are you feeling today?</p>
                        <p className="text-sm mt-2">Try saying "I'm feeling anxious" or "I need motivation"</p>
                      </div>
                    ) : (
                      conversationHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share how you're feeling, or ask for help with breathing, affirmations, or focus..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={() => generateConversationalResponse(input)}
                        disabled={!input.trim() || isLoading}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        {isLoading ? 'Thinking...' : 'Send'}
                      </Button>
                      
                      {recognitionSupported && (
                        <Button
                          variant={isListening ? "destructive" : "outline"}
                          onClick={toggleListening}
                          disabled={isLoading}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          {isListening ? 'Stop' : 'Voice'}
                        </Button>
                      )}
                      
                      {speechSupported && (
                        <Button
                          variant="outline"
                          onClick={() => speaking ? cancel() : null}
                          disabled={!speaking}
                        >
                          {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          Audio
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Session Tab */}
          <TabsContent value="session" className="space-y-6">
            {currentSession ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Session Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getSessionColor(currentSession.type)} text-white`}>
                          {getSessionIcon(currentSession.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{currentSession.type} Session</h3>
                          <p className="text-sm text-gray-600">Step {currentStep + 1} of {currentSession.audioInstructions.length}</p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="capitalize">
                        {currentSession.type}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{Math.round(sessionProgress)}%</span>
                      </div>
                      <Progress value={sessionProgress} className="h-2" />
                    </div>

                    {/* Breathing Visualizer for breathing sessions */}
                    {currentSession.type === 'breathing' && (
                      <BreathingVisualizer 
                        isActive={breathingActive && isPlaying}
                        onPhaseChange={(phase) => {
                          // Could add phase-specific audio cues here
                        }}
                      />
                    )}

                    {/* Current Instruction */}
                    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardContent className="p-4">
                        <p className="text-center text-lg leading-relaxed">
                          {currentSession.audioInstructions[currentStep] || currentSession.content}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Controls */}
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => startAudioSession(currentSession)}
                        disabled={isPlaying}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isPlaying ? 'Playing...' : 'Start Session'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={stopSession}
                        disabled={!isPlaying}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentStep(0)
                          setSessionProgress(0)
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-indigo-300" />
                  <h3 className="text-xl font-semibold mb-2">No Active Session</h3>
                  <p className="text-gray-600 mb-4">Start a guided session from the Quick Actions tab</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="quick" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateSession('breathing')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-500 text-white p-3 rounded-full w-fit mx-auto mb-4">
                    <Wind className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Breathing Exercise</h3>
                  <p className="text-sm text-gray-600">Guided breathing to calm your mind and body</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateSession('affirmation')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-pink-500 text-white p-3 rounded-full w-fit mx-auto mb-4">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Affirmations</h3>
                  <p className="text-sm text-gray-600">Positive statements to boost confidence</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateSession('mindfulness')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-500 text-white p-3 rounded-full w-fit mx-auto mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Mindfulness</h3>
                  <p className="text-sm text-gray-600">Present-moment awareness exercises</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => generateSession('motivation')}>
                <CardContent className="p-6 text-center">
                  <div className="bg-orange-500 text-white p-3 rounded-full w-fit mx-auto mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Motivation</h3>
                  <p className="text-sm text-gray-600">Energizing sessions to boost your drive</p>
                </CardContent>
              </Card>
            </div>

            {/* Voice Commands Help */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Commands
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Say</Badge>
                    <span>"Start breathing"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Say</Badge>
                    <span>"Give me affirmation"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Say</Badge>
                    <span>"Help me focus"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Say</Badge>
                    <span>"Motivate me"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}