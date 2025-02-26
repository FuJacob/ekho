/**
 * Express Server Entry Point
 * Handles WebSocket connections for real-time audio streaming,
 * voice cloning, and Twilio call management.
 */

import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import twilio from "twilio";
import { EventEmitter } from "events";
import multer from "multer";
import { ElevenLabsClient } from "elevenlabs";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Services for AI agent functionality
import GptService from "./ai-agent/services/gpt-service.js";
import StreamService from "./ai-agent/services/stream-service.js";
import TranscriptionService from "./ai-agent/services/transcription-service.js";
import TextToSpeechService from "./ai-agent/services/tts-service.js";
import { BodyCreatePodcastV1ProjectsPodcastCreatePostDurationScale } from "elevenlabs/api/index.js";

// Configure event emitter for WebSocket handling
EventEmitter.defaultMaxListeners = 15;

// Initialize Express with WebSocket support
const app = express();
expressWs(app);

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Constants

const PORT = process.env.PORT || 5000;

// Initialize Twilio client
let gptService = new GptService();
let ttsService = new TextToSpeechService({});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Generates TwiML for call streaming
 * @returns {string} TwiML response as string
 */
function generateTwiML() {
  const response = new twilio.twiml.VoiceResponse();
  const connect = response.connect();
  connect.stream({
    url: `wss://jacobs-macbook-pro.tail8a7d7a.ts.net/connection`,
  });
  return response.toString();
}

/**
 * @route POST /api/call
 * @description Initiates an outbound call using Twilio
 */
app.post("/api/call", async (req, res) => {
  try {
    console.log("voice_id:", req.body);
    ttsService = new TextToSpeechService(req.body.voice_id);
    gptService = new GptService(req.body.data);
    const twimlContent = generateTwiML();
    const call = await client.calls.create({
      twiml: twimlContent,
      to: process.env.TWILIO_USER_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.TAILSCALE_PUBLIC_URL}api/callStatus/`,
      statusCallbackEvent: ["completed"],
      statusCallbackMethod: "POST",
    });
    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /incoming
 * @description Handles incoming Twilio calls
 */
app.post("/incoming", (req, res) => {
  try {
    const response = new twilio.twiml.VoiceResponse();
    const connect = response.connect();
    connect.stream({ url: `wss://${process.env.SERVER}/connection` });
    res.type("text/xml");
    res.send(response.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error handling incoming call");
  }
});

/**
 * @route POST /startOutboundCall
 * @description Initiates an outbound call to a specified number
 */
app.post("/startOutboundCall", async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const twimlContent = generateTwiML();
    const call = await client.calls.create({
      twiml: twimlContent,
      to: process.env.TWILIO_USER_PHONE_NUMBER,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.TAILSCALE_PUBLIC_URL}api/callStatus/`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });
    res.status(200).json({ message: "Call initiated", data: call });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * WebSocket handler for real-time audio streaming
 */
app.ws("/connection", (ws) => {
  let streamSid;
  let callSid;
  let marks = [];
  let interactionCount = 0;

  // Initialize services
  const streamService = new StreamService(ws);
  const transcriptionService = new TranscriptionService();

  /**
   * Cleanup function to properly close all services
   */
  const cleanup = () => {
    try {
      [transcriptionService, gptService, ttsService, streamService].forEach(
        (service) => {
          service.removeAllListeners();
          if (service.cleanup) service.cleanup();
        }
      );
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  };

  // WebSocket message handler
  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      switch (msg.event) {
        case "start":
          streamSid = msg.start.streamSid;
          callSid = msg.start.callSid;
          streamService.setStreamSid(streamSid);
          gptService.setCallSid(callSid);
          break;
        case "media":
          transcriptionService.send(msg.media.payload);
          break;
        case "mark":
          marks = marks.filter((m) => m !== msg.mark.name);
          break;
        case "stop":
          console.log(`Stream ${streamSid} ended`);
          cleanup();
          ws.close(1000, "Stream ended normally");
          break;
      }
    } catch (err) {
      console.error("Message handling error:", err);
      cleanup();
      ws.close(1011, "Internal server error");
    }
  });

  // Service event handlers
  transcriptionService.on("transcription", async (text) => {
    if (text) {
      try {
        await gptService.completion(text, interactionCount++);
      } catch (err) {
        console.error("Transcription handling error:", err);
      }
    }
  });

  gptService.on("gptreply", async (reply, count) => {
    try {
      await ttsService.generate(reply, count);
    } catch (err) {
      console.error("GPT reply handling error:", err);
    }
  });

  ttsService.on("speech", (index, audio, label, count) => {
    try {
      streamService.buffer(index, audio);
    } catch (err) {
      console.error("Speech handling error:", err);
    }
  });

  streamService.on("audiosent", (label) => {
    marks.push(label);
  });

  // WebSocket error handlers
  ws.on("close", (code, reason) => {
    console.log(`WebSocket closed with code ${code} and reason: ${reason}`);
    cleanup();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    cleanup();
    ws.close(1011, "Internal server error");
  });
});

app.get("/api/get-patient-data", async (req, res) => {
  try {
    const { id } = req.query; // Access the id query param
    const { data, error } = await supabase
      .from("patient_data")
      .select("*")
      .eq("id", parseInt(id, 10));

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/clone-voice
 * @description Clones a voice using ElevenLabs API
 */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/clone-voice", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const voiceName = req.body.name || "Default Voice"; // Get voice name from request body

    // Create a temporary file from the buffer
    const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Make the API call and await the response
    const response = await client.voices.add({
      files: [fs.createReadStream(tempFilePath)],
      name: voiceName,
    });

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Send back the voice ID and other relevant data
    res.json({
      success: true,
      voiceId: response.voice_id,
      name: response.name,
    });
  } catch (err) {
    console.error("Voice cloning error:", err);
    return res.status(500).json({
      error: "Failed to clone voice",
      details: err.message,
    });
  }
});

app.post("/api/selected-voice", async (req, res) => {
  try {
    const voiceId = req.body.voiceId;
    await supabase.from("selected_voice").delete().neq("id", 0);
    const { error } = await supabase
      .from("selected_voice")
      .insert({ voice_id: voiceId });
    if (error) return res.status(400).json({ error: error.message });
    console.log(req.body);
    res.json({ success: true, voiceId: voiceId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/get-selected-voice", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("selected_voice")
      .select("*")
      .limit(1);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0].voice_id);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
