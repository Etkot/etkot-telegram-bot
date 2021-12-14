import OpenAI, { Completion } from 'openai-api'
import { QuoteDocument } from './commands/quote'

const OAI_API_KEY: string = process.env.OAI_API_KEY || ''

const openai: OpenAI = new OpenAI(OAI_API_KEY)

const generate = async (randomizedQuotes: Array<QuoteDocument>): Promise<string> => {
    const input = randomizedQuotes.map((doc) => `${doc.quote}`).join('\n')

    // If only 1 quote, stop mark has to be '.' with newline, it would just return nothing for some reason
    const stop = randomizedQuotes.length === 1 ? '.' : '\n'

    const response: Completion = await openai.complete({
        engine: 'davinci',
        prompt: input.slice(-3).match(/[\r\n]/) ? input : input + '\n',
        maxTokens: 128,
        temperature: 0.7, // randomness
        topP: 1,
        presencePenalty: 0.1,
        frequencyPenalty: 0.1,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: [stop],
    })

    return response.data.choices[0].text.replace(/([.]*[\n]+)/g, ". ")
}

// Replace all question marks with '' in prompt
const basePrompGenerator = (prompt: string) =>
    `Q: Does hertsi have good food?
A: Absolutely fricking no.

Q: What is the meaning of life?
A: Being happy :).

Q: Mikä on mangolassin resepti?
A: Mangolassin resepti sisältää mangoja ja meemejä.

Q: Onko huomenna hyvä päivä?
A: Kyllä on!

Q: ${prompt.replace(/\?/g, '')}?
A:`

const answer = async (question: string): Promise<string> => {
    const { data }: Completion = await openai.complete({
        engine: 'davinci',
        prompt: basePrompGenerator(question),
        temperature: 0.27,
        maxTokens: 100,
        topP: 1,
        frequencyPenalty: 1.68,
        presencePenalty: 1.62,
        stop: ['\n'],
    })

    return data.choices[0].text
}

const oaiUtils = { generate, answer }
export default oaiUtils
