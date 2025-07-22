import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Heart, Sparkles } from 'lucide-react'
import { blink } from '@/blink/client'

export default function EchoBloom() {
  const [input, setInput] = useState('')
  const [affirmation, setAffirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateAffirmation = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are EchoBloom, a calming AI companion.

You generate short (30–60 second) personalized affirmations in response to users' emotional needs. Each affirmation should sound empathetic, emotionally aware, calming, and personal — not generic. Avoid cliches and address the user's need directly.

User Input: "${input}"

Generate: 1 short affirmation script (about 100–130 words) that would be spoken aloud. Use natural pacing and warmth.`,
        model: 'gpt-4o-mini',
        maxTokens: 150
      })
      
      setAffirmation(text)
    } catch (error) {
      console.error('Error generating affirmation:', error)
      setAffirmation('I understand you\'re going through something difficult right now. Please know that your feelings are valid, and you have the strength within you to navigate this moment. Take a deep breath and be gentle with yourself.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EchoBloom
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Personalized Affirmation Generator</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Share what's on your heart, and receive a gentle, personalized affirmation crafted just for you.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-4">
                <label htmlFor="emotional-input" className="block text-lg font-medium text-gray-700">
                  How are you feeling today?
                </label>
                <Textarea
                  id="emotional-input"
                  placeholder="Share what's on your mind... For example: 'I'm nervous about my job interview tomorrow' or 'I've been feeling overwhelmed lately'"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] text-base resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
                <Button
                  onClick={generateAffirmation}
                  disabled={!input.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 text-base transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating your affirmation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Affirmation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          {affirmation && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">Your Personal Affirmation</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {affirmation}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-indigo-100">
                  <p className="text-sm text-gray-500 italic">
                    Take a moment to breathe deeply and let these words settle in your heart. 💜
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400 text-sm">
          <p>Made with care for your emotional wellbeing</p>
        </div>
      </div>
    </div>
  )
}