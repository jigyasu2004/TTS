# TTS Quick Start Guide

This guide will help you quickly set up and run the TTS project.

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
git clone https://github.com/jigyasu2004/TTS.git
git clone https://github.com/rumourscape/F5-TTS.git
cd F5-TTS
pip install -e .
cd ..
pip install -q kokoro>=0.9.2 soundfile
apt-get -qq -y install espeak-ng > /dev/null 2>&1
cd TTS
npm install
npm run dev
