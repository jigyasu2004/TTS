# VocalForge: Multi-Lingual TTS & Voice Cloning

This project is a comprehensive voice cloning solution that combines generic text-to-speech (TTS) with personalized voice cloning capabilities. It leverages three specialized models:

- **hexgrad/Kokoro-82M** for generic TTS.
- **SWivid/F5-TTS** for personalized English voice cloning.
- **SPRINGLab/F5-Hindi-24KHz** for personalized Hindi voice cloning.

The application features an intuitive web interface built with React and Node.js, allowing users to easily switch between generic and cloned voice outputs. This integration demonstrates high-quality audio synthesis with clear and natural speech, supporting both English and Hindi languages while ensuring modular and maintainable code for further development.

## Functionality Overview

### Challenge Objectives

The solution addresses two core tasks:

#### 1. Generic Text-to-Speech
- **Objective:**  
  Implement a TTS model that converts any given text into speech using a high-quality, generic voice.
- **Requirements:**
  - Use an established TTS framework. In this project, we utilize the [hexgrad/Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) model from Hugging Face, which converts both Hindi and English text into speech.
  - Ensure the audio output is clear and natural.
  - Include basic controls such as play, pause, and save audio.

#### 2. Personalized Voice Cloning
- **Objective:**  
  Enable voice cloning by allowing the system to learn and reproduce a user’s voice.
- **Requirements:**
  - Create an interface where users can provide their voice sample.
  - Implement or integrate a voice cloning algorithm that can generate a personalized TTS model.
  - Provide a demonstration mode where the cloned voice is used to read input text.
  - Use the following models for personalized voice cloning:
    - **SWivid/F5-TTS** for personalized English voice cloning.
    - **SPRINGLab/F5-Hindi-24KHz** for personalized Hindi voice cloning.

### Key Functionalities

- **Generic TTS Implementation:**  
  Converts text to speech using a generic voice with clear and natural audio output.
- **Voice Cloning Quality:**  
  Achieves high fidelity in replicating the input voice sample.
- **Reliability:**  
  Runs without errors on a local machine, supported by clear setup instructions.

### User Interface

- Developed a simple, user-friendly interface that demonstrates both functionalities.
- **Tech Stack:**
  - **Frontend:** Built with React.
  - **Backend:** Powered by Node.js.
- The interface allows users to seamlessly switch between generic TTS and cloned voice options.



## Prerequisites

Make sure you have the following installed:
- **Python** (version 3.8 or higher)
- **Node.js** (version 16 or higher)
- **pip** (Python package manager)
- **Git** (for cloning repositories)




## Installation Steps

Follow these steps to set up and run the TTS project:

### 1. Clone the Repositories

```bash
git clone https://github.com/rumourscape/F5-TTS.git
cd F5-TTS
pip install -e .
cd ..

pip install -q kokoro>=0.9.2 soundfile

git clone https://github.com/jigyasu2004/TTS.git
cd TTS
npm install
npm run dev
