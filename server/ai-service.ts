import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TrainingData {
  input: string;
  output: string;
  context?: string;
}

export class AIAgentService {
  private config: AIAgentConfig;

  constructor(config: AIAgentConfig) {
    this.config = config;
  }

  /**
   * Generate a response using the configured AI agent
   */
  async generateResponse(
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    }
  ): Promise<string> {
    try {
      const chatMessages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.config.systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: this.config.model,
        messages: chatMessages,
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
        top_p: this.config.topP,
        presence_penalty: this.config.presencePenalty,
        frequency_penalty: this.config.frequencyPenalty,
        stream: options?.stream ?? false,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Generate embeddings for training data
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Fine-tune the model with training data
   */
  async createFineTuneJob(
    trainingData: TrainingData[],
    validationData?: TrainingData[]
  ): Promise<string> {
    try {
      // Convert training data to JSONL format
      const trainingFile = await this.createTrainingFile(trainingData);
      
      let validationFile;
      if (validationData) {
        validationFile = await this.createTrainingFile(validationData);
      }

      const fineTune = await openai.fineTuning.jobs.create({
        training_file: trainingFile.id,
        validation_file: validationFile?.id,
        model: 'gpt-3.5-turbo',
        hyperparameters: {
          n_epochs: 3,
        },
      });

      return fineTune.id;
    } catch (error) {
      console.error('Error creating fine-tune job:', error);
      throw new Error('Failed to create fine-tune job');
    }
  }

  /**
   * Create a training file for fine-tuning
   */
  private async createTrainingFile(data: TrainingData[]): Promise<any> {
    const jsonlContent = data
      .map(item => JSON.stringify({
        messages: [
          { role: 'system', content: this.config.systemPrompt },
          { role: 'user', content: item.input },
          { role: 'assistant', content: item.output },
        ],
      }))
      .join('\n');

    const file = await openai.files.create({
      file: new Blob([jsonlContent], { type: 'application/jsonl' }),
      purpose: 'fine-tune',
    });

    return file;
  }

  /**
   * Get fine-tune job status
   */
  async getFineTuneStatus(jobId: string): Promise<any> {
    try {
      return await openai.fineTuning.jobs.retrieve(jobId);
    } catch (error) {
      console.error('Error getting fine-tune status:', error);
      throw new Error('Failed to get fine-tune status');
    }
  }

  /**
   * Evaluate agent performance
   */
  async evaluateAgent(testCases: { input: string; expectedOutput: string }[]): Promise<{
    accuracy: number;
    averageScore: number;
    results: Array<{
      input: string;
      expected: string;
      actual: string;
      score: number;
    }>;
  }> {
    const results = [];
    let totalScore = 0;
    let correctAnswers = 0;

    for (const testCase of testCases) {
      const actual = await this.generateResponse([
        { role: 'user', content: testCase.input },
      ]);

      // Simple similarity scoring (can be enhanced with more sophisticated metrics)
      const score = this.calculateSimilarity(testCase.expectedOutput, actual);
      if (score > 0.8) correctAnswers++;
      
      totalScore += score;
      
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual,
        score,
      });
    }

    return {
      accuracy: correctAnswers / testCases.length,
      averageScore: totalScore / testCases.length,
      results,
    };
  }

  /**
   * Calculate similarity between two strings (basic implementation)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Update agent configuration
   */
  updateConfig(newConfig: Partial<AIAgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIAgentConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create AI agents with predefined configurations
 */
export const createAIAgent = (config: AIAgentConfig): AIAgentService => {
  return new AIAgentService(config);
};

/**
 * Predefined agent configurations for common use cases
 */
export const AgentPresets = {
  CUSTOMER_SERVICE: {
    name: 'Customer Service Agent',
    description: 'Helpful customer service representative',
    systemPrompt: 'You are a helpful customer service representative. Be polite, professional, and try to resolve customer issues effectively.',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
  },
  CONTENT_WRITER: {
    name: 'Content Writer',
    description: 'Creative content writer and copywriter',
    systemPrompt: 'You are a creative content writer. Create engaging, well-structured content that captures the reader\'s attention.',
    model: 'gpt-3.5-turbo',
    temperature: 0.8,
    maxTokens: 1000,
    topP: 1,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
  },
  CODE_ASSISTANT: {
    name: 'Code Assistant',
    description: 'Programming and code review assistant',
    systemPrompt: 'You are a skilled programming assistant. Help with code review, debugging, and writing clean, efficient code.',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1500,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
  },
  EDUCATIONAL_TUTOR: {
    name: 'Educational Tutor',
    description: 'Patient and knowledgeable tutor',
    systemPrompt: 'You are a patient and knowledgeable tutor. Explain concepts clearly, provide examples, and encourage learning.',
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
    maxTokens: 800,
    topP: 1,
    presencePenalty: 0.2,
    frequencyPenalty: 0.2,
  },
} as const;

export default openai;