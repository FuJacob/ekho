import "colors";
import { EventEmitter } from "events";
import OpenAI from "openai";

class GptService extends EventEmitter {
  constructor(context) {
    super();
    this.openai = new OpenAI({
      baseURL: process.env.GEMINI_BASE_URL,
      apiKey: process.env.GEMINI_API_KEY,
    });
    this.userContext = [
      {
        role: "system",
        content:
          "You must only respond in less than 10 words at a time. You are an AI-powered clone of a family doctor that designed to help streamline initial consultations and save the actual family doctor time. You professionally and empathetically speak with patients, collect symptoms, provide preliminary guidance, and determine if an in-person visit is necessary. Always ensure clarity, professionalism, and patient reassurance. If it requires an in person visit, begin the process of booking an in person appointment with the patient. You can offer general advice and schedule appointments with the doctor when needed. If the patient asks to book an in person appointment, then say let me take a look at my schedule, and then ask them for a time. Once time is provided, say okay great I've booked you an appointment at X time. Here is info about the patient you are consulting with: " + context,
      },
      {
        role: "assistant",
        content:
          "Hello, this is the AI assistant for Dr. Smith. I’ll be gathering some information before your consultation. Could you please describe your symptoms and how long you’ve been experiencing them?",
      },
    ];
    this.partialResponseIndex = 0;
    this.callSid = null;
    this.isProcessing = false;
    this.maxRetries = 3;
  }

  setCallSid(callSid) {
    this.callSid = callSid;
    console.log(`Set CallSid: ${callSid}`.blue);
  }

  resetContext() {
    this.userContext = this.userContext.slice(0, 2); // Keep only system and initial messages
    this.partialResponseIndex = 0;
    console.log("Context reset".yellow);
  }

  cleanup() {
    this.resetContext();
    this.removeAllListeners();
    this.isProcessing = false;
    console.log("GPT Service cleaned up".yellow);
  }

  async completion(text, interactionCount, role = "user", name = "user") {
    if (this.isProcessing) {
      console.log("Already processing a response, skipping...".yellow);
      return;
    }

    try {
      this.isProcessing = true;
      console.log(
        `Processing completion for interaction ${interactionCount}`.blue
      );

      // Add user's message to context
      this.userContext.push({ role: role, content: text });

      let retryCount = 0;
      let success = false;

      while (retryCount < this.maxRetries && !success) {
        try {
          const stream = await this.openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: this.userContext,
            stream: true,
          });

          let completeResponse = "";
          let partialResponse = "";

          for await (const chunk of stream) {
            let content = chunk.choices[0]?.delta?.content || "";
            let finishReason = chunk.choices[0].finish_reason;

            completeResponse += content;
            partialResponse += content;

            // Emit partial response when we hit a bullet point or finish
            if (content.trim().slice(-1) === "•" || finishReason === "stop") {
              this.emit(
                "gptreply",
                {
                  partialResponseIndex: this.partialResponseIndex,
                  partialResponse: partialResponse.trim(),
                  callSid: this.callSid,
                },
                interactionCount
              );
              this.partialResponseIndex++;
              partialResponse = "";
            }
          }

          // Add assistant's complete response to context
          this.userContext.push({
            role: "assistant",
            content: completeResponse,
          });
          console.log(
            `GPT -> user context length: ${this.userContext.length}`.green
          );

          // Mark as successful to break retry loop
          success = true;
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`.red, error);

          if (retryCount === this.maxRetries) {
            throw error;
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }
      }
    } catch (error) {
      console.error("Fatal error in GPT completion:".red, error);
      this.emit("error", error);
      // Add a fallback response in case of error
      this.emit(
        "gptreply",
        {
          partialResponseIndex: this.partialResponseIndex,
          partialResponse:
            "I apologize, but I'm having trouble processing your request. • Could you please repeat that?",
          callSid: this.callSid,
        },
        interactionCount
      );
    } finally {
      this.isProcessing = false;
    }
  }

  // Method to check if context is getting too long and needs reset
  shouldResetContext() {
    return this.userContext.length > 10;
  }
}

export default GptService;
