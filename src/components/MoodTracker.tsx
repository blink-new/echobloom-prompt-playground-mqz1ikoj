import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap, 
  Cloud, 
  Sun, 
  Moon,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface MoodOption {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  suggestions: string[]
}

interface MoodTrackerProps {
  onMoodSelect: (mood: MoodOption, suggestion: string) => void
}

const moodOptions: MoodOption[] = [
  {
    id: 'anxious',
    label: 'Anxious',
    icon: <AlertCircle className="w-5 h-5" />,
    color: 'bg-red-100 text-red-700 border-red-200',
    suggestions: [
      'I need help calming my racing thoughts',
      'I feel overwhelmed and need to breathe',
      'My anxiety is making it hard to focus',
      'I need grounding techniques for anxiety'
    ]
  },
  {
    id: 'stressed',
    label: 'Stressed',
    icon: <Cloud className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    suggestions: [
      'Work is overwhelming me today',
      'I have too much on my plate',
      'I need help managing stress',
      'I feel pressure from all directions'
    ]
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: <Frown className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    suggestions: [
      'I\'m feeling down and need comfort',
      'I need encouragement to get through this',
      'I feel lonely and disconnected',
      'I need reminders of my worth'
    ]
  },
  {
    id: 'tired',
    label: 'Tired',
    icon: <Moon className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    suggestions: [
      'I feel mentally and physically drained',
      'I need energy and motivation',
      'I\'m exhausted but need to keep going',
      'I need help finding my inner strength'
    ]
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: <Meh className="w-5 h-5" />,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    suggestions: [
      'I want to feel more positive',
      'I need a boost to my day',
      'I want to cultivate gratitude',
      'I need motivation to take action'
    ]
  },
  {
    id: 'happy',
    label: 'Happy',
    icon: <Smile className="w-5 h-5" />,
    color: 'bg-green-100 text-green-700 border-green-200',
    suggestions: [
      'I want to maintain this positive energy',
      'I\'m grateful and want to celebrate',
      'I want to spread this joy to others',
      'I want affirmations to keep me motivated'
    ]
  },
  {
    id: 'excited',
    label: 'Excited',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    suggestions: [
      'I\'m ready to take on new challenges',
      'I want to channel this energy productively',
      'I\'m feeling confident and powerful',
      'I want motivation to achieve my goals'
    ]
  },
  {
    id: 'grateful',
    label: 'Grateful',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    suggestions: [
      'I want to deepen my sense of gratitude',
      'I\'m thankful and want to share this feeling',
      'I want to appreciate the good in my life',
      'I want affirmations about abundance'
    ]
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    icon: <Sun className="w-5 h-5" />,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    suggestions: [
      'I want to maintain this inner calm',
      'I\'m centered and want to stay grounded',
      'I want mindfulness to deepen this peace',
      'I want to cultivate more serenity'
    ]
  },
  {
    id: 'inspired',
    label: 'Inspired',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    suggestions: [
      'I\'m feeling creative and want to act on it',
      'I have ideas and need confidence to pursue them',
      'I want to turn inspiration into action',
      'I need motivation to follow my dreams'
    ]
  }
]

export default function MoodTracker({ onMoodSelect }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleMoodClick = (mood: MoodOption) => {
    setSelectedMood(mood)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (selectedMood) {
      onMoodSelect(selectedMood, suggestion)
    }
  }

  const resetSelection = () => {
    setSelectedMood(null)
    setShowSuggestions(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-indigo-500" />
          How are you feeling right now?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showSuggestions ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Select your current mood to get personalized guidance
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.id}
                  variant="outline"
                  onClick={() => handleMoodClick(mood)}
                  className={`h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all ${mood.color}`}
                >
                  {mood.icon}
                  <span className="text-xs font-medium">{mood.label}</span>
                </Button>
              ))}
            </div>
          </>
        ) : selectedMood ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={selectedMood.color}>
                  {selectedMood.icon}
                  <span className="ml-1">{selectedMood.label}</span>
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                Change mood
              </Button>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Choose what resonates with you right now:
              </p>
              <div className="space-y-2">
                {selectedMood.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left justify-start h-auto p-3 text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}