#!/usr/bin/env python3
"""
Flux image generation tool via NVIDIA NIM API.
Usage: python tools/cantos/flux.py "prompt" output/path.png [--width W] [--height H]
Default aspect ratio: 16:9 (1280x720)
"""

import argparse
import base64
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

INVOKE_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"

def load_api_key():
    env_path = Path(__file__).parent.parent.parent / ".env"
    load_dotenv(env_path)
    key = os.getenv("FLUX_IMAGE_GENERATION_API_KEY")
    if not key:
        print("Error: FLUX_IMAGE_GENERATION_API_KEY not found in .env", file=sys.stderr)
        sys.exit(1)
    return key

def generate_image(prompt: str, output_path: str, width: int = 1280, height: int = 720):
    api_key = load_api_key()

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "prompt": prompt,
        "width": width,
        "height": height,
        "cfg_scale": 1.0,
        "seed": 0,
        "steps": 4,
    }

    print(f"Generating image: \"{prompt}\"")
    print(f"Dimensions: {width}x{height}")
    print(f"Output: {output_path}")

    response = requests.post(INVOKE_URL, headers=headers, json=payload, timeout=120)

    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.text}", file=sys.stderr)
        sys.exit(1)

    data = response.json()

    # NVIDIA NIM returns artifacts list with base64-encoded image
    artifacts = data.get("artifacts")
    if artifacts and len(artifacts) > 0:
        image_b64 = artifacts[0].get("base64")
    else:
        print(f"Unexpected response format: {data}", file=sys.stderr)
        sys.exit(1)

    if not image_b64:
        print(f"No image data in response: {data}", file=sys.stderr)
        sys.exit(1)

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(base64.b64decode(image_b64))
    print(f"Saved to {out.resolve()}")

def main():
    parser = argparse.ArgumentParser(description="Generate an image with Flux via NVIDIA NIM")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument("output", help="Output file path (e.g. .tmp/image.png)")
    parser.add_argument("--width", type=int, default=1280, help="Image width (default: 1280)")
    parser.add_argument("--height", type=int, default=720, help="Image height (default: 720)")
    args = parser.parse_args()

    generate_image(args.prompt, args.output, args.width, args.height)

if __name__ == "__main__":
    main()
