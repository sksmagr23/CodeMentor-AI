"""
Dry-Run Image Generation Service for CodeMentor AI.
Generates step-by-step algorithm visual diagrams using Gemini Image Generation
with a clean SVG fallback renderer for high availability.
"""
import os
import base64
import logging
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv
from backend.agents.prompts import build_dry_run_image_prompt

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def generate_educational_svg_diagram(
    problem_title: str,
    algorithm: str,
    input_str: str,
    steps: List[str],
) -> str:
    """
    High-quality SVG educational diagram fallback.
    Renders an algorithm trace card with dark developer aesthetic.
    """
    svg_steps = ""
    y_pos = 140
    for idx, step in enumerate(steps[:6]):
        safe_step = step.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
        svg_steps += f"""
        <g transform="translate(40, {y_pos})">
            <rect width="720" height="38" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
            <circle cx="25" cy="19" r="10" fill="#3B82F6"/>
            <text x="25" y="23" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" text-anchor="middle">{idx + 1}</text>
            <text x="48" y="23" fill="#E2E8F0" font-family="'JetBrains Mono', monospace" font-size="12">{safe_step}</text>
        </g>
        """
        y_pos += 46

    height = max(420, y_pos + 40)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 {height}" width="100%" height="100%">
    <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0B0F17" />
            <stop offset="100%" stop-color="#111827" />
        </linearGradient>
        <linearGradient id="header-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="800" height="{height}" rx="12" fill="url(#bg-grad)" stroke="#1E293B" stroke-width="2"/>

    <!-- Header Banner -->
    <rect x="0" y="0" width="800" height="60" rx="12" fill="#0F172A" />
    <path d="M0 12 Q0 0 12 0 L788 0 Q800 0 800 12 L800 60 L0 60 Z" fill="#0F172A"/>
    <text x="40" y="38" fill="#F8FAFC" font-family="'Space Grotesk', sans-serif" font-size="20" font-weight="700">CodeMentor Dry-Run Trace: {problem_title[:35]}</text>
    
    <!-- Meta badges -->
    <g transform="translate(40, 80)">
        <rect width="180" height="28" rx="6" fill="#1E293B" stroke="#06B6D4" stroke-width="1"/>
        <text x="90" y="18" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="bold" text-anchor="middle">Algorithm: {algorithm[:16]}</text>
    </g>

    <g transform="translate(240, 80)">
        <rect width="280" height="28" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
        <text x="140" y="18" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="11" text-anchor="middle">Input: {input_str[:28]}</text>
    </g>

    <!-- Execution Steps -->
    {svg_steps}

    <!-- Footer -->
    <text x="40" y="{height - 20}" fill="#64748B" font-family="'DM Sans', sans-serif" font-size="11">Conceptual Dry Run • CodeMentor AI</text>
</svg>"""

    encoded = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{encoded}"


async def generate_dry_run_image(
    problem_title: str,
    algorithm: str,
    input_str: str,
    steps: List[str],
    problem_statement: str = "",
) -> str:
    """
    Generate an educational visual diagram for an algorithm dry run.
    First attempts Gemini multimodal image generation (`gemini-2.5-flash-image`).
    If unavailable or rate-limited, safely falls back to SVG vector diagram.
    """
    if not GEMINI_API_KEY:
        logger.warning("[DryRunImage] No GEMINI_API_KEY set, using SVG fallback.")
        return generate_educational_svg_diagram(problem_title, algorithm, input_str, steps)

    prompt = build_dry_run_image_prompt(problem_title, algorithm, input_str, steps)
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
        )

        if response and response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data and part.inline_data.data:
                    img_bytes = part.inline_data.data
                    mime = part.inline_data.mime_type or "image/png"
                    b64_str = base64.b64encode(img_bytes).decode("utf-8")
                    logger.info("[DryRunImage] Successfully generated image via gemini-2.5-flash-image")
                    return f"data:{mime};base64,{b64_str}"

        logger.warning("[DryRunImage] Gemini returned no inline image data, falling back to SVG.")
        return generate_educational_svg_diagram(problem_title, algorithm, input_str, steps)

    except Exception as e:
        logger.warning(f"[DryRunImage] Error in Gemini image generation ({e}), using high-res SVG fallback.")
        return generate_educational_svg_diagram(problem_title, algorithm, input_str, steps)
