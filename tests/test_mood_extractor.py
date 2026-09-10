import sys
from pathlib import Path
# Add the src/ folder itself to sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent / "src"))
from mood_extractor import run_mood_extractor
print("Calling extractor...")
result = run_mood_extractor("I've been really stressed about work and haven't slept well.")
print(result)