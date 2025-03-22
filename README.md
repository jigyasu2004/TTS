# VocalForge: Multi-Lingual TTS & Voice Cloning

VocalForge is a sophisticated project that combines generic text-to-speech (TTS) and personalized voice cloning, supporting both English and Hindi. It offers a user-friendly web interface built with React for the frontend and Node.js for the backend, making it accessible for users to generate high-quality, natural-sounding audio from text and create personalized voice models by uploading voice samples. The project leverages advanced TTS models to cater to diverse users, ensuring modular and maintainable code for future development.

- **Generic TTS**: Powered by the [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) model for converting text to speech in a high-quality, generic voice.
- **Personalized Voice Cloning**: Utilizes [SWivid/F5-TTS](https://github.com/SWivid/F5-TTS) for English and [SPRINGLab/F5-Hindi-24KHz](https://github.com/SPRINGLab/F5-Hindi-24KHz) for Hindi to replicate user-provided voice samples.

Whether you're looking to synthesize text into speech or clone a voice, VocalForge provides an intuitive and reliable solution with clear setup instructions and a seamless user experience.

## Features

- **Generic Text-to-Speech**: Convert any text into speech using a clear and natural generic voice, with options to play, pause, and save the audio.
- **Personalized Voice Cloning**: Upload a voice sample to create a personalized TTS model, with a demonstration mode to test the cloned voice.
- **Multilingual Support**: Supports both English and Hindi languages for broader accessibility.
- **User-Friendly Interface**: A simple web interface built with React, allowing seamless switching between generic TTS and cloned voice outputs.

## Functionality Overview

### Challenge Objectives

VocalForge addresses two core functionalities:

#### 1. Generic Text-to-Speech
- **Objective**: Implement a TTS system that converts text into speech using a high-quality, generic voice.
- **Implementation**: Uses the [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) model from Hugging Face, supporting both English and Hindi text conversion.
- **Requirements**:
  - Clear and natural audio output.
  - Basic controls for playing, pausing, and saving the generated audio.

#### 2. Personalized Voice Cloning
- **Objective**: Enable users to clone their voice by providing a sample, which the system learns and reproduces.
- **Implementation**: Employs [SWivid/F5-TTS](https://github.com/SWivid/F5-TTS) for English and [SPRINGLab/F5-Hindi-24KHz](https://github.com/SPRINGLab/F5-Hindi-24KHz) for Hindi.
- **Requirements**:
  - An interface for uploading voice samples.
  - A voice cloning algorithm to generate a personalized TTS model.
  - A demonstration mode to test the cloned voice with input text.

### Key Functionalities

- **Generic TTS**: Reliable text-to-speech conversion with high-quality audio output.
- **Voice Cloning**: High-fidelity replication of user voice samples for personalized audio synthesis.
- **Reliability**: Runs smoothly on a local machine with clear setup instructions provided below.

## Technologies Used

VocalForge leverages a modern and robust technical stack:

- **Frontend**:
  - **React with TypeScript**: For building a dynamic and responsive web interface.
  - **Vite**: For fast development and building processes.
  - **Tailwind CSS**: For modern, customizable styling.
- **Backend**:
  - **Node.js with TypeScript**: Powers the server-side logic.
  - **Likely Express**: For API routing (suggested by project configuration).
  - **Python Integration**: Handles TTS processing via Python scripts.
- **TTS Models**:
  - **Generic TTS**: [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M).
  - **Voice Cloning**:
    - English: [SWivid/F5-TTS](https://github.com/SWivid/F5-TTS).
    - Hindi: [SPRINGLab/F5-Hindi-24KHz](https://github.com/SPRINGLab/F5-Hindi-24KHz).


## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Python**: Version 3.8 or higher.
- **Node.js**: Version 16 or higher.
- **pip**: Python package manager.
- **Git**: For cloning repositories.
- **Good Internet Connection**: Required during initial inference to download models.

> **Important**: The first time you run the application, it may take several minutes to download the required models from the internet. Please be patient during this process.

## Installation Steps

Follow these steps to set up and run VocalForge on your local machine:

1. **Create and Activate a Virtual Environment**:
   ```bash
   python -m venv prodigal
   prodigal\Scripts\Activate
   ```

2. **Clone and Install F5-TTS**:
   ```bash
   git clone https://github.com/rumourscape/F5-TTS.git
   cd F5-TTS
   pip install -e .
   cd ..
   ```

3. **Install Kokoro and Soundfile**:
   ```bash
   pip install -q kokoro>=0.9.2 soundfile
   ```

4. **Clone the VocalForge Repository**:
   ```bash
   git clone https://github.com/jigyasu2004/TTS.git
   cd TTS
   ```

5. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

6. **Run the Application**:
   ```bash
   npm run dev
   ```

After running `npm run dev`, the application will start, and you can access it in your browser (see the **Usage** section below).

## Usage

Once the application is running, follow these steps to use VocalForge:

1. **Access the Web Interface**:
   - Open your web browser and navigate to `http://localhost:5000` (or the port specified in the console after running `npm run dev`).

2. **Generic TTS**:
   - Select your desired language (English or Hindi).
   - Enter the text you want to convert to speech.
   - Click the "Generate" button.
   - Use the play, pause, and save controls to interact with the generated audio.

3. **Personalized Voice Cloning**:
   - Upload a voice sample via the interface.
   - Select the language (English or Hindi).
   - Enter the text you want to synthesize with the cloned voice.
   - Click the "Generate" button to create the audio.
   - Use the demonstration mode to test and listen to the cloned voice output.

## Project Structure

The repository is organized into key directories and files for a clear separation of frontend and backend logic:

- **/client**: Frontend code.
  - `/src`: Contains React components and pages.
    - `/src/App.tsx`: Main application component rendering the UI.
    - `/src/main.tsx`: Entry point for the React application.
    - `/src/components`: Reusable UI components.
    - `/src/index.css`: Stylesheet using Tailwind CSS.
- **/server**: Backend code.
  - `index.ts`: Entry point for the Node.js server.
  - `routes.ts`: Defines API endpoints for TTS and cloning functionalities.
  - `tts-service.ts`: Manages TTS processing, interfacing with Python scripts.
  - `/scripts`: Python scripts (e.g., `generate_tts.py`) for audio generation.
- **Root Files**:
  - `package.json`: Manages Node.js dependencies and scripts.
  - `tsconfig.json`: Configures TypeScript for the project.
  - `vite.config.ts`: Vite configuration for building the frontend.
  - `tailwind.config.ts`: Tailwind CSS configuration.
  - `drizzle.config.ts`: Database configuration with Drizzle ORM (if applicable).

This structure ensures a full-stack application with distinct frontend and backend responsibilities, enhanced by Python for TTS processing.

## Acknowledgements

VocalForge builds upon the work of several amazing projects and communities:

- **[hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)**: For generic TTS capabilities.
- **[SWivid/F5-TTS](https://github.com/SWivid/F5-TTS)**: For English voice cloning.
- **[SPRINGLab/F5-Hindi-24KHz](https://github.com/SPRINGLab/F5-Hindi-24KHz)**: For Hindi voice cloning.
- **[React](https://reactjs.org/)**: For the frontend framework.
- **[Node.js](https://nodejs.org/)**: For the backend runtime.
- **[Vite](https://vitejs.dev/)**: For fast development tooling.
- **[Tailwind CSS](https://tailwindcss.com/)**: For styling.

Thank you to these projects and their contributors for making VocalForge possible!

